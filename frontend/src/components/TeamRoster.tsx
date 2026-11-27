/* 팀 로스터 화면 */

import { useEffect, useState, type CSSProperties } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import { getLocalRoster, getSeasonRosterData } from '../data/lck'
import type { CareerPlayer, RosterPlayer, StaffMember, Team } from '../types'
import CareerTimeline from './CareerTimeline'

type Props = { team: Team; season: number; onBack: () => void }

export default function TeamRoster({ team, season, onBack }: Props) {
  const [players, setPlayers] = useState<RosterPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [careerPlayer, setCareerPlayer] = useState<CareerPlayer | null>(null)

  useEffect(() => {
    let isActive = true
    async function loadRoster() {
      if (getSeasonRosterData(season)) {
        if (isActive) setPlayers(getLocalRoster(season, team.id))
        setLoading(false)
        return
      }
      try {
        const playersQuery = query(collection(db, 'seasons', String(season), 'teams', team.id, 'players'), orderBy('sortOrder'))
        const snapshot = await getDocs(playersQuery)
        const loadedPlayers = snapshot.docs.map((playerDoc) => {
          const data = playerDoc.data()
          const sortOrder = Number(data.sortOrder ?? 0)
          return {
            id: playerDoc.id,
            league: String(data.league ?? 'LCK'),
            role: String(data.role ?? ''),
            label: String(data.label ?? ''),
            name: String(data.name ?? ''),
            koreanName: String(data.koreanName ?? ''),
            number: String(data.number ?? String(sortOrder).padStart(2, '0')),
            sortOrder,
          }
        })
        if (isActive) setPlayers(loadedPlayers)
      } catch {
        if (isActive) setError('로스터를 불러오지 못했습니다. Firestore 데이터와 Rules를 확인해 주세요.')
      } finally {
        if (isActive) setLoading(false)
      }
    }
    void loadRoster()
    return () => { isActive = false }
  }, [season, team.id])

  const rosterTeam = getSeasonRosterData(season)?.teams.find((seasonTeam) => seasonTeam.id === team.id)
  const staff: StaffMember[] = rosterTeam && 'staff' in rosterTeam && Array.isArray(rosterTeam.staff)
    ? rosterTeam.staff as StaffMember[]
    : []

  return (
    <section className="roster-section" style={{ '--team-accent': team.accent } as CSSProperties}>
      <div className="roster-watermark" aria-hidden="true">{team.shortName}</div>
      <div className="roster-content">
        <button className="roster-back" type="button" onClick={onBack}><span aria-hidden="true">←</span> 전체 팀 목록</button>
        <div className="roster-heading">
          <div className="roster-logo" aria-hidden="true">
            <img src={team.logo ?? `${import.meta.env.BASE_URL}teams/${team.id}.png`} alt="" onLoad={(event) => event.currentTarget.parentElement?.classList.add('has-logo')} onError={(event) => event.currentTarget.remove()} />
            <span>{team.mark}</span>
          </div>
          <div>
            <p className="eyebrow">{season} LCK TEAM ROSTER</p>
            <h1>{team.shortName} <span>ROSTER</span></h1>
            <p className="roster-subtitle">다섯 명의 선수, 하나의 목표.</p>
          </div>
        </div>

        {loading ? <p className="roster-state">Firestore에서 로스터를 불러오는 중...</p>
          : error ? <p className="roster-state roster-state-error" role="alert">{error}</p>
            : players.length === 0 ? <p className="roster-state">아직 로스터 문서가 없습니다. Firestore의 <code>seasons/{season}/teams/{team.id}/players</code> 경로를 확인하세요.</p>
              : <>
                {['LCK', 'LCK CL'].map((league) => {
                  const squadPlayers = players.filter((player) => player.league === league)
                  if (squadPlayers.length === 0) return null
                  return <section className="roster-squad" key={league}>
                    <div className="roster-squad-heading">
                      <h2>{league === 'LCK' ? 'LCK' : 'LCK CHALLENGERS'}</h2>
                      <span>선수 카드를 눌러 커리어 타임라인 보기</span>
                    </div>
                    <div className="roster-grid">
                      {squadPlayers.map((player, index) => {
                        const roleColumn = ({ TOP: 1, JUG: 2, JUNGLE: 2, MID: 3, BOT: 4, SUP: 5, SUPPORT: 5 } as Record<string, number>)[player.role] ?? 1
                        const roleRow = squadPlayers.slice(0, index).filter((previousPlayer) => previousPlayer.role === player.role).length + 1
                        return <article
                          className="player-card"
                          role="button"
                          tabIndex={0}
                          aria-label={`${player.name} 선수 커리어 타임라인 보기`}
                          onClick={() => setCareerPlayer(player)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              setCareerPlayer(player)
                            }
                          }}
                          key={player.id}
                          style={{ '--player-index': index, '--role-column': roleColumn, '--role-row': roleRow } as CSSProperties}
                        >
                          <div className="player-card-topline"><span>{player.number}</span><span className="player-role-en">{player.role}</span></div>
                          <div className="player-glyph" aria-hidden="true">{player.role === 'JUNGLE' || player.role === 'JUG' ? 'Ⅱ' : player.role === 'SUPPORT' || player.role === 'SUP' ? '✦' : player.role.slice(0, 1)}</div>
                          <div className="player-info"><span className="player-role-ko">{player.label}</span><h2>{player.name}</h2><p>{player.koreanName}</p></div>
                          <span className="player-card-line" />
                        </article>
                      })}
                    </div>
                  </section>
                })}
                {staff.length > 0 && <section className="staff-section" aria-label="감독과 코치">
                  <div className="roster-squad-heading"><h2>감독 &amp; 코칭 스태프</h2><span>TEAM STAFF</span></div>
                  {['LCK', 'LCK CL'].map((league) => {
                    const leagueStaff = staff.filter((member) => member.league === league)
                    if (leagueStaff.length === 0) return null
                    return <div className="staff-group" key={league}>
                      <h3>{league === 'LCK' ? 'LCK' : 'LCK CHALLENGERS'}</h3>
                      <div className="staff-grid">{leagueStaff.map((member) => <article className="staff-card" key={`${league}-${member.role}-${member.name}`}><span>{member.role}</span><strong>{member.name}</strong></article>)}</div>
                    </div>
                  })}
                </section>}
                <p className="roster-footnote">선수 명단은 {season} 시즌 로스터 기준입니다.</p>
              </>}
      </div>
      {careerPlayer && <CareerTimeline player={careerPlayer} onClose={() => setCareerPlayer(null)} />}
    </section>
  )
}
