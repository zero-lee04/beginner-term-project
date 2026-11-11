import { useState, type CSSProperties, type FormEvent } from 'react'
import './App.css'

type Team = {
  id: string
  name: string
  shortName: string
  mark: string
  accent: string
  motto: string
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

function App() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [showLogin, setShowLogin] = useState(false)

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
          </nav>
        )}
        {showLogin ? (
          <button className="login-header-button" type="button" onClick={() => setShowLogin(false)}>BACK TO HOME</button>
        ) : (
          <button className="login-header-button" type="button" onClick={() => setShowLogin(true)}>LOGIN <span aria-hidden="true">↗</span></button>
        )}
      </header>

      {showLogin ? <LoginScreen onBack={() => setShowLogin(false)} /> : <>
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
          <p className="section-note">열 팀의 이야기, 하나의 무대.<br />응원하는 팀을 선택해 보세요.</p>
        </div>

        <div className="team-grid">
          {teams.map((team, index) => (
            <button
              className={`team-card ${selectedTeam?.id === team.id ? 'team-card-selected' : ''}`}
              key={team.id}
              onClick={() => setSelectedTeam(selectedTeam?.id === team.id ? null : team)}
              style={{ '--team-accent': team.accent, '--card-index': index } as CSSProperties}
              aria-pressed={selectedTeam?.id === team.id}
            >
              <span className="card-topline"><span>{String(index + 1).padStart(2, '0')}</span><span className="card-arrow">↗</span></span>
              <span className={`team-emblem emblem-${team.id}`} aria-hidden="true">
                <img
                  src={`/teams/${team.id}.png`}
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
        </div>

        <div className={`selection-panel ${selectedTeam ? 'selection-visible' : ''}`} aria-live="polite">
          <span className="selection-label">YOUR TEAM</span>
          <strong>{selectedTeam ? selectedTeam.name : '팀 로고를 눌러 응원팀을 선택하세요'}</strong>
          {selectedTeam && <span className="selection-message">{selectedTeam.motto} <span>✦</span></span>}
        </div>
      </section>

      <footer className="site-footer">
        <span>LOOP IN. LOCK IN. LCK.</span>
        <span>MADE FOR LCK FANS <b>✳</b> 2026</span>
      </footer>
      </>}
    </main>
  )
}

export default App
