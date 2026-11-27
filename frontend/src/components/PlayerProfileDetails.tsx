/* 선수 상세 링크 버블 */

import { useState } from 'react'
import type { PlayerProfileLink } from '../data/playerProfiles'

type Props = { links: PlayerProfileLink[] }

export default function PlayerProfileDetails({ links }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  if (links.length === 0) return null

  return (
    <section className="career-details" aria-label="선수 상세 정보">
      <button
        className="career-details-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls="player-profile-links"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? '간단히 보기' : '자세히 보기'} <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && <div className="career-detail-bubbles" id="player-profile-links">
        {links.map((link) => <a
          className="career-detail-bubble"
          href={link.href}
          target="_blank"
          rel="noreferrer"
          key={`${link.category}-${link.href}`}
        >
          <span>{link.category}</span><strong>{link.title}</strong>
        </a>)}
      </div>}
    </section>
  )
}
