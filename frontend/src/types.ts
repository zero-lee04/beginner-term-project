export type Team = {
  id: string
  name: string
  shortName: string
  mark: string
  accent: string
  motto: string
  logo?: string
}

export type RosterPlayer = {
  id: string
  league: string
  role: string
  label: string
  name: string
  koreanName: string
  number: string
  sortOrder: number
}

export type StaffMember = {
  league: string
  role: string
  name: string
}

export type CareerEntry = {
  season: number
  teamId: string
  teamName: string
  teamShortName: string
  accent: string
  league: string
  role: string
  label: string
}

export type CareerPlayer = Pick<RosterPlayer, 'name' | 'koreanName'>

export type TransferMove = {
  id: string
  division: string
  status: string
  player: string
  role: string
  originalTeam: string
  contractTeam: string
}
