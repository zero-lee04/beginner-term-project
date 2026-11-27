import { leagueSeasons, type LeagueResultRecord } from '../data/leagueResults'

type Props = {
  record: LeagueResultRecord | null
  onSelectRecord: (record: LeagueResultRecord) => void
  onBack: () => void
}

const archiveRecords: LeagueResultRecord[] = leagueSeasons.flatMap((season) =>
  season.events.flatMap((event) =>
    event.finalists.map((finalist) => ({
      ...finalist,
      year: season.year,
      eventName: event.name,
    })),
  ),
).sort((first, second) => second.year - first.year)

function recordKey(record: LeagueResultRecord) {
  return [record.year, record.eventName, record.id, record.result].join('-')
}

function ArchiveImage({ record }: { record: LeagueResultRecord }) {
  return record.imagePath ? (
    <img
      className="archive-photo"
      src={import.meta.env.BASE_URL + record.imagePath.replace(/^\/+/, '')}
      alt={record.year + ' ' + record.eventName + ' ' + record.result + ' ' + record.name + ' 사진'}
    />
  ) : (
    <div className="archive-photo-placeholder">
      {record.logo ? (
        <img src={import.meta.env.BASE_URL + record.logo.replace(/^\/+/, '')} alt="" />
      ) : (
        <span>{record.shortName.slice(0, 3)}</span>
      )}
      <small>PHOTO TO BE ADDED</small>
    </div>
  )
}

export default function ArchivePage({ record, onSelectRecord, onBack }: Props) {
  if (record) {
    return (
      <section className="archive-page archive-detail-page">
        <button className="archive-back" type="button" onClick={onBack}>← ALL ARCHIVE</button>
        <div className="archive-detail-heading">
          <p className="eyebrow">{record.year} · {record.eventName}</p>
          <h1><span>{record.result}</span> {record.name}</h1>
          <p>{record.result === '우승' ? '대회의 우승팀 기록과 기념 사진입니다.' : '대회의 준우승팀 기록과 기념 사진입니다.'}</p>
        </div>
        <div className="archive-detail-photo"><ArchiveImage record={record} /></div>
      </section>
    )
  }

  return (
    <section className="archive-page" id="archive">
      <header className="archive-heading">
        <div>
          <p className="eyebrow">MOMENTS WORTH KEEPING</p>
          <h1>PHOTO <span>ARCHIVE</span></h1>
          <p>시즌과 대회를 구분하지 않고 결승 사진을 한곳에 모았습니다.</p>
        </div>
        <span>2022—2026 · {archiveRecords.length} RECORDS</span>
      </header>
      <div className="archive-card-grid">
        {archiveRecords.map((item) => (
          <button className="archive-card" type="button" key={recordKey(item)} onClick={() => onSelectRecord(item)}>
            <ArchiveImage record={item} />
            <span className={'archive-card-result archive-card-result-' + (item.result === '우승' ? 'champion' : 'runner-up')}>{item.result}</span>
            <strong>{item.name}</strong>
            <span className="archive-card-meta">{item.year} · {item.eventName}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
