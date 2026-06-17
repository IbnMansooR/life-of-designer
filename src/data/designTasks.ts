// Dizayn topshiriqlari — TZ (shartlar) generatori (Part 4: design project system).

export type ShapeType = 'circle' | 'square' | 'triangle'

export interface DesignColor {
  name: string
  hex: string
}

export const DESIGN_COLORS: DesignColor[] = [
  { name: 'Ko‘k', hex: '#3b82f6' },
  { name: 'Qizil', hex: '#ef4444' },
  { name: 'Yashil', hex: '#22c55e' },
  { name: 'Sariq', hex: '#eab308' },
  { name: 'Binafsha', hex: '#8b5cf6' },
  { name: 'Qora', hex: '#1f2937' }
]

export const SHAPE_LABEL: Record<ShapeType, string> = {
  circle: 'doira',
  square: 'kvadrat',
  triangle: 'uchburchak'
}

export const SHAPES: ShapeType[] = ['circle', 'square', 'triangle']

export interface BriefTarget {
  shape: ShapeType
  color: DesignColor
}

export interface DesignBrief {
  title: string
  targets: BriefTarget[]
}

function pick<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)]
}

/** Loyiha turiga qarab TZ yaratadi (2–3 shart). */
export function makeBrief(projectType: string): DesignBrief {
  const count = 2 + Math.floor(Math.random() * 2)
  const targets: BriefTarget[] = []
  for (let i = 0; i < count; i++) {
    targets.push({ shape: pick(SHAPES), color: pick(DESIGN_COLORS) })
  }
  return { title: `${projectType} — TZ`, targets }
}

export function briefText(b: DesignBrief): string {
  return b.targets.map((t) => `${t.color.name} ${SHAPE_LABEL[t.shape]}`).join(' + ')
}
