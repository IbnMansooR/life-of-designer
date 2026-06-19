// Dizayn studiyasi — boyitilgan TZ panel + JONLI ish jarayoni (Phase 18).
// Har bir qo'yilgan shakl loyiha progressini real-time siljitadi.
import { el } from './dom'
import {
  type DesignBrief,
  type ShapeType,
  SHAPE_LABEL,
  SHAPES,
} from '../data/designTasks'
import type { DesignActionResult } from '../game/GameState'

export interface DesignStudioCallbacks {
  // Har bir amal (shakl qo'yish) uchun: jonli progress qo'llaydi, natijani qaytaradi.
  onAction: (actionQuality: number) => DesignActionResult
  // Yangi brief target bajarilganda — loyihaga saqlash uchun (qayta farmni oldini oladi).
  onSatisfy?: (targetIndex: number) => void
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
  private progFill!: HTMLElement
  private progLabel!: HTMLElement
  private gainLabel!: HTMLElement
  private energyLabel!: HTMLElement
  private doneBanner!: HTMLElement
  private toolButtons: { shape: ShapeType; btn: HTMLButtonElement }[] = []
  private colorButtons: HTMLButtonElement[] = []
  private undoStack: Placed[][] = []
  private brief: DesignBrief | null = null
  private placed: Placed[] = []
  private satisfied = new Set<number>()  // bajarilgan brief target indekslari
  private selShape: ShapeType = 'circle'
  private selColor = '#3b82f6'
  private progress = 0
  private finished = false
  private exhausted = false
  isOpen = false

