import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { initializeApp } from 'firebase/app'
import { doc, getFirestore, setDoc } from 'firebase/firestore'

const scriptDirectory = new URL('.', import.meta.url)
const dataPath = fileURLToPath(new URL('../data/lck-rosters-2026.json', scriptDirectory))
const rosterData = JSON.parse(await readFile(dataPath, 'utf8'))

const firebaseConfig = {
  apiKey: 'AIzaSyBazFQ2zMXLcvtDcLLQJkKrRvOvBxBSbnY',
  authDomain: 'beginner-project-zero.firebaseapp.com',
  projectId: 'beginner-project-zero',
  storageBucket: 'beginner-project-zero.firebasestorage.app',
  messagingSenderId: '220744950640',
  appId: '1:220744950640:web:280fe53d29194808f6a5b5',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const seasonId = String(rosterData.season)

await setDoc(doc(db, 'seasons', seasonId), {
  year: rosterData.season,
  source: rosterData.source,
})

let uploadedPlayers = 0

for (const [teamIndex, team] of rosterData.teams.entries()) {
  const teamReference = doc(db, 'seasons', seasonId, 'teams', team.id)
  const { players, ...teamFields } = team

  await setDoc(teamReference, { ...teamFields, sortOrder: teamIndex + 1 }, { merge: true })

  for (const [playerIndex, player] of players.entries()) {
    const playerId = `${player.role.toLowerCase()}-${player.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    await setDoc(doc(teamReference, 'players', playerId), {
      ...player,
      number: String(playerIndex + 1).padStart(2, '0'),
      sortOrder: playerIndex + 1,
    }, { merge: true })
    uploadedPlayers += 1
  }
}

console.log(`Uploaded ${rosterData.teams.length} teams and ${uploadedPlayers} players to Firestore season ${seasonId}.`)
process.exit(0)
