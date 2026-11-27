/* 선수별 SNS, 방송국, 대표 게임 계정 링크 */

import type { CareerPlayer } from '../types'

export type PlayerProfileLink = {
  category: string
  title: string
  href: string
}

type PlayerProfile = {
  names: string[]
  links: PlayerProfileLink[]
  careerBackground?: string
}

const playerProfiles: PlayerProfile[] = [
  {
    names: ['faker', '이상혁'],
    careerBackground: 'faker_sign.png',
    links: [
      { category: '개인 SNS', title: 'Instagram · @faker', href: 'https://www.instagram.com/faker/' },
      { category: '개인 방송국', title: 'SOOP · 고전파0', href: 'https://www.sooplive.com/station/leesh2148' },
      { category: '대표 LoL 아이디', title: 'Hide on bush #KR1 ↗', href: 'https://lol.ps/prostreamer/pro/2055' },
      { category: 'Youtube', title: 'T1 Faker', href: 'https://www.youtube.com/@T1_Faker' },
    ],
  },
]

export function getPlayerProfileLinks(player: CareerPlayer): PlayerProfileLink[] {
  const names = [player.name, player.koreanName]
    .map((name) => name.trim().toLocaleLowerCase())
    .filter(Boolean)

  return playerProfiles.find((profile) =>
    profile.names.some((name) => names.includes(name.toLocaleLowerCase())),
  )?.links ?? []
}

export function getPlayerCareerBackground(player: CareerPlayer): string | undefined {
  const names = [player.name, player.koreanName]
    .map((name) => name.trim().toLocaleLowerCase())
    .filter(Boolean)

  return playerProfiles.find((profile) =>
    profile.names.some((name) => names.includes(name.toLocaleLowerCase())),
  )?.careerBackground
}
