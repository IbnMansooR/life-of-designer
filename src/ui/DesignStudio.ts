// Dizayn studiyasi — boyitilgan TZ panel + chizish kenvasi (Phase 17).
import { el } from './dom'
import {
  type DesignBrief,
  type ShapeType,
  SHAPE_LABEL,
  SHAPES,
} from '../data/designTasks'

export interface DesignStudioCallbacks {
  onSubmit: (quality: number) => void
  onClose?: () => void
}

interface Placed {
  shape: ShapeType
  hex: string
  x: number
  y: number
}

export class DesignStudio {
  private root: HTMLElement
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private briefPanel!: HTMLElement
  private toolButtons: { shape: ShapeType; btn: HTMLButtonElement }[] = []
  private colorButtons: HTMLButtonElement[] = []
  private undoStack: Placed[][] = []
  private brief: DesignBrief | null = null
  private placed: Placed[] = []
  private selShape: ShapeType = 'circle'
  private selColor = '#3b82f6'
  isOpen = false

  constructor(parent: HTMLElement, private cb: DesignStudioCallbacks) {
    this.canvas = el('canvas', {
      class: 'ds-canvas',
      attrs: { width: '440', height: '320' }
    }) as HTMLCanvasElement
    this.ctx = this.canvas.getContext('2d')!
    this.canvas.addEventListener('click', (e) => this.onCanvasClick(e))

    const shapeRow = el('div', { class: 'ds-tools' },
      SHAPES.map((s) => {
        const btn = el('button', { class: 'ds-tool', text: SHAPE_LABEL[s] }) as HTMLButtonElement
        btn.addEventListener('click', () => { this.selShape = s; this.refreshTools() })
        this.toolButtons.push({ shape: s, btn })
        return btn
      })
    )

    this.colorButtons = []
    const colorRow = el('div', { class: 'ds-colors', attrs: { id: 'ds-color-row' } })

    this.briefPanel = el('div', { class: 'ds-brief-panel' })

    this.root = el('div', { class: 'screen design-studio hidden' }, [
      el('div', { class: 'ds-window' }, [
        el('div', { class: 'ds-titlebar' }, [
          el('span', { class: 'ds-title', text: '🎨 Dizayn Studiyasi' }),
          el('button', { class: 'pc-close', text: '✕', on: { click: () => this.close() } })
        ]),
        el('div', { class: 'ds-body' }, [
          this.briefPanel,
          el('div', { class: 'ds-right' }, [
            el('div', { class: 'ds-toolbar' }, [
              el('span', { class: 'ds-label', text: 'Shakl:' }),
              shapeRow,
              el('span', { class: 'ds-label', text: 'Rang:' }),
              colorRow
            ]),
            this.canvas,
            el('div', { class: 'ds-actions' }, [
              el('button', { class: 'btn-ghost', text: 'Bekor qil', on: { click: () => this.undo() } }),
              el('button', { class: 'btn-ghost', text: 'Tozalash', on: { click: () => { this.placed = []; this.undoStack = []; this.redraw() } } }),
              el('button', { class: 'btn-cta', text: 'Topshirish', on: { click: () => this.submit() } })
            ])
          ])
        ])
      ])
    ])
    parent.appendChild(this.root)
  }

  open(brief: DesignBrief): void {
    this.brief = brief
    this.placed = []
    this.undoStack = []
    this.selShape = 'circle'
    this.selColor = brief.palette[0]?.hex ?? '#3b82f6'
    this.buildBriefPanel(brief)
    this.buildColorRow(brief)
    this.refreshTools()
    this.redraw()
    this.isOpen = true
    this.root.classList.remove('hidden')
  }

  close(): void {
    this.isOpen = false
    this.root.classList.add('hidden')
    this.cb.onClose?.()
  }

  private buildBriefPanel(b: DesignBrief): void {
    this.briefPanel.innerHTML = ''

    // Mijoz va tur
    const header = el('div', { class: 'ds-bp-header' }, [
      el('div', { class: 'ds-bp-type', text: b.projectType.toUpperCase() }),
      el('div', { class: 'ds-bp-client', text: b.client }),
      el('div', { class: 'ds-bp-industry', text: b.industry }),
    ])

    // Tavsif
    const desc = el('div', { class: 'ds-bp-desc', text: b.description })

    // Stil teglari
    const tags = el('div', { class: 'ds-bp-tags' },
      b.style.map((s) => {
        const t = el('span', { class: 'ds-tag', text: s.label })
        t.style.background = s.bg
        t.style.color = s.fg
        return t
      })
    )

    // Talablar
    const reqTitle = el('div', { class: 'ds-bp-section', text: '📋 Talablar' })
    const reqList = el('ul', { class: 'ds-bp-list' },
      b.requirements.map((r) => el('li', { text: r }))
    )

    // Rang palitasi
    const palTitle = el('div', { class: 'ds-bp-section', text: '🎨 Rang palitasi' })
    const palette = el('div', { class: 'ds-bp-palette' },
      b.palette.map((c) => {
        const swatch = el('div', { class: 'ds-swatch' })
        swatch.style.background = c.hex
        swatch.title = `${c.name} ${c.hex}`
        swatch.addEventListener('click', () => {
          this.selColor = c.hex
          this.refreshColorButtons()
        })
        const label = el('div', { class: 'ds-swatch-label', text: c.name })
        const wrap = el('div', { class: 'ds-swatch-wrap' }, [swatch, label])
        return wrap
      })
    )

    // Mood board
    const moodTitle = el('div', { class: 'ds-bp-section', text: '✨ Mood board' })
    const mood = el('div', { class: 'ds-mood-grid' },
      b.mood.map((m) => {
        const tile = el('div', { class: 'ds-mood-tile' })
        tile.style.background = m.color
        const lbl = el('div', { class: 'ds-mood-label', text: m.label })
        return el('div', { class: 'ds-mood-wrap' }, [tile, lbl])
      })
    )

    this.briefPanel.append(header, desc, tags, reqTitle, reqList, palTitle, palette, moodTitle, mood)
  }

