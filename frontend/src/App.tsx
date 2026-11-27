import { useEffect, useState, type CSSProperties, type FormEvent } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from './firebase'
import rosterData2027 from '../data/lck-rosters-2027.json'
import offseason2027 from '../data/lck-offseason-2027.json'
import rosterData from '../data/lck-rosters-2026.json'
import rosterData2025 from '../data/lck-rosters-2025.json'
import './App.css'

type Team = {
  id: string
  name: string
  shortName: string
  mark: string
  accent: string
  motto: string
  logo?: string
}

const teams: Team[] = [
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

type RosterPlayer = {
  id: string
  league: string
  role: string
  label: string
  name: string
  koreanName: string
  number: string
  sortOrder: number
}

type StaffMember = {
  league: string
  role: string
  name: string
}

type CareerEntry = {
  season: number
  teamId: string
  teamName: string
  teamShortName: string
  accent: string
  league: string
  role: string
  label: string
}

type CareerPlayer = Pick<RosterPlayer, 'name' | 'koreanName'>

function getPlayerCareer(player: CareerPlayer): CareerEntry[] {
  const normalizedName = player.name.trim().toLowerCase()
  const normalizedKoreanName = player.koreanName.trim()
  const seasons = [rosterData2025, rosterData, rosterData2027]
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

  return career.sort((first, second) => first.season - second.season || first.teamName.localeCompare(second.teamName))
}

function CareerTimeline({ player, onClose }: { player: CareerPlayer; onClose: () => void }) {
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
      <section
        className="career-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="career-title"
        onClick={(event) => event.stopPropagation()}
      >
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
                <span className="career-team-logo">
                  <img src={`${import.meta.env.BASE_URL}teams/${entry.teamId}.png`} alt="" />
                </span>
                <span className="career-entry-info">
                  <strong>{entry.teamShortName}</strong>
                  <span>{entry.league === 'LCK CL' ? 'LCK 챌린저스' : 'LCK'} · {entry.role}</span>
                </span>
                {entry.season === 2027 && <span className="career-projection">전망</span>}
                {index < career.length - 1 && <span className="career-connector" aria-hidden="true" />}
              </li>
            ))}
          </ol>
        ) : (
          <p className="career-empty">등록된 시즌별 이력이 아직 없습니다.</p>
        )}
        <p className="career-note">등록된 시즌 로스터 기준이며, 2027 표시는 전망 로스터입니다.</p>
      </section>
    </div>
  )
}

