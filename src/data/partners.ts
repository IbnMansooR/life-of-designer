// Munosabat ma'lumotlari — juft nomzodlar, uchrashuv joylari, farzand (Part 2).

export interface Child {
  name: string
  ageDays: number // o'yin kunlarida; yosh = floor(ageDays / DAYS_PER_YEAR)
}

export type RelStatus = 'dating' | 'engaged' | 'married'

export interface Partner {
  id: string
  name: string
  age: number
  job: string
  personality: string
  relationship: number // 0..100
  status: RelStatus
  lastContactDay: number
  children: Child[]
}

const NAMES = [
  'Malika',
  'Sevara',
  'Dilnoza',
  'Nigora',
  'Kamola',
  'Madina',
  'Gulnoza',
  'Aziza',
  'Shahzoda',
  'Zarina'
]
const JOBS = ['O‘qituvchi', 'Shifokor', 'Dizayner', 'Dasturchi', 'Jurnalist', 'Rassom', 'Tadbirkor']
const PERSONALITIES = ['Oilaparvar', 'Ijodkor', 'Mustaqil', 'Sokin', 'Faol', 'Mehribon']
const CHILD_NAMES = ['Ali', 'Hasan', 'Husan', 'Oysha', 'Maryam', 'Yusuf', 'Bilol', 'Sora', 'Iso', 'Nur']

export const DAYS_PER_YEAR = 20
export const ENGAGE_THRESHOLD = 60
export const MARRY_THRESHOLD = 75
export const WEDDING_COST = 5_000_000

export interface DateVenue {
  name: string
  cost: number
  rel: number
}

export const DATE_VENUES: DateVenue[] = [
  { name: 'Kafe', cost: 80_000, rel: 5 },
  { name: 'Kino', cost: 120_000, rel: 6 },
  { name: 'Restoran', cost: 250_000, rel: 9 },
  { name: 'Sayohat', cost: 1_500_000, rel: 20 }
]

function pick<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)]
}

/** Nomzod profili (hali juft emas — relationship 0). */
export function generateCandidate(): Partner {
  return {
    id: 'p_' + Math.random().toString(36).slice(2, 8),
    name: pick(NAMES),
    age: 19 + Math.floor(Math.random() * 8),
    job: pick(JOBS),
    personality: pick(PERSONALITIES),
    relationship: 0,
    status: 'dating',
    lastContactDay: 0,
    children: []
  }
}

export function generateCandidates(n: number): Partner[] {
  return Array.from({ length: n }, () => generateCandidate())
}

export function randomChildName(): string {
  return CHILD_NAMES[Math.floor(Math.random() * CHILD_NAMES.length)]
}

export function statusLabel(s: RelStatus): string {
  return s === 'married' ? 'Turmush qurgan' : s === 'engaged' ? 'Unashtirilgan' : 'Uchrashuvda'
}

/** Farzand yosh bosqichi (Part 2: child development). */
export function childStage(ageDays: number): string {
  const years = Math.floor(ageDays / DAYS_PER_YEAR)
  if (years < 1) return 'chaqaloq'
  if (years <= 5) return 'kichik bola'
  if (years <= 12) return 'maktab yoshi'
  if (years <= 17) return 'o‘smir'
  return 'katta'
}

export function childYears(ageDays: number): number {
  return Math.floor(ageDays / DAYS_PER_YEAR)
}
