// Biznes ma'lumotlari — agentlik, xodimlar, ofis (Part 4: business system).

export interface Employee {
  id: string
  name: string
  role: string
  skill: number // 0..100
  salary: number // kunlik maosh
}

export interface Agency {
  name: string
  foundedDay: number
  officeLevel: number
  employees: Employee[]
  candidates: Employee[]
}

const NAMES = [
  'Aziz',
  'Dilshod',
  'Kamola',
  'Nodira',
  'Bek',
  'Laziz',
  'Gulnora',
  'Sherzod',
  'Madina',
  'Otabek',
  'Zarina',
  'Jahongir'
]

const ROLES = [
  'Junior Designer',
  'Senior Designer',
  'UI Designer',
  '3D Artist',
  'Marketer',
  'Manager'
]

export interface OfficeLevel {
  name: string
  capacity: number
  upgradeCost: number // shu darajaga chiqish narxi
}

export const OFFICES: OfficeLevel[] = [
  { name: 'Kichik xona', capacity: 2, upgradeCost: 0 },
  { name: 'Studio', capacity: 4, upgradeCost: 2_000_000 },
  { name: 'Katta ofis', capacity: 8, upgradeCost: 6_000_000 },
  { name: 'Biznes markaz', capacity: 16, upgradeCost: 15_000_000 }
]

// Agentlik ochish sharti
export const FOUND_COST = 2_000_000
export const FOUND_PORTFOLIO = 15

function pick<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)]
}

export function generateCandidate(): Employee {
  const skill = 20 + Math.floor(Math.random() * 61) // 20..80
  const salary = Math.round((skill * 4500 + 80_000) / 10_000) * 10_000
  return {
    id: 'emp_' + Math.random().toString(36).slice(2, 8),
    name: pick(NAMES),
    role: pick(ROLES),
    skill,
    salary
  }
}

export function generateCandidates(n: number): Employee[] {
  return Array.from({ length: n }, () => generateCandidate())
}

/** Xodimlar soniga qarab kompaniya bosqichi (Part 4: business growth). */
export function agencyTitle(employeeCount: number): string {
  if (employeeCount >= 10) return 'Xalqaro kompaniya'
  if (employeeCount >= 5) return 'Milliy kompaniya'
  if (employeeCount >= 2) return 'Kichik agentlik'
  return '1 xonali studio'
}
