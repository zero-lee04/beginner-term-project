import type { CareerPlayer } from '../types'

export type SeasonAchievement = {
  competition: string
  result: '우승' | '준우승'
}

// 연도별 LCK 및 국제 대회 성적입니다.
const seasonAchievements: Record<string, Record<number, SeasonAchievement[]>> = {
  faker: {
    2023: [
      { competition: 'LCK 스프링', result: '준우승' },
      { competition: 'LCK 서머', result: '준우승' },
      { competition: '월드 챔피언십', result: '우승' },
    ],
    2024: [
      { competition: 'LCK 스프링', result: '준우승' },
      { competition: '월드 챔피언십', result: '우승' },
    ],
    2025: [
      { competition: 'MSI', result: '준우승' },
      { competition: '월드 챔피언십', result: '우승' },
    ],
  },
}

export function getPlayerSeasonAchievements(player: CareerPlayer, season: number): SeasonAchievement[] {
  const names = [player.name, player.koreanName]
    .map((name) => name.trim().toLocaleLowerCase())
    .filter(Boolean)

  if (!names.some((name) => name === 'faker' || name === '이상혁')) return []
  return seasonAchievements.faker[season] ?? []
}
