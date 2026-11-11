import { useState, type CSSProperties } from 'react'
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
  { id: 't1', name: 'T1', shortName: 'T1', mark: 'T1', accent: '#e84048', motto: 'LEGENDS NEVER DIE' },
  { id: 'gen-g', name: 'Gen.G', shortName: 'GEN', mark: 'G', accent: '#cfaa43', motto: 'GOLDEN ERA' },
  { id: 'hle', name: 'Hanwha Life Esports', shortName: 'HLE', mark: 'H', accent: '#ff702d', motto: 'LIFE IS A CHALLENGE' },
  { id: 'kt', name: 'KT Rolster', shortName: 'KT', mark: 'KT', accent: '#ed2939', motto: 'REAL GAMING' },
  { id: 'dplus', name: 'Dplus KIA', shortName: 'DK', mark: 'DK', accent: '#7e9cff', motto: 'DREAM. PLAY. WIN.' },
  { id: 'fearx', name: 'BNK FEARX', shortName: 'BFX', mark: 'F', accent: '#ff8a28', motto: 'FEAR NOTHING' },
  { id: 'drx', name: 'DRX', shortName: 'DRX', mark: 'D', accent: '#5b9dff', motto: 'WE ARE DRX' },
  { id: 'nongshim', name: 'NS RedForce', shortName: 'NS', mark: 'N', accent: '#e53d48', motto: 'RED FORCE' },
  { id: 'brion', name: 'OK BRION', shortName: 'BRO', mark: 'B', accent: '#70bd56', motto: 'BRION ESPORTS' },
  { id: 'freecs', name: 'DN Freecs', shortName: 'DNF', mark: 'F', accent: '#e3a747', motto: 'PLAY YOUR WAY' },
]

function App() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="wordmark" href="#home" aria-label="LCK 홈">
          <span className="wordmark-symbol">L</span>
          <span>LCK<span className="wordmark-period">.</span></span>
        </a>
        <nav className="topnav" aria-label="주요 메뉴">
          <a className="nav-active" href="#teams">TEAMS</a>
          <a href="#teams">LEAGUE</a>
          <a href="#teams">COMMUNITY</a>
        </nav>
        <div className="season-tag"><span className="live-dot" /> 2026 SEASON</div>
      </header>

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
    </main>
  )
}

export default App
