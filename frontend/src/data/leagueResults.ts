export type LeagueFinalist = {
  id: string
  name: string
  shortName: string
  result: '우승' | '준우승'
  logo?: string
  imagePath?: string
}

export type LeagueEvent = {
  name: string
  finalists: [LeagueFinalist, LeagueFinalist]
}

export type LeagueSeason = {
  year: number
  events: LeagueEvent[]
}

export type LeagueResultRecord = LeagueFinalist & {
  year: number
  eventName: string
}

const teamLogos: Record<string, string> = {
  'gen-g': 'teams/gen-g.png',
  t1: 'teams/t1.png',
  hle: 'teams/hle.png',
  kt: 'teams/kt.png',
  dk: 'teams/dk.png',
  drx: 'teams/drx.png',
  bnk: 'teams/bnk.png',
  rng: 'teams/rng.png',
  jdg: 'teams/jdg.png',
  bilibili: 'teams/blg.png',
  edg: 'teams/edg.png',
  weibo: 'teams/wbg.png',
}

function finalTeams(
  champion: Omit<LeagueFinalist, 'result'>,
  runnerUp: Omit<LeagueFinalist, 'result'>,
): [LeagueFinalist, LeagueFinalist] {
  return [
    { ...champion, result: '우승', logo: champion.logo ?? teamLogos[champion.id] },
    { ...runnerUp, result: '준우승', logo: runnerUp.logo ?? teamLogos[runnerUp.id] },
  ]
}

const team = (id: string, name: string, shortName = name) => ({ id, name, shortName })

export const leagueSeasons: LeagueSeason[] = [
  {
    year: 2022,
    events: [
      { name: 'LCK 스프링', finalists: finalTeams(team('t1', 'T1'), team('gen-g', 'Gen.G', 'GEN')) },
      { name: 'LCK 서머', finalists: finalTeams(team('gen-g', 'Gen.G', 'GEN'), team('t1', 'T1')) },
      { name: 'MSI', finalists: finalTeams(team('rng', 'Royal Never Give Up', 'RNG'), team('t1', 'T1')) },
      { name: '월드 챔피언십', finalists: finalTeams(team('drx', 'DRX'), team('t1', 'T1')) },
    ],
  },
  {
    year: 2026,
    events: [
      { name: 'LCK 컵', finalists: finalTeams(team('gen-g', 'Gen.G', 'GEN'), team('bnk', 'BNK FEARX', 'BFX')) },
      { name: 'LCK 시즌', finalists: finalTeams(team('gen-g', 'Gen.G', 'GEN'), team('hle', 'Hanwha Life Esports', 'HLE')) },
      { name: 'MSI', finalists: finalTeams(team('hle', 'Hanwha Life Esports', 'HLE'), team('bilibili', 'Bilibili Gaming', 'BLG')) },
      { name: '월드 챔피언십', finalists: finalTeams(team('bilibili', 'Bilibili Gaming', 'BLG'), team('gen-g', 'Gen.G', 'GEN')) },
    ],
  },
  {
    year: 2025,
    events: [
      { name: 'LCK 컵', finalists: finalTeams(team('hle', 'Hanwha Life Esports', 'HLE'), team('gen-g', 'Gen.G', 'GEN')) },
      { name: 'LCK 시즌', finalists: finalTeams(team('gen-g', 'Gen.G', 'GEN'), team('hle', 'Hanwha Life Esports', 'HLE')) },
      { name: 'MSI', finalists: finalTeams(team('gen-g', 'Gen.G', 'GEN'), team('t1', 'T1')) },
      { name: '월드 챔피언십', finalists: finalTeams(team('t1', 'T1'), team('kt', 'KT Rolster', 'KT')) },
    ],
  },
  {
    year: 2024,
    events: [
      { name: 'LCK 스프링', finalists: finalTeams(team('gen-g', 'Gen.G', 'GEN'), team('t1', 'T1')) },
      { name: 'LCK 서머', finalists: finalTeams(team('hle', 'Hanwha Life Esports', 'HLE'), team('gen-g', 'Gen.G', 'GEN')) },
      { name: 'MSI', finalists: finalTeams(team('gen-g', 'Gen.G', 'GEN'), team('bilibili', 'Bilibili Gaming', 'BLG')) },
      { name: '월드 챔피언십', finalists: finalTeams(team('t1', 'T1'), team('bilibili', 'Bilibili Gaming', 'BLG')) },
    ],
  },
  {
    year: 2023,
    events: [
      { name: 'LCK 스프링', finalists: finalTeams(team('gen-g', 'Gen.G', 'GEN'), team('t1', 'T1')) },
      { name: 'LCK 서머', finalists: finalTeams(team('gen-g', 'Gen.G', 'GEN'), team('t1', 'T1')) },
      { name: 'MSI', finalists: finalTeams(team('jdg', 'JD Gaming', 'JDG'), team('bilibili', 'Bilibili Gaming', 'BLG')) },
      { name: '월드 챔피언십', finalists: finalTeams(team('t1', 'T1'), team('weibo', 'Weibo Gaming', 'WBG')) },
    ],
  },
]