function getLocalRoster(season: number, teamId: string): RosterPlayer[] {
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

function getSeasonRosterData(season: number) {
  return season === rosterData2027.season
    ? rosterData2027
    : season === rosterData2025.season
      ? rosterData2025
      : season === rosterData.season
        ? rosterData
        : null
}

function LoginScreen({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('Firebase 인증은 아직 연결되지 않았습니다. 입력 화면 미리보기입니다.')
  }

  return (
    <section className="login-section">
      <div className="login-background-mark" aria-hidden="true">LCK</div>
      <div className="login-card">
        <button className="login-back" type="button" onClick={onBack}>
          <span aria-hidden="true">←</span> 홈으로 돌아가기
        </button>

        <div className="login-kicker"><span /> LCK FAN ACCOUNT</div>
        <div className="login-monogram" aria-hidden="true">L</div>
        <h1>다시, 협곡으로.</h1>
        <p className="login-description">
          로그인하고 좋아하는 팀과 함께<br />
          LCK를 더 가까이 즐겨보세요.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">이메일</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="login-password">비밀번호</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button className="login-submit" type="submit">
            로그인 <span aria-hidden="true">↗</span>
          </button>
          {message && <p className="login-feedback" role="status">{message}</p>}
        </form>

        <p className="login-preview-note">
          지금은 화면 미리보기 단계예요. 실제 계정 인증은 Firebase 연결 후 사용할 수 있습니다.
        </p>
      </div>
    </section>
  )
}

function TeamRoster({ team, season, onBack }: { team: Team; season: number; onBack: () => void }) {
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
        const playersQuery = query(
          collection(db, 'seasons', String(season), 'teams', team.id, 'players'),
          orderBy('sortOrder'),
        )
        let snapshot = await getDocs(playersQuery)
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
        if (isActive) {
          setError('로스터를 불러오지 못했습니다. Firestore 데이터와 Rules를 확인해 주세요.')
        }
      } finally {
        if (isActive) setLoading(false)
      }
    }

    void loadRoster()

    return () => {
      isActive = false
    }
  }, [season, team.id])

  const rosterTeam = getSeasonRosterData(season)?.teams.find((seasonTeam) => seasonTeam.id === team.id)
  const staff: StaffMember[] = rosterTeam && 'staff' in rosterTeam && Array.isArray(rosterTeam.staff)
    ? rosterTeam.staff as StaffMember[]
    : []

  return (
    <section className="roster-section" style={{ '--team-accent': team.accent } as CSSProperties}>
      <div className="roster-watermark" aria-hidden="true">{team.shortName}</div>
      <div className="roster-content">
        <button className="roster-back" type="button" onClick={onBack}>
          <span aria-hidden="true">←</span> 전체 팀 목록
        </button>

        <div className="roster-heading">
          <div className="roster-logo" aria-hidden="true">
            <img
              src={team.logo ?? `${import.meta.env.BASE_URL}teams/${team.id}.png`}
              alt=""
              onLoad={(event) => event.currentTarget.parentElement?.classList.add('has-logo')}
              onError={(event) => event.currentTarget.remove()}
            />
            <span>{team.mark}</span>
          </div>
          <div>
            <p className="eyebrow">{season} LCK TEAM ROSTER</p>
            <h1>{team.shortName} <span>ROSTER</span></h1>
            <p className="roster-subtitle">다섯 명의 선수, 하나의 목표.</p>
          </div>
        </div>

        {loading ? (
          <p className="roster-state">Firestore에서 로스터를 불러오는 중...</p>
        ) : error ? (
          <p className="roster-state roster-state-error" role="alert">{error}</p>
        ) : players.length === 0 ? (
          <p className="roster-state">
            아직 로스터 문서가 없습니다. Firestore의 <code>seasons/{season}/teams/{team.id}/players</code> 경로를 확인하세요.
          </p>
        ) : (
          <>
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
                      style={{
                        '--player-index': index,
                        '--role-column': roleColumn,
                        '--role-row': roleRow,
                      } as CSSProperties}
                    >
                      <div className="player-card-topline">
                        <span>{player.number}</span>
                        <span className="player-role-en">{player.role}</span>
                      </div>
                      <div className="player-glyph" aria-hidden="true">
                        {player.role === 'JUNGLE' || player.role === 'JUG' ? 'Ⅱ' : player.role === 'SUPPORT' || player.role === 'SUP' ? '✦' : player.role.slice(0, 1)}
                      </div>
                      <div className="player-info">
                        <span className="player-role-ko">{player.label}</span>
                        <h2>{player.name}</h2>
                        <p>{player.koreanName}</p>
                      </div>
                      <span className="player-card-line" />
                    </article>
                  })}
                </div>
              </section>
            })}
            {staff.length > 0 && <section className="staff-section" aria-label="감독과 코치">
              <div className="roster-squad-heading">
                <h2>감독 &amp; 코칭 스태프</h2>
                <span>TEAM STAFF</span>
              </div>
              {['LCK', 'LCK CL'].map((league) => {
                const leagueStaff = staff.filter((member) => member.league === league)
                if (leagueStaff.length === 0) return null

                return <div className="staff-group" key={league}>
                  <h3>{league === 'LCK' ? 'LCK' : 'LCK CHALLENGERS'}</h3>
                  <div className="staff-grid">
                    {leagueStaff.map((member) => <article className="staff-card" key={`${league}-${member.role}-${member.name}`}>
                      <span>{member.role}</span>
                      <strong>{member.name}</strong>
                    </article>)}
                  </div>
                </div>
              })}
            </section>}
            <p className="roster-footnote">선수 명단은 {season} 시즌 로스터 기준입니다.</p>
          </>
        )}
      </div>
      {careerPlayer && <CareerTimeline player={careerPlayer} onClose={() => setCareerPlayer(null)} />}
    </section>
  )
}

type TransferMove = {
  id : string
  division: string
  status: string
  player: string
  role: string
  originalTeam: string
  contractTeam: string
}

const transferFilters = ['전체', '재계약', '이적', '계약 종료'] as const
const transferDivisions = ['LCK', 'LCK CL'] as const

function inferTransferDivision(originalTeam: string, contractTeam: string) {
  const destination = contractTeam && contractTeam !== '-' ? contractTeam : originalTeam
  return /챌린저스|유스|아카데미|Academy|Challengers/i.test(destination) ? 'LCK CL' : 'LCK'
}

function getTransferPlayerKey(move: Pick<TransferMove, 'player' | 'role'>) {
  return `${move.player.trim().toLowerCase()}-${move.role.trim().toUpperCase()}`
}