  private buildColorRow(b: DesignBrief): void {
    const row = this.root.querySelector('#ds-color-row') as HTMLElement
    if (!row) return
    row.innerHTML = ''
    this.colorButtons = []

    // Brief palitasidan + extra ranglar
    const extraHex = ['#ffffff', '#0f172a', '#ef4444', '#eab308', '#22c55e']
    const allColors = [
      ...b.palette.map((c) => c.hex),
      ...extraHex.filter((h) => !b.palette.some((c) => c.hex === h))
    ]

    allColors.forEach((hex) => {
      const btn = el('button', { class: 'ds-color' }) as HTMLButtonElement
      btn.style.background = hex
      btn.style.boxShadow = hex === '#ffffff' ? 'inset 0 0 0 1px #cbd5e1' : ''
      btn.addEventListener('click', () => { this.selColor = hex; this.refreshColorButtons() })
      this.colorButtons.push(btn)
      row.appendChild(btn)
    })
    this.refreshColorButtons()
  }

  private refreshTools(): void {
    for (const t of this.toolButtons) {
      t.btn.classList.toggle('active', t.shape === this.selShape)
    }
    this.refreshColorButtons()
  }

  private refreshColorButtons(): void {
    for (const btn of this.colorButtons) {
      btn.classList.toggle('active', btn.style.background === this.selColor ||
        this.normalizeHex(btn.style.background) === this.selColor)
    }
    // Swatch'lardagi highlight
    const swatches = this.briefPanel.querySelectorAll<HTMLElement>('.ds-swatch')
    swatches.forEach((sw) => {
      sw.classList.toggle('active', sw.style.background === this.selColor ||
        this.normalizeHex(sw.style.background) === this.selColor)
    })
  }

  private normalizeHex(cssColor: string): string {
    // rgb(r,g,b) -> #rrggbb (browser inline style ni hex ga)
    const m = cssColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (!m) return cssColor
    return '#' + [m[1], m[2], m[3]].map((n) => parseInt(n).toString(16).padStart(2, '0')).join('')
  }

  private onCanvasClick(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (this.canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (this.canvas.height / rect.height)
    this.undoStack.push([...this.placed])
    this.placed.push({ shape: this.selShape, hex: this.selColor, x, y })
    this.redraw()
  }

  private undo(): void {
    if (this.undoStack.length === 0) return
    this.placed = this.undoStack.pop()!
    this.redraw()
  }

  private redraw(): void {
    const c = this.ctx
    c.fillStyle = '#ffffff'
    c.fillRect(0, 0, this.canvas.width, this.canvas.height)
    // Grid chizig'i (faint)
    c.strokeStyle = '#f1f5f9'
    c.lineWidth = 1
    for (let x = 0; x < this.canvas.width; x += 40) {
      c.beginPath(); c.moveTo(x, 0); c.lineTo(x, this.canvas.height); c.stroke()
    }
    for (let y = 0; y < this.canvas.height; y += 40) {
      c.beginPath(); c.moveTo(0, y); c.lineTo(this.canvas.width, y); c.stroke()
    }
    for (const p of this.placed) this.drawShape(p)
  }

  private drawShape(p: Placed): void {
    const c = this.ctx
    c.fillStyle = p.hex
    c.strokeStyle = 'rgba(0,0,0,0.08)'
    c.lineWidth = 1.5
    const r = 24
    if (p.shape === 'circle') {
      c.beginPath(); c.arc(p.x, p.y, r, 0, Math.PI * 2)
      c.fill(); c.stroke()
    } else if (p.shape === 'square') {
      c.beginPath(); c.roundRect(p.x - r, p.y - r, r * 2, r * 2, 4)
      c.fill(); c.stroke()
    } else if (p.shape === 'triangle') {
      c.beginPath()
      c.moveTo(p.x, p.y - r)
      c.lineTo(p.x + r, p.y + r)
      c.lineTo(p.x - r, p.y + r)
      c.closePath(); c.fill(); c.stroke()
    } else {
      // rect
      c.beginPath(); c.roundRect(p.x - r * 1.5, p.y - r * 0.65, r * 3, r * 1.3, 4)
      c.fill(); c.stroke()
    }
  }

  private submit(): void {
    const quality = this.score()
    this.close()
    this.cb.onSubmit(quality)
  }

  private score(): number {
    if (!this.brief || this.brief.targets.length === 0) return 0.5
    let matched = 0
    const usedHexes = new Set(this.placed.map((p) => p.hex.toLowerCase()))
    for (const t of this.brief.targets) {
      const colorMatch = usedHexes.has(t.color.hex.toLowerCase())
      const shapeMatch = this.placed.some((p) => p.shape === t.shape)
      if (colorMatch && shapeMatch) matched += 1
      else if (colorMatch || shapeMatch) matched += 0.4
    }
    // Bonus: kompozitsiya (10+ element)
    const bonus = this.placed.length >= 6 ? 0.15 : this.placed.length >= 3 ? 0.05 : 0
    return Math.min(1, matched / this.brief.targets.length + bonus)
  }

  dispose(): void { this.root.remove() }
}
