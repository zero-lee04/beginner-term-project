/* LCK 데이터 */

import rosterData2027 from '../../data/lck-rosters-2027.json'
import rosterData2026 from '../../data/lck-rosters-2026.json'
import rosterData2025 from '../../data/lck-rosters-2025.json'
import type { CareerEntry, CareerPlayer, RosterPlayer, Team } from '../types'

export const teams: Team[] = [
  { id: 't1', name: 'T1', shortName: 'T1', mark: 'T1', accent: '#e84048', motto: 'Limitless: Never Ending Story' },
  { id: 'gen-g', name: 'Gen.G', shortName: 'GEN', mark: 'G', accent: '#cfaa43', motto: 'CHANGE THE GAME, CHANGE THE WORLD' },
  { id: 'hle', name: 'Hanwha Life Esports', shortName: 'HLE', mark: 'H', accent: '#ff702d', motto: 'BeyondTheChallenge' },
  { id: 'kt', name: 'KT Rolster', shortName: 'KT', mark: 'KT', accent: '#ed2939', motto: 'BreakTheLimits' },
  { id: 'dk', name: 'Dplus KIA', shortName: 'DK', mark: 'DK', accent: '#7e9cff', motto: 'ShowMeYourMadness' },
  { id: 'bnk', name: 'BNK FEARX', shortName: 'BFX', mark: 'F', accent: '#ff8a28', motto: 'NoDoubt' },
  { id: 'drx', name: 'KIWOOM DRX', shortName: 'DRX', mark: 'D', accent: '#5b9dff', motto: 'Unbreakables' },
  { id: 'nongshim', name: 'NS RedForce', shortName: 'NS', mark: 'N', accent: '#e53d48', motto: 'TheUltimateRed' },
  { id: 'brion', name: 'HANJIN BRION', shortName: 'BRO', mark: 'B', accent: '#70bd56', motto: 'DeliverTheMoment' },
  { id: 'dn', name: 'DN SOOPers', shortName: 'DNS', mark: 'DN', accent: '#0C50F1', motto: 'STAY SHARP' },
]

export function getSeasonRosterData(season: number) {
  return season === rosterData2027.season
    ? rosterData2027
    : season === rosterData2025.season
      ? rosterData2025
      : season === rosterData2026.season
        ? rosterData2026
        : null
}

export function getLocalRoster(season: number, teamId: string): RosterPlayer[] {
  const team = getSeasonRosterData(season)?.teams.find((rosterTeam) => rosterTeam.id === teamId)
  return (team?.players ?? []).map((player, index) => ({
    id: `${teamId}-${player.role}-${index}`,
    league: player.league ?? 'LCK',
    role: player.role,
    label: player.label,
    name: player.name,
    koreanName: player.koreanName,
    number: String(index + 1).padStart(2, '0'),
    sortOrder: index + 1,
  }))
}

export function getPlayerCareer(player: CareerPlayer): CareerEntry[] {
  const normalizedName = player.name.trim().toLowerCase()
  const normalizedKoreanName = player.koreanName.trim()
  const seasons = [rosterData2025, rosterData2026, rosterData2027]
  const career: CareerEntry[] = []

  for (const seasonData of seasons) {
    for (const team of seasonData.teams) {
      const matchingPlayers = team.players.filter((candidate) => {
        if (candidate.name.trim().toLowerCase() === 'free agent') return false
        return candidate.name.trim().toLowerCase() === normalizedName
          || Boolean(normalizedKoreanName && candidate.koreanName.trim() === normalizedKoreanName)
      })
      const uniquePlayers = new Map<string, (typeof matchingPlayers)[number]>()

      for (const candidate of matchingPlayers) {
        const league = candidate.league ?? 'LCK'
        const key = `${league}-${candidate.role}`
        const existing = uniquePlayers.get(key)
        if (!existing || (existing.league ?? 'LCK CL') !== 'LCK') uniquePlayers.set(key, candidate)
      }

      for (const candidate of uniquePlayers.values()) {
        career.push({
          season: seasonData.season,
          teamId: team.id,
          teamName: team.name,
          teamShortName: team.shortName,
          accent: team.accent,
          league: candidate.league ?? 'LCK',
          role: candidate.label,
          label: candidate.role,
        })
      }
    }
  }

  if (normalizedName === 'peyz' || normalizedKoreanName === '김수환') {
    career.push({
      season: 2025,
      teamId: 'jdg',
      teamName: 'JD Gaming',
      teamShortName: 'JDG',
      accent: '#d71920',
      league: 'LPL',
      role: '바텀',
      label: 'BOT',
      teamMark: 'JDG',
    })
  }

  return career.sort((first, second) => first.season - second.season || first.teamName.localeCompare(second.teamName))
}
