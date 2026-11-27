import { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import offseason2027 from '../../data/lck-offseason-2027.json'
import type { TransferMove } from '../types'

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

function getTeamLogo(teamName: string) {
  const name = teamName.toLowerCase()
  const logoByName = [
    { match: (value: string) => value.includes('t1'), file: 't1.png' },
    { match: (value: string) => value.includes('젠지') || value.includes('gen.g'), file: 'gen-g.png' },
    { match: (value: string) => value.includes('한화') || value.includes('hle'), file: 'hle.png' },
    { match: (value: string) => value.includes('kt 롤스터') || value.includes('kt rolster'), file: 'kt.png' },
    { match: (value: string) => value.includes('dplus') || value.includes('kia'), file: 'dk.png' },
    { match: (value: string) => value.includes('bnk') || value.includes('피어엑스'), file: 'bnk.png' },
    { match: (value: string) => value.includes('drx'), file: 'drx.png' },
    { match: (value: string) => value.includes('농심') || value.includes('nongshim'), file: 'nongshim.png' },
    { match: (value: string) => value.includes('브리온') || value.includes('brion'), file: 'brion.png' },
    { match: (value: string) => value.includes('dn 수퍼스') || value.includes('dn soopers'), file: 'dn.png' },
    { match: (value: string) => value.includes('shifters'), file: 'shifters.png' },
    { match: (value: string) => value.includes('giantx'), file: 'giantx.png' },
    { match: (value: string) => value.includes('cloud9'), file: 'cloud9.png' },
  ]
  const match = logoByName.find((item) => item.match(name))
  return match ? `${import.meta.env.BASE_URL}teams/${match.file}` : ''
}

function TransferTeamCell({ teamName }: { teamName: string }) {
  const logo = getTeamLogo(teamName)
  const displayName = !teamName || teamName === '-' ? '미정' : teamName
  return <span className="transfer-team-cell">{logo && <img src={logo} alt="" aria-hidden="true" />}<span>{displayName}</span></span>
}

export default function StoveLeague() {
  const [moves, setMoves] = useState<TransferMove[]>(bundledMoves)
  const [division, setDivision] = useState<(typeof transferDivisions)[number]>('LCK')
  const [filter, setFilter] = useState<(typeof transferFilters)[number]>('전체')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isActive = true
    async function loadMoves() {
      try {
        const movesQuery = query(collection(db, 'offseasons', '2027', 'transfers'), orderBy('sortOrder'))
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
    return () => { isActive = false }
  }, [])

  const divisionMoves = moves.filter((move) => move.division === division)
  const visibleMoves = filter === '전체' ? divisionMoves : divisionMoves.filter((move) => move.status === filter)

  return (
    <section className="stove-section" id="stove-league">
      <div className="stove-content">
        <div className="stove-heading">
          <div><p className="eyebrow">LCK 2027 OFFSEASON</p><h1>STOVE <span>LEAGUE</span></h1></div>
          <p>선수 이동과 재계약 소식을 확인해 보세요.</p>
        </div>
        <div className="transfer-divisions" aria-label="팀 구분">
          {transferDivisions.map((item) => <button className={division === item ? 'transfer-division-active' : ''} key={item} type="button" onClick={() => setDivision(item)} aria-pressed={division === item}>{item}</button>)}
        </div>
        <div className="transfer-filters" aria-label="이적 현황 필터">
          {transferFilters.map((status) => <button className={filter === status ? 'transfer-filter-active' : ''} key={status} type="button" onClick={() => setFilter(status)} aria-pressed={filter === status}>{status}</button>)}
        </div>
        <div className="transfer-table-wrap">
          <table className="transfer-table">
            <thead><tr><th scope="col">상황</th><th scope="col">선수</th><th scope="col">원소속</th><th scope="col">계약팀</th></tr></thead>
            <tbody>
              {loading ? <tr><td className="transfer-empty" colSpan={4}>스토브리그 현황을 불러오는 중...</td></tr>
                : visibleMoves.length === 0 ? <tr><td className="transfer-empty" colSpan={4}>아직 등록된 이적·재계약 소식이 없습니다.</td></tr>
                  : visibleMoves.map((move) => <tr key={move.id}>
                    <td><span className={`transfer-status ${move.status === '재계약' ? 'status-renewal' : move.status === '계약 종료' ? 'status-ended' : 'status-transfer'}`}>{move.status}</span></td>
                    <td className="transfer-player"><strong>{move.player}</strong>{move.role && <span>{move.role}</span>}</td>
                    <td><TransferTeamCell teamName={move.originalTeam} /></td>
                    <td><TransferTeamCell teamName={move.contractTeam} /></td>
                  </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