const bundledMoves: TransferMove[] = offseason2027.transfers.map((move, index) => ({
  id: `move-${String(index + 1).padStart(3, '0')}`,
  division: inferTransferDivision(move.originalTeam, move.contractTeam),
  status: move.status,
  player: move.player,
  role: move.role,
  originalTeam: move.originalTeam,
  contractTeam: move.contractTeam,
}))

function TransferTeamCell({ teamName }: { teamName: string }) {
  const normalizedName = teamName.toLowerCase()
  const logo = normalizedName.includes('t1')
    ? `${import.meta.env.BASE_URL}teams/t1.png`
    : normalizedName.includes('젠지') || normalizedName.includes('gen.g')
      ? `${import.meta.env.BASE_URL}teams/gen-g.png`
      : normalizedName.includes('한화') || normalizedName.includes('hle')
        ? `${import.meta.env.BASE_URL}teams/hle.png`
        : normalizedName.includes('kt 롤스터') || normalizedName.includes('kt rolster')
          ? `${import.meta.env.BASE_URL}teams/kt.png`
          : normalizedName.includes('dplus') || normalizedName.includes('kia')
            ? `${import.meta.env.BASE_URL}teams/dk.png`
            : normalizedName.includes('bnk') || normalizedName.includes('피어엑스')
              ? `${import.meta.env.BASE_URL}teams/bnk.png`
              : normalizedName.includes('drx')
                ? `${import.meta.env.BASE_URL}teams/drx.png`
                : normalizedName.includes('농심') || normalizedName.includes('nongshim')
                  ? `${import.meta.env.BASE_URL}teams/nongshim.png`
                  : normalizedName.includes('브리온') || normalizedName.includes('brion')
                    ? `${import.meta.env.BASE_URL}teams/brion.png`
                    : normalizedName.includes('dn 수퍼스') || normalizedName.includes('dn soopers')
                      ? `${import.meta.env.BASE_URL}teams/dn.png`
                      : normalizedName.includes('shifters')
                        ? `${import.meta.env.BASE_URL}teams/shifters.png`
                        : normalizedName.includes('giantx')
                          ? `${import.meta.env.BASE_URL}teams/giantx.png`
                          : normalizedName.includes('cloud9')
                            ? `${import.meta.env.BASE_URL}teams/cloud9.png`
                            : ''
  const displayName = !teamName || teamName === '-' ? '미정' : teamName

  return (
    <span className="transfer-team-cell">
      {logo && <img src={logo} alt="" aria-hidden="true" />}
      <span>{displayName}</span>
    </span>
  )
}

