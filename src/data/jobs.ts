// Karera ma'lumotlari — freelance ishlar, mijozlar, kurslar, daraja (Part 4).
import type { DesignBrief } from './designTasks'

export interface Project {
  id: string
  title: string
  client: string
  type: string
  budget: number
  difficulty: number // 1..3
  deadlineDays: number
  progress: number // 0..100
  quality?: number // 0..1 — ish jarayonidagi o'rtacha sifat (brief'ga moslik)
  brief?: DesignBrief // loyihaga biriktirilgan barqaror TZ (save/load orasida ham saqlanadi)
  satisfiedTargets?: number[] // bajarilgan brief target indekslari (qayta farmni oldini oladi)
}

export interface Course {
  id: string
  name: string
  cost: number
  skillGain: number
  hours: number
}

const CLIENTS = [
  'Olma Cafe',
  'Nur Market',
  'TechBoss MChJ',
  'StartUp X',
  'Bahor Bank',
  'Zamin Qurilish',
  'Foto Studio',
  'Oson Taksi',
  'Shirin Shop',
  'IT Akademiya',
  'Global Media',
  'Yashil Bog‘'
]

const TYPES: { type: string; base: number }[] = [
  { type: 'Logo', base: 300_000 },
  { type: 'Banner', base: 200_000 },
  { type: 'Ijtimoiy tarmoq post', base: 250_000 },
  { type: 'Plakat', base: 350_000 },
  { type: 'UI dizayn', base: 900_000 },
  { type: 'Brending', base: 1_600_000 },
  { type: 'Veb-sayt dizayn', base: 1_200_000 }
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateJob(): Project {
  const client = pick(CLIENTS)
  const pt = pick(TYPES)
  const difficulty = 1 + Math.floor(Math.random() * 3)
  const raw = pt.base * (0.8 + Math.random() * 0.6) * (0.85 + difficulty * 0.18)
  const budget = Math.max(100_000, Math.round(raw / 50_000) * 50_000)
  return {
    id: 'job_' + Math.random().toString(36).slice(2, 8),
    title: `${pt.type} — ${client}`,
    client,
    type: pt.type,
    budget,
    difficulty,
    deadlineDays: 2 + Math.floor(Math.random() * 5),
    progress: 0
  }
}

export function generateJobs(n: number): Project[] {
  return Array.from({ length: n }, () => generateJob())
}

export const COURSES: Course[] = [
  { id: 'c_typo', name: 'Typografiya asoslari', cost: 150_000, skillGain: 6, hours: 3 },
  { id: 'c_brand', name: 'Brending kursi', cost: 400_000, skillGain: 12, hours: 5 },
  { id: 'c_uiux', name: 'UI/UX dizayn kursi', cost: 700_000, skillGain: 18, hours: 6 }
]

export interface CareerLevel {
  level: number
  title: string
}

/** Portfolio darajasiga qarab karera bosqichi (Part 4: Level 0..6). */
export function careerLevel(portfolio: number): CareerLevel {
  if (portfolio >= 92) return { level: 6, title: 'Agency Founder' }
  if (portfolio >= 80) return { level: 5, title: 'Creative Director' }
  if (portfolio >= 65) return { level: 4, title: 'Art Director' }
  if (portfolio >= 45) return { level: 3, title: 'Senior Designer' }
  if (portfolio >= 25) return { level: 2, title: 'Middle Designer' }
  if (portfolio >= 10) return { level: 1, title: 'Junior Designer' }
  return { level: 0, title: 'Beginner Designer' }
}