  constructor(parent: HTMLElement, private cb: DesignStudioCallbacks) {
    this.canvas = el('canvas', {
      class: 'ds-canvas',
      attrs: { width: '440', height: '300' }
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

    // Jonli progress bar
    this.progFill = el('span', { class: 'ds-progress-fill' })
    this.progLabel = el('span', { class: 'ds-progress-pct', text: '0%' })
    this.gainLabel = el('span', { class: 'ds-progress-gain' })
    this.energyLabel = el('span', { class: 'ds-energy', text: '⚡ 100%' })
    const progressBar = el('div', { class: 'ds-progress-wrap' }, [
      el('div', { class: 'ds-progress-head' }, [
        el('span', { class: 'ds-progress-title', text: '🛠 Loyiha bajarilishi' }),
        this.gainLabel,
        this.progLabel,
        this.energyLabel,
      ]),
      el('div', { class: 'ds-progress-track' }, [this.progFill]),
    ])
    this.doneBanner = el('div', { class: 'ds-done-banner hidden', text: '✅ Loyiha tayyor! "Tugatish"ni bosib topshirishga o\'ting.' })

    this.root = el('div', { class: 'screen design-studio hidden' }, [
      el('div', { class: 'ds-window' }, [
        el('div', { class: 'ds-titlebar' }, [
          el('span', { class: 'ds-title', text: '🎨 Dizayn Studiyasi' }),
          el('button', { class: 'pc-close', text: '✕', on: { click: () => this.close() } })
        ]),
        el('div', { class: 'ds-body' }, [
          this.briefPanel,
          el('div', { class: 'ds-right' }, [
            progressBar,
            this.doneBanner,
            el('div', { class: 'ds-toolbar' }, [
              el('span', { class: 'ds-label', text: 'Shakl:' }),
              shapeRow,
              el('span', { class: 'ds-label', text: 'Rang:' }),
              colorRow
            ]),
            this.canvas,
            el('div', { class: 'ds-actions' }, [
              el('span', { class: 'ds-actions-hint', text: 'Varaq vizual — ish progressi yuqorida saqlanadi' }),
              el('button', { class: 'btn-ghost', text: '↶ Shaklni o\'chir', on: { click: () => this.undo() } }),
              el('button', { class: 'btn-ghost', text: 'Varaqni tozala', on: { click: () => { this.placed = []; this.undoStack = []; this.redraw() } } }),
              el('button', { class: 'btn-cta', text: 'Tugatish', on: { click: () => this.close() } })
            ])
          ])
        ])
      ])
    ])
    parent.appendChild(this.root)
  }

  /**
   * brief = loyiha TZ; startProgress = joriy progress; startEnergy = energiya;
   * satisfied = avval bajarilgan target indekslari (qayta ochishda dedupe saqlanadi).
   */
  open(brief: DesignBrief, startProgress: number, startEnergy: number, satisfied: number[] = []): void {
    this.brief = brief
    this.placed = []
    this.undoStack = []
    this.satisfied = new Set(satisfied)
    this.selShape = 'circle'
    this.selColor = brief.palette[0]?.hex ?? '#3b82f6'
    this.progress = startProgress
    this.finished = startProgress >= 100
    this.exhausted = false
    this.buildBriefPanel(brief)
    this.buildColorRow(brief)
    this.refreshTools()
    this.redraw()
    this.updateProgress(startProgress, 0, startEnergy, this.finished)
    this.markGoals()
    this.isOpen = true
    this.root.classList.remove('hidden')
  }

  close(): void {
    this.isOpen = false
    this.root.classList.add('hidden')
    this.cb.onClose?.()
  }

  private updateProgress(progress: number, gain: number, energy: number, done: boolean): void {
    this.progress = progress
    this.progFill.style.width = `${Math.round(progress)}%`
    this.progFill.style.background = done ? 'var(--good)' : 'var(--accent)'
    this.progLabel.textContent = `${Math.round(progress)}%`
    this.energyLabel.textContent = `⚡ ${Math.round(energy)}%`
    this.energyLabel.classList.toggle('low', energy <= 20)
    if (gain > 0) {
      this.gainLabel.textContent = `+${gain.toFixed(1)}%`
      this.gainLabel.classList.remove('hidden')
      // qisqa flash
      this.gainLabel.classList.remove('flash')
      void this.gainLabel.offsetWidth // reflow — animatsiyani qayta ishga tushirish
      this.gainLabel.classList.add('flash')
    } else {
      this.gainLabel.classList.add('hidden')
    }
    this.doneBanner.classList.toggle('hidden', !done)
  }

  // ── Brief panel ────────────────────────────────────────────────────────────
  private buildBriefPanel(b: DesignBrief): void {
    this.briefPanel.innerHTML = ''

    const header = el('div', { class: 'ds-bp-header' }, [
      el('div', { class: 'ds-bp-type', text: b.projectType.toUpperCase() }),
      el('div', { class: 'ds-bp-client', text: b.client }),
      el('div', { class: 'ds-bp-industry', text: b.industry }),
    ])
    const desc = el('div', { class: 'ds-bp-desc', text: b.description })
    const tags = el('div', { class: 'ds-bp-tags' },
      b.style.map((s) => {
        const t = el('span', { class: 'ds-tag', text: s.label })
        t.style.background = s.bg
        t.style.color = s.fg
        return t
      })
    )
    const reqTitle = el('div', { class: 'ds-bp-section', text: '📋 Talablar' })
    const reqList = el('ul', { class: 'ds-bp-list' }, b.requirements.map((r) => el('li', { text: r })))

    // Maqsadli shakllar (checklist) — qaysi shakl+rang kombinatsiyalari kerak
    const goalTitle = el('div', { class: 'ds-bp-section', text: '🎯 Kerakli elementlar' })
    const goalList = el('div', { class: 'ds-goals' },
      b.targets.map((t, i) => {
        const dot = el('span', { class: 'ds-goal-dot' })
        dot.style.background = t.color.hex
        const row = el('div', { class: 'ds-goal-row', attrs: { 'data-goal': String(i) } }, [
          dot,
          el('span', { class: 'ds-goal-text', text: `${t.color.name} ${SHAPE_LABEL[t.shape]}` }),
          el('span', { class: 'ds-goal-check', text: '○' }),
        ])
        return row
      })
    )

    const palTitle = el('div', { class: 'ds-bp-section', text: '🎨 Rang palitasi' })
    const palette = el('div', { class: 'ds-bp-palette' },
      b.palette.map((c) => {
        const swatch = el('div', { class: 'ds-swatch' })
        swatch.style.background = c.hex
        swatch.title = `${c.name} ${c.hex}`
        swatch.addEventListener('click', () => { this.selColor = c.hex; this.refreshColorButtons() })
        const label = el('div', { class: 'ds-swatch-label', text: c.name })
        return el('div', { class: 'ds-swatch-wrap' }, [swatch, label])
      })
    )

    const moodTitle = el('div', { class: 'ds-bp-section', text: '✨ Mood board' })
    const mood = el('div', { class: 'ds-mood-grid' },
      b.mood.map((m) => {
        const tile = el('div', { class: 'ds-mood-tile' })
        tile.style.background = m.color
        return el('div', { class: 'ds-mood-wrap' }, [tile, el('div', { class: 'ds-mood-label', text: m.label })])
      })
    )

    this.briefPanel.append(header, desc, tags, goalTitle, goalList, reqTitle, reqList, palTitle, palette, moodTitle, mood)
  }

  private buildColorRow(b: DesignBrief): void {
    const row = this.root.querySelector('#ds-color-row') as HTMLElement
    if (!row) return
    row.innerHTML = ''
    this.colorButtons = []
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
    for (const t of this.toolButtons) t.btn.classList.toggle('active', t.shape === this.selShape)
    this.refreshColorButtons()
  }

  private refreshColorButtons(): void {
    for (const btn of this.colorButtons) {
      btn.classList.toggle('active', this.normalizeHex(btn.style.background) === this.selColor.toLowerCase())
    }
    const swatches = this.briefPanel.querySelectorAll<HTMLElement>('.ds-swatch')
    swatches.forEach((sw) => {
      sw.classList.toggle('active', this.normalizeHex(sw.style.background) === this.selColor.toLowerCase())
    })
  }

  private normalizeHex(cssColor: string): string {
    const m = cssColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (!m) return cssColor.toLowerCase()
    return '#' + [m[1], m[2], m[3]].map((n) => parseInt(n).toString(16).padStart(2, '0')).join('')
  }

  // ── Amal: shakl qo'yish → jonli progress ────────────────────────────────────
  private onCanvasClick(e: MouseEvent): void {
    // Tugagan yoki charchagan — shakl chizish mumkin, lekin progress qo'shilmaydi.
    if (this.finished || this.exhausted) {
      this.placeShape(e)
      return
    }
    const placed = this.placeShape(e)
    const q = this.actionQuality(placed)
    const r = this.cb.onAction(q)
    this.updateProgress(r.progress, r.gain, r.energy, r.done)
    this.markGoals()
    if (r.done) {
      this.finished = true
    } else if (r.exhausted) {
      // Charchadi — sessiya bloklanadi; dam olib, qaytadan kirish kerak.
      this.exhausted = true
      this.doneBanner.classList.remove('hidden')
      this.doneBanner.textContent = '😪 Juda charchadingiz — "Tugatish"ni bosib dam oling, keyin davom etasiz.'
    }
  }

  private placeShape(e: MouseEvent): Placed {
    const rect = this.canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (this.canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (this.canvas.height / rect.height)
    this.undoStack.push([...this.placed])
    const p: Placed = { shape: this.selShape, hex: this.selColor, x, y }
    this.placed.push(p)
    this.redraw()
    return p
  }

  /**
   * Amal sifati 0..1:
   *  - yangi (hali bajarilmagan) target shakl+rang → 1.0 (va belgilanadi)
   *  - bajarilgan target takrori (shakl+rang) → 0.55
   *  - faqat rang YOKI faqat shakl mos → 0.35
   *  - umuman mos emas → 0.12
   */
  private actionQuality(p: Placed): number {
    if (!this.brief) return 0.5
    const targets = this.brief.targets
    const hex = p.hex.toLowerCase()

    // Yangi to'liq mos target
    for (let i = 0; i < targets.length; i++) {
      if (this.satisfied.has(i)) continue
      if (targets[i].shape === p.shape && targets[i].color.hex.toLowerCase() === hex) {
        this.satisfied.add(i)
        this.cb.onSatisfy?.(i) // loyihaga saqlash — qayta ochishda farm bo'lmaydi
        return 1.0
      }
    }
    // Bajarilgan target takrori
    const fullRepeat = targets.some((t) => t.shape === p.shape && t.color.hex.toLowerCase() === hex)
    if (fullRepeat) return 0.55
    // Qisman moslik
    const colorMatch = targets.some((t) => t.color.hex.toLowerCase() === hex)
    const shapeMatch = targets.some((t) => t.shape === p.shape)
    if (colorMatch || shapeMatch) return 0.35
    return 0.12
  }

  private markGoals(): void {
    const rows = this.briefPanel.querySelectorAll<HTMLElement>('.ds-goal-row')
    rows.forEach((row) => {
      const idx = Number(row.getAttribute('data-goal'))
      if (this.satisfied.has(idx)) {
        row.classList.add('done')
        const check = row.querySelector('.ds-goal-check')
        if (check) check.textContent = '✓'
      }
    })
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
      c.beginPath(); c.arc(p.x, p.y, r, 0, Math.PI * 2); c.fill(); c.stroke()
    } else if (p.shape === 'square') {
      c.beginPath(); c.roundRect(p.x - r, p.y - r, r * 2, r * 2, 4); c.fill(); c.stroke()
    } else if (p.shape === 'triangle') {
      c.beginPath()
      c.moveTo(p.x, p.y - r); c.lineTo(p.x + r, p.y + r); c.lineTo(p.x - r, p.y + r)
      c.closePath(); c.fill(); c.stroke()
    } else {
      c.beginPath(); c.roundRect(p.x - r * 1.5, p.y - r * 0.65, r * 3, r * 1.3, 4); c.fill(); c.stroke()
    }
  }

  dispose(): void { this.root.remove() }
}
