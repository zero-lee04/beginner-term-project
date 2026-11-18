import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const frontendDirectory = resolve(scriptDirectory, '..')
const dataDirectory = resolve(frontendDirectory, 'data')
const firebaseConfigPath = resolve(frontendDirectory, '.firebaserc')

function getAccessToken() {
  try {
    const installedGcloud = process.env.USERPROFILE
      ? join(process.env.USERPROFILE, 'AppData', 'Local', 'Google', 'Cloud SDK', 'google-cloud-sdk', 'bin', 'gcloud.cmd')
      : ''
    const gcloudCommand = installedGcloud && existsSync(installedGcloud)
      ? `"${installedGcloud}" auth application-default print-access-token`
      : 'gcloud auth application-default print-access-token'

    return execSync(gcloudCommand, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim()
  } catch {
    throw new Error('gcloud ADC 인증을 찾지 못했습니다. `gcloud auth application-default login`을 먼저 실행하세요.')
  }
}

function firestoreValue(value) {
  if (typeof value === 'string') return { stringValue: value }
  if (typeof value === 'number' && Number.isInteger(value)) return { integerValue: String(value) }
  throw new TypeError(`지원하지 않는 Firestore 값입니다: ${String(value)}`)
}

const [dataFiles, firebaseConfig] = await Promise.all([
  readdir(dataDirectory),
  readFile(firebaseConfigPath, 'utf8').then(JSON.parse),
])

const projectId = firebaseConfig.projects?.default
if (!projectId) throw new Error('.firebaserc에서 기본 Firebase 프로젝트를 찾지 못했습니다.')
const rosterFiles = dataFiles.filter((fileName) => /^lck-rosters-\d{4}\.json$/.test(fileName))
if (rosterFiles.length === 0) throw new Error('data 폴더에 lck-rosters-YYYY.json 파일이 없습니다.')

const writes = []
const seededSeasons = []

for (const fileName of rosterFiles) {
  const roster = JSON.parse(await readFile(resolve(dataDirectory, fileName), 'utf8'))
  const fileSeason = Number(fileName.match(/(\d{4})/)?.[1])
  const { season, source, teams } = roster

  if (Number(season) !== fileSeason) throw new Error(`${fileName}의 season 값이 파일 이름과 다릅니다.`)
  if (!Array.isArray(teams) || teams.length !== 10) throw new Error(`${fileName}에는 팀 10개가 있어야 합니다.`)
  seededSeasons.push(season)

  const seasonDocument = `projects/${projectId}/databases/(default)/documents/seasons/${season}`
  writes.push({
    update: {
      name: seasonDocument,
      fields: {
        year: firestoreValue(season),
        source: firestoreValue(source),
      },
    },
  })

  for (const team of teams) {
    if (!team.id || !team.name || !Array.isArray(team.players) || team.players.length !== 5) {
      throw new Error(`${season} ${team.name ?? '알 수 없는 팀'}의 정보 또는 선수 5명 구성이 올바르지 않습니다.`)
    }

    const teamDocument = `${seasonDocument}/teams/${team.id}`
    writes.push({
      update: {
        name: teamDocument,
        fields: {
          name: firestoreValue(team.name),
          shortName: firestoreValue(team.shortName ?? team.name),
          mark: firestoreValue(team.mark ?? team.shortName ?? team.name.slice(0, 1)),
          accent: firestoreValue(team.accent ?? '#e84048'),
          motto: firestoreValue(team.motto ?? ''),
        },
      },
    })

    team.players.forEach((player, index) => {
      const playerId = player.role.toLowerCase()
      writes.push({
        update: {
          name: `${teamDocument}/players/${playerId}`,
          fields: {
            role: firestoreValue(player.role),
            label: firestoreValue(player.label),
            name: firestoreValue(player.name),
            koreanName: firestoreValue(player.koreanName),
            number: firestoreValue(String(index + 1).padStart(2, '0')),
            sortOrder: firestoreValue(index + 1),
          },
        },
      })
    })
  }
}

const accessToken = getAccessToken()
const endpoint = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents:commit`
for (let offset = 0; offset < writes.length; offset += 400) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ writes: writes.slice(offset, offset + 400) }),
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Firestore 등록 실패 (${response.status}): ${details}`)
  }
}

console.log(`${projectId} Firestore에 ${seededSeasons.join(', ')} 시즌 데이터를 등록했습니다 (${writes.length}개 문서).`)
