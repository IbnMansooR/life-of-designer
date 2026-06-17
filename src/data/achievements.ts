// Yutuqlar (achievements) — bosqichlar uchun mukofot (Part 5).
import type { GameState } from '../game/GameState'

export interface Achievement {
  id: string
  title: string
  test: (gs: GameState) => boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_project', title: 'Birinchi loyiha', test: (g) => g.completedProjects >= 1 },
  { id: 'five_projects', title: '5 ta loyiha', test: (g) => g.completedProjects >= 5 },
  { id: 'junior', title: 'Junior Designer', test: (g) => g.portfolio >= 10 },
  { id: 'senior', title: 'Senior Designer', test: (g) => g.portfolio >= 45 },
  { id: 'entrepreneur', title: 'Tadbirkor', test: (g) => g.agency !== null },
  { id: 'team', title: 'Jamoa', test: (g) => !!g.agency && g.agency.employees.length >= 3 },
  { id: 'millionaire', title: 'Millioner', test: (g) => g.money >= 10_000_000 },
  { id: 'good_child', title: 'Mehribon farzand', test: (g) => g.familyRelationship >= 90 },
  { id: 'married', title: 'Turmush qurdi', test: (g) => g.partner?.status === 'married' },
  { id: 'parent', title: 'Ota bo‘ldi', test: (g) => !!g.partner && g.partner.children.length > 0 },
  { id: 'influencer', title: 'Influencer (1K)', test: (g) => g.followers >= 1000 }
]
