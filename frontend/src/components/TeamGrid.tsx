/* 팀 선택 그리드*/

import type { CSSProperties } from 'react'
import type { Team } from '../types'

type Props = { teams: Team[]; selectedTeam: Team | null; onSelect: (team: Team) => void }

export default function TeamGrid({ teams, selectedTeam, onSelect }: Props) {
  if (teams.length === 0) return <p className="season-empty">이 시즌의 팀 목록은 아직 등록되지 않았습니다.</p>
  return <div className="team-grid">
    {teams.map((team, index) => <button
      className={`team-card ${selectedTeam?.id === team.id ? 'team-card-selected' : ''}`}
      key={team.id}
      onClick={() => onSelect(team)}
      style={{ '--team-accent': team.accent, '--card-index': index } as CSSProperties}
      aria-pressed={selectedTeam?.id === team.id}
    >
      <span className="card-topline"><span>{String(index + 1).padStart(2, '0')}</span><span className="card-arrow">↗</span></span>
      <span className={`team-emblem emblem-${team.id}`} aria-hidden="true">
        <img src={team.logo ?? `${import.meta.env.BASE_URL}teams/${team.id}.png`} alt="" onLoad={(event) => event.currentTarget.parentElement?.classList.add('has-logo')} onError={(event) => event.currentTarget.remove()} />
        <span>{team.mark}</span>
      </span>
      <span className="team-name">{team.name}</span>
      <span className="team-motto">{team.motto}</span>
      <span className="card-footer"><span>{team.shortName}</span><span className="footer-dash" /></span>
    </button>)}
  </div>
}
