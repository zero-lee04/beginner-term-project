/* LCK 프론트엔드 앱 */

import { useCallback, useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'
import { getSeasonRosterData, teams } from './data/lck'
import type { CareerPlayer, Team } from './types'
import LoginScreen from './components/LoginScreen'
import CareerTimeline from './components/CareerTimeline'
import PlayerSearch from './components/PlayerSearch'
import LeagueArchive from './components/LeagueArchive'
import ArchivePage from './components/ArchivePage'
import { leagueSeasons, type LeagueResultRecord } from './data/leagueResults'
import StoveLeague from './components/StoveLeague'
import TeamGrid from './components/TeamGrid'
import TeamRoster from './components/TeamRoster'
import './App.css'

function App() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [selectedSeason, setSelectedSeason] = useState(2027)
  const [availableSeasons, setAvailableSeasons] = useState([2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019])
  const [seasonTeams, setSeasonTeams] = useState<Team[]>(teams)
  const [showLogin, setShowLogin] = useState(false)
  const [showRoster, setShowRoster] = useState(false)
  const [careerPlayer, setCareerPlayer] = useState<CareerPlayer | null>(null)
  const [activePage, setActivePage] = useState<'teams' | 'league' | 'archive'>('teams')
  const [archiveRecord, setArchiveRecord] = useState<LeagueResultRecord | null>(null)

  const openArchiveRecord = useCallback((record: LeagueResultRecord) => {
    setArchiveRecord(record)
    setCareerPlayer(null)
    setShowRoster(false)
    setSelectedTeam(null)
    setActivePage('archive')
  }, [])

  function openLeagueAchievement(year: number, eventName: string, teamId: string) {
    const event = leagueSeasons.find((season) => season.year === year)?.events.find((item) => item.name === eventName)
    const finalist = event?.finalists.find((item) => item.id === teamId)
    if (event && finalist) {
      openArchiveRecord({ ...finalist, year, eventName })
      return
    }
    setCareerPlayer(null)
    setShowRoster(false)
    setSelectedTeam(null)
    setActivePage('league')
  }

  useEffect(() => {
    let isActive = true
    async function loadSeasons() {
      try {
        const snapshot = await getDocs(collection(db, 'seasons'))
        const years = snapshot.docs.map((seasonDocument) => Number(seasonDocument.id))
          .filter((year) => Number.isInteger(year))
          .sort((first, second) => second - first)
        if (isActive) {
          const availableYears = Array.from(new Set([...years, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027])).sort((first, second) => second - first)
          setAvailableSeasons(availableYears)
          setSelectedSeason((currentSeason) => availableYears.includes(currentSeason) ? currentSeason : availableYears[0])
        }
      } catch {
        // Keep locally bundled seasons available if the archive is not configured.
      }
    }
    void loadSeasons()
    return () => { isActive = false }
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
            logo: String(data.logo ?? fallbackTeam?.logo ?? '') || undefined,
          }
        })
        if (isActive) setSeasonTeams(loadedTeams)
      } catch {
        if (isActive) setSeasonTeams([])
      }
    }
    void loadSeasonTeams()
    return () => { isActive = false }
  }, [selectedSeason])

  function selectTeam(team: Team) {
    setSelectedTeam(team)
    setShowRoster(true)
  }

  function returnToTeams() {
    setShowRoster(false)
    setSelectedTeam(null)
    setActivePage('teams')
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="wordmark" href="#home" aria-label="LCK 홈" onClick={() => { setShowLogin(false); setActivePage('teams') }}>
          <span className="wordmark-symbol">L</span><span>LCK<span className="wordmark-period">.</span></span>
        </a>
        {!showLogin && <nav className="topnav" aria-label="주요 메뉴">
          <a className={activePage === 'teams' ? 'nav-active' : ''} href="#teams" onClick={() => { setActivePage('teams'); setArchiveRecord(null); setShowRoster(false); setSelectedTeam(null) }}>TEAMS</a>
          <a className={activePage === 'league' ? 'nav-active' : ''} href="#league" onClick={() => { setActivePage('league'); setArchiveRecord(null); setShowRoster(false); setSelectedTeam(null) }}>LEAGUE</a>
          <a href="#teams" onClick={() => { setActivePage('teams'); setShowRoster(false); setSelectedTeam(null) }}>COMMUNITY</a>
          <a href="#stove-league" onClick={() => { setActivePage('teams'); setShowRoster(false); setSelectedTeam(null) }}>STOVE LEAGUE</a>
          <a className={activePage === 'archive' ? 'nav-active' : ''} href="#archive" onClick={() => { setActivePage('archive'); setArchiveRecord(null); setShowRoster(false); setSelectedTeam(null) }}>ARCHIVE</a>
        </nav>}
        {!showLogin && <PlayerSearch
          teams={seasonTeams}
          onSelectPlayer={(player) => setCareerPlayer(player)}
          onSelectTeam={(team) => {
            setCareerPlayer(null)
            setActivePage('teams')
            selectTeam(team)
          }}
        />}
        {showLogin
          ? <button className="login-header-button" type="button" onClick={() => setShowLogin(false)}>BACK TO HOME</button>
          : <button className="login-header-button" type="button" onClick={() => setShowLogin(true)}>LOGIN <span aria-hidden="true">↗</span></button>}
      </header>

      {showLogin ? <LoginScreen onBack={() => setShowLogin(false)} />
        : showRoster && selectedTeam ? <TeamRoster team={selectedTeam} season={selectedSeason} onBack={returnToTeams} onSelectAchievement={openLeagueAchievement} />
          : activePage === 'league' ? <><LeagueArchive onSelectFinalist={openArchiveRecord} /><footer className="site-footer"><span>LOOP IN. LOCK IN. LCK.</span><span>MADE FOR LCK FANS <b>✳</b> 2026</span></footer></>
          : activePage === 'archive' ? <><ArchivePage record={archiveRecord} onSelectRecord={openArchiveRecord} onBack={() => setArchiveRecord(null)} /><footer className="site-footer"><span>LOOP IN. LOCK IN. LCK.</span><span>MADE FOR LCK FANS <b>✳</b> 2026</span></footer></>
          : <>
            <section className="hero" id="home">
              <div className="hero-watermark" aria-hidden="true">LCK</div>
              <div className="hero-kicker"><span /> LEAGUE OF LEGENDS CHAMPIONS KOREA</div>
              <div className="hero-lockup" aria-label="LCK"><div className="lck-mark" aria-hidden="true"><span /><span /><span /></div><h1>LCK</h1></div>
              <p className="hero-copy">전설이 시작되는 곳,<br /><strong>우리의 리그를 선택하세요.</strong></p>
              <div className="hero-index"><span>01</span> / 10 TEAMS</div>
              <div className="hero-rule" />
            </section>

            <section className="teams-section" id="teams">
              <div className="section-heading">
                <div><p className="eyebrow">THE BATTLE FOR GLORY</p><h2>TEAMS <span>OF LCK</span></h2></div>
                <div className="season-controls">
                  <label htmlFor="season-select">SEASON ARCHIVE</label>
                  <select id="season-select" className="season-select" value={selectedSeason} onChange={(event) => setSelectedSeason(Number(event.target.value))}>
                    {availableSeasons.map((season) => <option key={season} value={season}>{season} SEASON</option>)}
                  </select>
                  <p className="section-note">응원하는 팀을 선택해 보세요.</p>
                </div>
              </div>

              <TeamGrid teams={seasonTeams} selectedTeam={selectedTeam} onSelect={selectTeam} />
              <div className={`selection-panel ${selectedTeam ? 'selection-visible' : ''}`} aria-live="polite">
                <span className="selection-label">YOUR TEAM</span>
                <strong>{selectedTeam ? selectedTeam.name : '팀 로고를 눌러 응원팀을 선택하세요'}</strong>
                {selectedTeam && <span className="selection-message">{selectedTeam.motto} <span>✦</span></span>}
              </div>
            </section>
            <StoveLeague />
            <footer className="site-footer"><span>LOOP IN. LOCK IN. LCK.</span><span>MADE FOR LCK FANS <b>✳</b> 2026</span></footer>
          </>}
      {careerPlayer && <CareerTimeline player={careerPlayer} onClose={() => setCareerPlayer(null)} onSelectAchievement={openLeagueAchievement} />}
    </main>
  )
}

export default App
