import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const frontendDirectory = resolve(scriptDirectory, '..')
const dataDirectory = resolve(frontendDirectory, 'data')
const firebaseConfigPath = resolve(frontendDirectory, '..', '.firebaserc')

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
const requestedYear = process.argv[2]
if (requestedYear && !/^\d{4}$/.test(requestedYear)) throw new Error('연도는 4자리 숫자로 입력하세요. 예: npm run seed:rosters -- 2027')
const archiveFiles = dataFiles.filter((fileName) => {
  const archiveMatch = fileName.match(/^lck-(rosters|offseason)-(\d{4})\.json$/)
  return archiveMatch && (!requestedYear || archiveMatch[2] === requestedYear)
})
if (archiveFiles.length === 0) {
  throw new Error(requestedYear
    ? `${requestedYear}년 로스터 또는 스토브리그 JSON 파일이 data 폴더에 없습니다.`
    : 'data 폴더에 lck-rosters-YYYY.json 또는 lck-offseason-YYYY.json 파일이 없습니다.')
}

const writes = []
const seededArchives = []

for (const fileName of archiveFiles) {
  const roster = JSON.parse(await readFile(resolve(dataDirectory, fileName), 'utf8'))
  const year = Number(fileName.match(/(\d{4})/)?.[1])
  const kind = fileName.startsWith('lck-offseason-') ? 'offseason' : 'season'
  const archiveCollection = kind === 'offseason' ? 'offseasons' : 'seasons'
  const source = roster.source ?? ''
  const teams = roster.teams

  if (Number(kind === 'offseason' ? roster.year : roster.season) !== year) throw new Error(`${fileName}의 연도 값이 파일 이름과 다릅니다.`)
  if (!Array.isArray(teams) || teams.length !== 10) throw new Error(`${fileName}에는 팀 10개가 있어야 합니다.`)
  seededArchives.push(`${year} ${kind}`)

  const archiveDocument = `projects/${projectId}/databases/(default)/documents/${archiveCollection}/${year}`
  writes.push({
    update: {
      name: archiveDocument,
      fields: {
        year: firestoreValue(year),
        kind: firestoreValue(kind),
        source: firestoreValue(source),
      },
    },
  })

  for (const team of teams) {
    if (!team.id || !team.name || !Array.isArray(team.players) || (kind === 'season' && team.players.length < 5)) {
      throw new Error(`${year} ${team.name ?? '알 수 없는 팀'}의 팀 정보 또는 선수 구성이 올바르지 않습니다.`)
    }

    const teamDocument = `${archiveDocument}/teams/${team.id}`
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

    if (kind === 'season') {
      for (const oldPlayerId of ['top', 'jungle', 'mid', 'bot', 'support']) {
        writes.push({ delete: `${teamDocument}/players/${oldPlayerId}` })
      }

      team.players.forEach((player, index) => {
        const playerId = `${player.role.toLowerCase()}-${String(index + 1).padStart(2, '0')}`
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

  if (kind === 'offseason') {
    if (!Array.isArray(roster.transfers ?? [])) {
      throw new Error(`${fileName}의 transfers는 배열이어야 합니다.`)
    }

    for (const [index, transfer] of (roster.transfers ?? []).entries()) {
      if (!transfer.status || !transfer.player) {
        throw new Error(`${year} 스토브리그 ${index + 1}번째 항목에 status와 player가 필요합니다.`)
      }

      const transferId = String(transfer.id ?? `move-${String(index + 1).padStart(3, '0')}`)
      const transferDocument = `${archiveDocument}/transfers/${transferId}`
      const teamNames = `${transfer.originalTeam ?? ''} ${transfer.contractTeam ?? ''}`
      const inferredDivision = /챌린저스|유스|아카데미|Academy|Challengers/i.test(teamNames) ? 'LCK CL' : 'LCK'
      const division = String(transfer.division ?? inferredDivision)
      if (!['LCK', 'LCK CL'].includes(division)) {
        throw new Error(`${year} 스토브리그 ${transfer.player}의 division은 LCK 또는 LCK CL이어야 합니다.`)
      }
      writes.push({
        update: {
          name: transferDocument,
          fields: {
            division: firestoreValue(division),
            status: firestoreValue(String(transfer.status)),
            player: firestoreValue(String(transfer.player)),
            role: firestoreValue(String(transfer.role ?? '')),
            originalTeam: firestoreValue(String(transfer.originalTeam ?? '')),
            contractTeam: firestoreValue(String(transfer.contractTeam ?? '')),
            ...(transfer.contractLength ? { contractLength: firestoreValue(String(transfer.contractLength)) } : {}),
            sortOrder: firestoreValue(Number.isInteger(transfer.sortOrder) ? transfer.sortOrder : index + 1),
          },
        },
      })
    }
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

console.log(`${projectId} Firestore에 ${seededArchives.join(', ')} 데이터를 등록했습니다 (${writes.length}개 문서 작업).`)