function StoveLeague() {
  const [moves, setMoves] = useState<TransferMove[]>(bundledMoves)
  const [division, setDivision] = useState<(typeof transferDivisions)[number]>('LCK')
  const [filter, setFilter] = useState<(typeof transferFilters)[number]>('전체')
  const [loading, setLoading] = useState(true)


useEffect(() => {
    let isActive = true

    async function loadMoves() {
      try {
        const movesQuery = query(
          collection(db, 'offseasons', '2027', 'transfers'),
          orderBy('sortOrder'),
        )
        const snapshot = await getDocs(movesQuery)
        const loadedMoves = snapshot.docs.map((moveDocument) => {
          const data = moveDocument.data()
          const originalTeam = String(data.originalTeam ?? '')
          const contractTeam = String(data.contractTeam ?? '')
          return {
            id: moveDocument.id,
            division: inferTransferDivision(originalTeam, contractTeam),
            status: String(data.status ?? ''),
            player: String(data.player ?? ''),
            role: String(data.role ?? ''),
            originalTeam,
            contractTeam,
          }
        })

        if (isActive && loadedMoves.length > 0) {
          const bundledPlayerKeys = new Set(bundledMoves.map(getTransferPlayerKey))
          const firestoreOnlyMoves = loadedMoves.filter((move) => !bundledPlayerKeys.has(getTransferPlayerKey(move)))
          setMoves([...bundledMoves, ...firestoreOnlyMoves])
        }
      } catch {
        // Keep the bundled snapshot visible when Firestore is not seeded or reachable.
      } finally {
        if (isActive) setLoading(false)
      }
    }

    void loadMoves()
    return () => {
      isActive = false
    }
  }, [])

  const divisonsMoves = moves.filter((move) => move.division === division)
  const visibleMoves = filter === '전체' ? divisonsMoves : divisonsMoves.filter((move) => move.status === filter)

  return (
    <section className="stove-section" id="stove-league">
      <div className="stove-content">
        <div className="stove-heading">
          <div>
            <p className="eyebrow">LCK 2027 OFFSEASON</p>
            <h1>STOVE <span>LEAGUE</span></h1>
          </div>
          <p>선수 이동과 재계약 소식을 확인해 보세요.</p>
        </div>

        <div className="transfer-divisions" aria-label="팀 구분">
          {transferDivisions.map((item) => (
            <button
              className={division === item ? 'transfer-division-active' : ''}
              key={item}
              type="button"
              onClick={() => setDivision(item)}
              aria-pressed={division === item}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="transfer-filters" aria-label="이적 현황 필터">
          {transferFilters.map((status) => (
            <button
              className={filter === status ? 'transfer-filter-active' : ''}
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              aria-pressed={filter === status}
            >
              {status}
            </button>
          ))}
        </div>

         <div className="transfer-table-wrap">
          <table className="transfer-table">
            <thead>
              <tr>
                <th scope="col">상황</th>
                <th scope="col">선수</th>
                <th scope="col">원소속</th>
                <th scope="col">계약팀</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="transfer-empty" colSpan={4}>스토브리그 현황을 불러오는 중...</td></tr>
              ) : visibleMoves.length === 0 ? (
                <tr><td className="transfer-empty" colSpan={4}>아직 등록된 이적·재계약 소식이 없습니다.</td></tr>
              ) : visibleMoves.map((move) => (
                <tr key={move.id}>
                  <td>
                    <span className={`transfer-status ${move.status === '재계약' ? 'status-renewal' : move.status === '계약 종료' ? 'status-ended' : 'status-transfer'}`}>
                      {move.status}
                    </span>
                  </td>
                  <td className="transfer-player">
                    <strong>{move.player}</strong>
                    {move.role && <span>{move.role}</span>}
                  </td>
                  <td><TransferTeamCell teamName={move.originalTeam} /></td>
                  <td><TransferTeamCell teamName={move.contractTeam} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
function App() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [selectedSeason, setSelectedSeason] = useState(2027)
  const [availableSeasons, setAvailableSeasons] = useState([2027, 2026, 2025])
  const [seasonTeams, setSeasonTeams] = useState(teams)
  const [showLogin, setShowLogin] = useState(false)
  const [showRoster, setShowRoster] = useState(false)

  useEffect(() => {
    let isActive = true

    async function loadSeasons() {
      try {
        const snapshot = await getDocs(collection(db, 'seasons'))
        const years = snapshot.docs
          .map((seasonDocument) => Number(seasonDocument.id))
          .filter((year) => Number.isInteger(year))
          .sort((first, second) => second - first)

        if (isActive) {
          const availableYears = Array.from(new Set([...years, 2025, 2026, 2027])).sort((first, second) => second - first)
          setAvailableSeasons(availableYears)
          setSelectedSeason((currentSeason) => availableYears.includes(currentSeason) ? currentSeason : availableYears[0])
        }
      } catch {
        // Keep locally bundled seasons available if the archive is not configured.
      }
    }

    void loadSeasons()
    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    let isActive = true

    async function loadSeasonTeams() {
      const localTeams = getSeasonRosterData(selectedSeason)?.teams
      if (localTeams) {
        if (isActive) setSeasonTeams(localTeams)
        return
      }

      try {
        const snapshot = await getDocs(collection(db, 'seasons', String(selectedSeason), 'teams'))
        const loadedTeams = snapshot.docs.map((teamDocument) => {
          const data = teamDocument.data()
          const fallbackTeam = teams.find((team) => team.id === teamDocument.id)

          return {
            id: teamDocument.id,
            name: String(data.name ?? fallbackTeam?.name ?? teamDocument.id),
            shortName: String(data.shortName ?? fallbackTeam?.shortName ?? teamDocument.id.toUpperCase()),
            mark: String(data.mark ?? fallbackTeam?.mark ?? teamDocument.id.slice(0, 1).toUpperCase()),
            accent: String(data.accent ?? fallbackTeam?.accent ?? '#e84048'),
            motto: String(data.motto ?? fallbackTeam?.motto ?? ''),
            logo: String(data.logo ?? (fallbackTeam && 'logo' in fallbackTeam ? fallbackTeam.logo : undefined) ?? '') || undefined,
          }
        })

        if (isActive) setSeasonTeams(loadedTeams)
      } catch {
        if (isActive) setSeasonTeams([])
      }
    }

    void loadSeasonTeams()
    return () => {
      isActive = false
    }
  }, [selectedSeason])

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="wordmark" href="#home" aria-label="LCK 홈" onClick={() => setShowLogin(false)}>
          <span className="wordmark-symbol">L</span>
          <span>LCK<span className="wordmark-period">.</span></span>
        </a>
        {!showLogin && (
          <nav className="topnav" aria-label="주요 메뉴">
            <a className="nav-active" href="#teams">TEAMS</a>
            <a href="#teams">LEAGUE</a>
            <a href="#teams">COMMUNITY</a>
            <a href="#stove-league">STOVE LEAGUE</a>
          </nav>
        )}
        {showLogin ? (
          <button className="login-header-button" type="button" onClick={() => setShowLogin(false)}>BACK TO HOME</button>
        ) : (
          <button className="login-header-button" type="button" onClick={() => setShowLogin(true)}>LOGIN <span aria-hidden="true">↗</span></button>
        )}
      </header>

      {showLogin ? <LoginScreen onBack={() => setShowLogin(false)} /> : showRoster && selectedTeam ? (
        <TeamRoster team={selectedTeam} season={selectedSeason} onBack={() => {
          setShowRoster(false)
          setSelectedTeam(null)
        }} />
      ) : <>
      <section className="hero" id="home">
        <div className="hero-watermark" aria-hidden="true">LCK</div>
        <div className="hero-kicker"><span /> LEAGUE OF LEGENDS CHAMPIONS KOREA</div>
        <div className="hero-lockup" aria-label="LCK">
          <div className="lck-mark" aria-hidden="true"><span /><span /><span /></div>
          <h1>LCK</h1>
        </div>
        <p className="hero-copy">전설이 시작되는 곳,<br /><strong>우리의 리그를 선택하세요.</strong></p>
        <div className="hero-index"><span>01</span> / 10 TEAMS</div>
        <div className="hero-rule" />
      </section>

      <section className="teams-section" id="teams">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE BATTLE FOR GLORY</p>
            <h2>TEAMS <span>OF LCK</span></h2>
          </div>
          <div className="season-controls">
            <label htmlFor="season-select">SEASON ARCHIVE</label>
            <select
              id="season-select"
              className="season-select"
              value={selectedSeason}
              onChange={(event) => setSelectedSeason(Number(event.target.value))}
            >
              {availableSeasons.map((season) => <option key={season} value={season}>{season} SEASON</option>)}
            </select>
            <p className="section-note">응원하는 팀을 선택해 보세요.</p>
          </div>
        </div>

        {seasonTeams.length > 0 ? <div className="team-grid">
          {seasonTeams.map((team, index) => (
            <button
              className={`team-card ${selectedTeam?.id === team.id ? 'team-card-selected' : ''}`}
              key={team.id}
              onClick={() => {
                setSelectedTeam(team)
                setShowRoster(true)
              }}
              style={{ '--team-accent': team.accent, '--card-index': index } as CSSProperties}
              aria-pressed={selectedTeam?.id === team.id}
            >
              <span className="card-topline"><span>{String(index + 1).padStart(2, '0')}</span><span className="card-arrow">↗</span></span>
              <span className={`team-emblem emblem-${team.id}`} aria-hidden="true">
                <img
                  src={team.logo ?? `${import.meta.env.BASE_URL}teams/${team.id}.png`}
                  alt=""
                  onLoad={(event) => event.currentTarget.parentElement?.classList.add('has-logo')}
                  onError={(event) => event.currentTarget.remove()}
                />
                <span>{team.mark}</span>
              </span>
              <span className="team-name">{team.name}</span>
              <span className="team-motto">{team.motto}</span>
              <span className="card-footer"><span>{team.shortName}</span><span className="footer-dash" /></span>
            </button>
          ))}
        </div> : <p className="season-empty">이 시즌의 팀 목록은 아직 등록되지 않았습니다.</p>}

        <div className={`selection-panel ${selectedTeam ? 'selection-visible' : ''}`} aria-live="polite">
          <span className="selection-label">YOUR TEAM</span>
          <strong>{selectedTeam ? selectedTeam.name : '팀 로고를 눌러 응원팀을 선택하세요'}</strong>
          {selectedTeam && <span className="selection-message">{selectedTeam.motto} <span>✦</span></span>}
        </div>
      </section>

      <StoveLeague />

      <footer className="site-footer">
        <span>LOOP IN. LOCK IN. LCK.</span>
        <span>MADE FOR LCK FANS <b>✳</b> 2026</span>
      </footer>
      </>}
    </main>
  )
}

export default App
