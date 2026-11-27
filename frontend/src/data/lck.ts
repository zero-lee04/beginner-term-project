/* LCK 데이터 */

import rosterData2027 from '../../data/lck-rosters-2027.json'
import rosterData2026 from '../../data/lck-rosters-2026.json'
import rosterData2025 from '../../data/lck-rosters-2025.json'
import rosterData2024 from '../../data/lck-rosters-2024.json'
import rosterData2023 from '../../data/lck-rosters-2023.json'
import rosterData2022 from '../../data/lck-rosters-2022.json'
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

export function getTeamLogoSource(team: Pick<Team, 'id' | 'logo'>) {
  const logo = team.logo ?? `teams/${team.id}.png`
  if (/^(https?:|data:|blob:)/i.test(logo)) return logo
  return `${import.meta.env.BASE_URL}${logo.replace(/^\/+/, '')}`
}

export function getSeasonRosterData(season: number) {
  return [rosterData2027, rosterData2026, rosterData2025, rosterData2024, rosterData2023, rosterData2022]
    .find((seasonData) => seasonData.season === season) ?? null
}

export function getCareerPlayerOptions(): CareerPlayer[] {
  const players = new Map<string, CareerPlayer>()
  const seasons = [rosterData2027, rosterData2026, rosterData2025, rosterData2024, rosterData2023, rosterData2022]

  for (const seasonData of seasons) {
    for (const team of seasonData.teams) {
      for (const player of team.players) {
        const name = player.name.trim()
        if (!name || name.toLowerCase() === 'free agent') continue
        const key = name.toLowerCase()
        const existing = players.get(key)
        if (!existing || (!existing.koreanName && player.koreanName)) {
          players.set(key, { name, koreanName: player.koreanName.trim() })
        }
      }
    }
  }

  return Array.from(players.values()).sort((first, second) => first.name.localeCompare(second.name))
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
  const seasons = [rosterData2022, rosterData2023, rosterData2024, rosterData2025, rosterData2026, rosterData2027]
  const career: CareerEntry[] = []

  for (const seasonData of seasons) {
    for (const team of seasonData.teams) {
      const matchingPlayers = team.players.filter((candidate) => {
        if (candidate.name.trim().toLowerCase() === 'free agent') return false
        // Prefer the unique in-game name. Korean names can collide across players
        // (for example Chovy and the 2023 DK CL mid laner Pullbae).
        return normalizedName
          ? candidate.name.trim().toLowerCase() === normalizedName
          : Boolean(normalizedKoreanName && candidate.koreanName.trim() === normalizedKoreanName)
      })
      const uniquePlayers = new Map<string, (typeof matchingPlayers)[number]>()

      for (const candidate of matchingPlayers) {
        const league = candidate.league ?? 'LCK'
        const key = `${league}-${candidate.role}`
        const existing = uniquePlayers.get(key)
        if (!existing || (existing.league ?? 'LCK CL') !== 'LCK') uniquePlayers.set(key, candidate)
      }

      for (const candidate of uniquePlayers.values()) {
        const teamLogo = 'logo' in team && typeof team.logo === 'string' ? team.logo : undefined
        career.push({
          season: seasonData.season,
          teamId: team.id,
          teamName: team.name,
          teamShortName: team.shortName,
          accent: team.accent,
          league: candidate.league ?? 'LCK',
          role: candidate.label,
          label: candidate.role,
          teamLogo: getTeamLogoSource({ id: team.id, logo: teamLogo }),
          teamMark: team.mark,
        })
      }
    }
  }

  // Keep roster-backed Taeyoon entries and add only the missing season history.
  if (normalizedName === 'taeyoon' || normalizedKoreanName === '김태윤') {
    // The 2024 annual roster has Taeyoon under KDF's LCK team; his career was
    // with KDF Challengers that year, so replace that one derived entry.
    for (let index = career.length - 1; index >= 0; index -= 1) {
      const entry = career[index]
      if (entry.season === 2024 && entry.teamId === 'kdf' && entry.league === 'LCK') {
        career.splice(index, 1)
      }
    }

    career.push(
      { season: 2024, teamId: 'kdf', teamName: 'KDF Challengers', teamShortName: 'KDF CL', accent: '#ff6b00', league: 'LCK CL', role: '바텀', label: 'BOT', teamLogo: getTeamLogoSource({ id: 'kdf', logo: '/teams/kwangdong-2024.png' }), teamMark: 'KDF' },
      { season: 2025, teamId: 'team-we', teamName: 'Team WE', teamShortName: 'WE', accent: '#d71920', league: 'LPL', role: '바텀', label: 'BOT', teamMark: 'WE' },
      { season: 2026, teamId: 'bnk', teamName: 'BNK FEARX', teamShortName: 'BFX', accent: '#ff8a28', league: 'LCK', role: '바텀', label: 'BOT', teamLogo: getTeamLogoSource({ id: 'bnk' }), teamMark: 'F' },
    )
  }

  // Sharvel moved from DK Challengers to the DN SOOPers LCK team during 2026.
  if (normalizedName === 'sharvel' && !career.some((entry) =>
    entry.season === 2026 && entry.teamId === 'dn' && entry.league === 'LCK'
  )) {
    career.push({
      season: 2026,
      teamId: 'dn',
      teamName: 'DN SOOPers',
      teamShortName: 'DNS',
      accent: '#0C50F1',
      league: 'LCK',
      role: '정글',
      label: 'JUNGLE',
      teamLogo: getTeamLogoSource({ id: 'dn' }),
      teamMark: 'DN',
    })
  }

  if (normalizedName === 'ruler' || normalizedKoreanName === '박재혁') {
    for (const season of [2023, 2024]) {
      career.push({
        season,
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

  return career.sort((first, second) => {
    if (first.season !== second.season) return first.season - second.season

    if (normalizedName === 'taeyoon' || normalizedKoreanName === '김태윤') {
      const teamOrder: Record<number, string[]> = {
        2023: ['kdf'],
        2024: ['kdf:LCK CL'],
        2025: ['team-we'],
        2026: ['nongshim', 'bnk'],
        2027: ['kt'],
      }
      const seasonOrder = teamOrder[first.season] ?? []
      const orderOf = (entry: CareerEntry) => seasonOrder.indexOf(
        entry.teamId === 'kdf' ? `${entry.teamId}:${entry.league}` : entry.teamId,
      )
      return orderOf(first) - orderOf(second)
    }

    return (first.league === 'LCK CL' ? -1 : second.league === 'LCK CL' ? 1 : 0)
      || first.teamName.localeCompare(second.teamName)
  })
}
