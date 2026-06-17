// PontoRest & ijtimoiy ma'lumotlari — ilhom va social (Part 5).

export interface Inspiration {
  id: string
  title: string
  category: string
  emoji: string
}

export const INSPIRATIONS: Inspiration[] = [
  { id: 'i1', title: 'Minimalist logo', category: 'Branding', emoji: '🔷' },
  { id: 'i2', title: 'Brending tizimi', category: 'Branding', emoji: '🎯' },
  { id: 'i3', title: 'UI kit', category: 'UI', emoji: '📱' },
  { id: 'i4', title: 'Tipografiya', category: 'Type', emoji: '🔠' },
  { id: 'i5', title: 'Rang palitra', category: 'Color', emoji: '🎨' },
  { id: 'i6', title: 'Poster dizayn', category: 'Print', emoji: '🖼️' },
  { id: 'i7', title: '3D render', category: '3D', emoji: '🧊' },
  { id: 'i8', title: 'Illyustratsiya', category: 'Art', emoji: '✏️' },
  { id: 'i9', title: 'Motion grafika', category: 'Motion', emoji: '🎬' }
]

// Ijtimoiy tarmoqda post qo'yish uchun minimal portfolio.
export const POST_PORTFOLIO_MIN = 5

export function formatFollowers(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}
