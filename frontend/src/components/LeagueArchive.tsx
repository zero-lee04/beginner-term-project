import { useState, type CSSProperties } from 'react'
import { leagueSeasons, type LeagueResultRecord } from '../data/leagueResults'

type Props = { onSelectFinalist: (record: LeagueResultRecord) => void }

const seasonsNewestFirst = [...leagueSeasons].sort((first, second) => second.year - first.year)

export default function LeagueArchive({ onSelectFinalist }: Props) {
  const [selectedYear, setSelectedYear] = useState(seasonsNewestFirst[0].year)
  const season = seasonsNewestFirst.find((item) => item.year === selectedYear) ?? seasonsNewestFirst[0]

  return (
    <section className="league-archive" id="league">
      <div className="league-archive-heading">
        <div>
          <p className="eyebrow">THE ROAD TO THE TROPHY</p>
          <h1>LEAGUE <span>ARCHIVE</span></h1>
          <p className="league-archive-description">연도별 LCK와 국제 대회의 결승 진출 팀을 모았습니다.</p>
        </div>
        <span className="league-archive-index">FINALS · 2022—2026</span>
      </div>

      <div className="league-year-tabs" role="tablist" aria-label="시즌 선택">
        {seasonsNewestFirst.map(({ year }) => (
          <button
            type="button"
            role="tab"
            aria-selected={selectedYear === year}
            className={selectedYear === year ? 'league-year-tab league-year-tab-active' : 'league-year-tab'}
            key={year}
            onClick={() => setSelectedYear(year)}
          >
            {year}
          </button>
        ))}
      </div>

      <div className="league-event-grid">
        {season.events.map((event, eventIndex) => (
          <article className="league-event-card" key={event.name} style={{ '--event-index': eventIndex } as CSSProperties}>
            <div className="league-event-heading">
              <span>{String(eventIndex + 1).padStart(2, '0')}</span>
              <h2>{event.name}</h2>
              <span>FINAL</span>
            </div>
            <div className="league-finalists">
              {event.finalists.map((finalist) => (
                <button
                  type="button"
                  className={'league-finalist league-finalist-' + (finalist.result === '우승' ? 'champion' : 'runner-up')}
                  key={event.name + '-' + finalist.id}
                  onClick={() => onSelectFinalist({ ...finalist, year: season.year, eventName: event.name })}
                >
                  <span className="league-finalist-result">{finalist.result}</span>
                  <span className="league-finalist-team">
                    {finalist.logo ? (
                      <img src={import.meta.env.BASE_URL + finalist.logo.replace(/^\/+/, '')} alt="" />
                    ) : (
                      <span className="league-team-mark">{finalist.shortName.slice(0, 3)}</span>
                    )}
                    <strong>{finalist.name}</strong>
                  </span>
                  <span className="league-finalist-arrow" aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
            <p className="league-event-hint">팀을 선택해 기념 사진 보기</p>
          </article>
        ))}
      </div>

    </section>
  )
}
