import { useEffect, type CSSProperties } from 'react'
import { getPlayerCareer } from '../data/lck'
import type { CareerPlayer } from '../types'

type Props = { player: CareerPlayer; onClose: () => void }

export default function CareerTimeline({ player, onClose }: Props) {
  const career = getPlayerCareer(player)

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div className="career-overlay" onClick={onClose}>
      <section className="career-dialog" role="dialog" aria-modal="true" aria-labelledby="career-title" onClick={(event) => event.stopPropagation()}>
        <button className="career-close" type="button" onClick={onClose} aria-label="타임라인 닫기">×</button>
        <p className="career-kicker">PLAYER JOURNEY</p>
        <h2 id="career-title">{player.name}<span> CAREER</span></h2>
        {player.koreanName && <p className="career-real-name">{player.koreanName}</p>}
        {career.length > 0 ? (
          <ol className="career-list">
            {career.map((entry, index) => (
              <li className="career-entry" key={`${entry.season}-${entry.teamId}-${entry.league}-${entry.label}`}>
                <span className="career-marker" style={{ '--career-accent': entry.accent } as CSSProperties} />
                <span className="career-year">{entry.season}</span>
                <span className="career-team-logo"><img src={`${import.meta.env.BASE_URL}teams/${entry.teamId}.png`} alt="" /></span>
                <span className="career-entry-info">
                  <strong>{entry.teamShortName}</strong>
                  <span>{entry.league === 'LCK CL' ? 'LCK 챌린저스' : 'LCK'} · {entry.role}</span>
                </span>
                {entry.season === 2027 && <span className="career-projection">전망</span>}
                {index < career.length - 1 && <span className="career-connector" aria-hidden="true" />}
              </li>
            ))}
          </ol>
        ) : <p className="career-empty">등록된 시즌별 이력이 아직 없습니다.</p>}
        <p className="career-note">등록된 시즌 로스터 기준이며, 2027 표시는 전망 로스터입니다.</p>
      </section>
    </div>
  )
}
