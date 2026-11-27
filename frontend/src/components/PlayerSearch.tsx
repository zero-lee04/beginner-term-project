/* 선수 이름 검색 및 커리어 타임라인 열기 */

import { useMemo, useState, type KeyboardEvent } from 'react'
import { getCareerPlayerOptions } from '../data/lck'
import type { CareerPlayer, Team } from '../types'

type Props = {
  teams: Team[]
  onSelectPlayer: (player: CareerPlayer) => void
  onSelectTeam: (team: Team) => void
}

const players = getCareerPlayerOptions()
const teamAliases: Record<string, string[]> = {
  't1': ['티원'],
  'gen-g': ['젠지'],
  'hle': ['한화생명', '한화생명e스포츠'],
  'kt': ['케이티'],
  'dk': ['디플러스기아', '디플러스 기아'],
  'bnk': ['피어엑스', '비엔케이 피어엑스', 'FOX'],
  'drx': ['디알엑스'],
  'nongshim': ['농심', '농심 레드포스'],
  'brion': ['브리온', '한진 브리온'],
  'dn': ['디엔 수퍼스', '디엔 소퍼스'],
  'kdf': ['광동', '광동 프릭스'],
}

export default function PlayerSearch({ teams, onSelectPlayer, onSelectTeam }: Props) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const query = search.trim().toLocaleLowerCase()
  const matches = useMemo(() => {
    if (!query) return []
    const playerMatches = players.filter((player) =>
      player.name.toLocaleLowerCase().includes(query)
      || player.koreanName.includes(search.trim()),
    ).slice(0, 8)
    const teamMatches = teams.filter((team) =>
      [team.name, team.shortName, team.id, ...(teamAliases[team.id] ?? [])]
        .some((value) => value.toLocaleLowerCase().includes(query)),
    ).slice(0, 6)
    return { players: playerMatches, teams: teamMatches }
  }, [query, search, teams])

  function clearSearch() {
    setSearch('')
    setIsOpen(false)
  }

  function choosePlayer(player: CareerPlayer) {
    onSelectPlayer(player)
    clearSearch()
  }

  function chooseTeam(team: Team) {
    onSelectTeam(team)
    clearSearch()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') setIsOpen(false)
    if (event.key === 'Enter') {
      const exactTeam = matches.teams.find((team) =>
        [team.name, team.shortName, team.id].some((value) => value.toLocaleLowerCase() === query),
      )
      if (exactTeam) chooseTeam(exactTeam)
      else if (matches.players[0]) choosePlayer(matches.players[0])
      else if (matches.teams[0]) chooseTeam(matches.teams[0])
    }
  }

  return (
    <div className="player-search">
      <label className="player-search-label" htmlFor="player-search-input">선수 또는 팀 검색</label>
      <input
        id="player-search-input"
        type="search"
        value={search}
        placeholder="선수·팀 검색"
        autoComplete="off"
        aria-controls="player-search-results"
        aria-expanded={isOpen && Boolean(query)}
        onChange={(event) => { setSearch(event.target.value); setIsOpen(true) }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
      />
      {isOpen && query && <div className="player-search-results" id="player-search-results" role="listbox">
        {matches.players.length === 0 && matches.teams.length === 0
          ? <p>검색 결과가 없습니다.</p>
          : <>
            {matches.teams.length > 0 && <>
              <span className="player-search-group-label">팀 로스터</span>
              {matches.teams.map((team) => <button type="button" role="option" aria-selected="false" key={`team-${team.id}`} onClick={() => chooseTeam(team)}>
                <strong>{team.name}</strong><span>{team.shortName} · 로스터 보기</span>
              </button>)}
            </>}
            {matches.players.length > 0 && <>
              <span className="player-search-group-label">선수 커리어</span>
              {matches.players.map((player) => <button type="button" role="option" aria-selected="false" key={`player-${player.name}`} onClick={() => choosePlayer(player)}>
                <strong>{player.name}</strong>{player.koreanName && <span>{player.koreanName}</span>}
              </button>)}
            </>}
          </>}
      </div>}
    </div>
  )
}
