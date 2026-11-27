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
    names: ['zeus', '최우제'],
    careerBackground: 'playersign/zeus_sign.png',
    links: [
      { category: '개인 SNS', title: 'Instagram · @godthunderzeus', href: 'https://www.instagram.com/godthunderzeus/' },
      { category: '개인 방송국', title: 'SOOP · 제우스', href: 'https://www.sooplive.com/station/kcphy0909rk' },
      { category: '대표 LoL 아이디', title: 'Athene #lll · LOL.PS 검색 ↗', href: 'https://lol.ps/summoner/Athene%20_lll?region=kr' },
    ],
  },
  {
    names: ['doran', '최현준'],
    careerBackground: 'playersign/doran_sign.png',
    links: [
      { category: '개인 SNS', title: 'Instagram · @choi_doran', href: 'https://www.instagram.com/choi_doran/' },
      { category: '개인 방송국', title: 'SOOP · 도란도라아안', href: 'https://www.sooplive.com/station/choi15778' },
      { category: '대표 LoL 아이디', title: '어리고싶다#KR1 · LOL.PS에서 검색 ↗', href: 'https://lol.ps/summoner/unknown?pid=eBWyzenGMo1MffcTjqVXi4EOsJraaz8HeMcARhN_UtdQvSC0DOcv5eoDn-Aio5itjko9cDyVOlfLOw&region=kr' },
    ],
  },
  {
    names: ['oner', '문현준'],
    careerBackground: 'playersign/oner_sign.png',
    links: [
      { category: '개인 SNS', title: 'Instagram · @t1_oner', href: 'https://www.instagram.com/t1_oner/' },
      { category: '개인 방송국', title: 'SOOP · onerrrr', href: 'https://www.sooplive.com/station/ansguswns519' },
      { category: '대표 LoL 아이디', title: '오 너 #111 · LOL.PS 검색 ↗', href: 'https://lol.ps/summoner/unknown?pid=EUHsoOan4Z4i8No88hdBFinXKE_uLRoel8mVxvU7gsnrTeGmBsMnVR_fPQvLMi6NCPu9Pxjqb1neDQ&region=kr' },
      { category: 'Youtube', title: '이리오너라', href: 'https://www.youtube.com/@comehere_oner' },
    ],
  },
  {
    names: ['faker', '이상혁'],
    careerBackground: 'playersign/faker_sign.png',
    links: [
      { category: '개인 SNS', title: 'Instagram · @faker', href: 'https://www.instagram.com/faker/' },
      { category: '개인 방송국', title: 'SOOP · Faker', href: 'https://www.sooplive.com/station/faker' },
      { category: '대표 LoL 아이디', title: 'Hide on bush #KR1 ↗', href: 'https://lol.ps/prostreamer/pro/2055' },
      { category: 'Youtube', title: 'T1 Faker', href: 'https://www.youtube.com/@T1_Faker' },
    ],
  },
  {
    names: ['ruler', '박재혁'],
    careerBackground: 'playersign/ruler_sign.png',
    links: [],
  },
  {
    names: ['chovy', '정지훈'],
    careerBackground: 'playersign/chovy_sign.png',
    links: [],
  },
  {
    names: ['cloud', '문현호'],
    careerBackground: 'playersign/cloud_sign.png',
    links: [],
  },
  {
    names: ['kiin', '김기인'],
    careerBackground: 'playersign/kiin_sign.png',
    links: [],
  },
  {
    names: ['canyon', '김건부'],
    careerBackground: 'playersign/canyon_sign.png',
    links: [],
  },
  {
    names: ['duro', '주민규'],
    careerBackground: 'playersign/duro_sign.png',
    links: [],
  },
  {
    names: ['peyz', '김수환'],
    careerBackground: 'playersign/peyz_sign.png',
    links: [
      { category: '개인 SNS', title: 'Instagram · @lol_peyz', href: 'https://www.instagram.com/lol_peyz/' },
      { category: '개인 방송국', title: 'SOOP · 페이즈으', href: 'https://www.sooplive.com/station/rlantnghks' },
      { category: '대표 LoL 아이디', title: 'Peyz #KR11 · LOL.PS 검색 ↗', href: 'https://lol.ps/summoner/Peyz%20_KR11?region=kr' },
    ],
  },
  {
    names: ['gumayusi', '이민형'],
    links: [
      { category: '개인 SNS', title: 'Instagram · @t1_gumayusi', href: 'https://www.instagram.com/t1_gumayusi/' },
      { category: '개인 방송국', title: 'Chzzk · HLE Gumayusi', href: 'https://chzzk.naver.com/7c802d1b0c9c2872952fe1b8ba4268bd' },
      { category: '대표 LoL 아이디', title: 'HLE Gumayusi #0298 · LOL.PS에서 검색 ↗', href: 'https://lol.ps/summoner/HLE%20Gumayusi%20_0298?region=kr' },
      { category: 'Youtube', title: 'Gumayusi', href: 'https://www.youtube.com/@Gumayusi_Official' },
    ],
  },
  {
    names: ['keria', '류민석'],
    careerBackground: 'playersign/keria_sign.png',
    links: [
      { category: '개인 SNS', title: 'Instagram · @keria_minseok', href: 'https://www.instagram.com/keria_minseok/' },
      { category: '개인 방송국', title: 'SOOP · 케리아아', href: 'https://www.sooplive.com/station/fbalstjr1234' },
      { category: '대표 LoL 아이디', title: 'Keria · LOL.PS에서 검색 ↗', href: 'https://lol.ps/' },
      { category: 'Youtube', title: 'T1 Keria', href: 'https://www.youtube.com/@T1Keria' },
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
