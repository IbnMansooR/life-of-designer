// Dizayn studiyasi — TZ ko'rsatiladi, o'yinchi shakl chizib topshiradi, sifatga ball.
import { el } from './dom'
import {
  type DesignBrief,
  type ShapeType,
  type DesignColor,
  DESIGN_COLORS,
  SHAPE_LABEL,
  SHAPES,
  briefText
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
  private briefEl: HTMLElement
  private toolButtons: { shape: ShapeType; btn: HTMLButtonElement }[] = []
  private colorButtons: { hex: string; btn: HTMLButtonElement }[] = []
  private brief: DesignBrief | null = null
  private placed: Placed[] = []
  private selShape: ShapeType = 'circle'
  private selColor: DesignColor = DESIGN_COLORS[0]
  isOpen = false

  constructor(parent: HTMLElement, private cb: DesignStudioCallbacks) {
    this.briefEl = el('div', { class: 'ds-brief' })
    this.canvas = el('canvas', {
      class: 'ds-canvas',
      attrs: { width: '420', height: '300' }
    }) as HTMLCanvasElement
    this.ctx = this.canvas.getContext('2d')!
    this.canvas.addEventListener('click', (e) => this.onCanvasClick(e))

    const shapeRow = el(
      'div',
      { class: 'ds-tools' },
      SHAPES.map((s) => {
        const btn = el('button', { class: 'ds-tool', text: SHAPE_LABEL[s] }) as HTMLButtonElement
        btn.addEventListener('click', () => {
          this.selShape = s
          this.refreshTools()
        })
        this.toolButtons.push({ shape: s, btn })
        return btn
      })
    )
    const colorRow = el(
      'div',
      { class: 'ds-colors' },
      DESIGN_COLORS.map((c) => {
        const btn = el('button', { class: 'ds-color', style: { background: c.hex } }) as HTMLButtonElement
        btn.addEventListener('click', () => {
          this.selColor = c
          this.refreshTools()
        })
        this.colorButtons.push({ hex: c.hex, btn })
        return btn
      })
    )

    this.root = el('div', { class: 'screen design-studio hidden' }, [
      el('div', { class: 'ds-window' }, [
        el('div', { class: 'ds-titlebar' }, [
          el('span', { class: 'ds-title', text: '🎨 Dizayn studiyasi' }),
          el('button', { class: 'pc-close', text: '✕', on: { click: () => this.close() } })
        ]),
        this.briefEl,
        el('div', { class: 'ds-toolbar' }, [
          el('span', { class: 'ds-label', text: 'Shakl:' }),
          shapeRow,
          el('span', { class: 'ds-label', text: 'Rang:' }),
          colorRow
        ]),
        this.canvas,
        el('div', { class: 'ds-actions' }, [
          el('button', {
            class: 'btn-ghost',
            text: 'Tozalash',
            on: { click: () => { this.placed = []; this.redraw() } }
          }),
          el('button', { class: 'btn-cta', text: 'Topshirish', on: { click: () => this.submit() } })
        ])
      ])
    ])
    parent.appendChild(this.root)
  }

  open(brief: DesignBrief): void {
    this.brief = brief
    this.placed = []
    this.selShape = 'circle'
    this.selColor = DESIGN_COLORS[0]
    this.briefEl.textContent = `TZ: ${briefText(brief)}`
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

  private refreshTools(): void {
    for (const t of this.toolButtons) t.btn.classList.toggle('active', t.shape === this.selShape)
    for (const c of this.colorButtons) c.btn.classList.toggle('active', c.hex === this.selColor.hex)
  }

  private onCanvasClick(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (this.canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (this.canvas.height / rect.height)
    this.placed.push({ shape: this.selShape, hex: this.selColor.hex, x, y })
    this.redraw()
  }

  private redraw(): void {
    const c = this.ctx
    c.fillStyle = '#ffffff'
    c.fillRect(0, 0, this.canvas.width, this.canvas.height)
    for (const p of this.placed) this.drawShape(p)
  }

  private drawShape(p: Placed): void {
    const c = this.ctx
    c.fillStyle = p.hex
    const r = 26
    if (p.shape === 'circle') {
      c.beginPath()
      c.arc(p.x, p.y, r, 0, Math.PI * 2)
      c.fill()
    } else if (p.shape === 'square') {
      c.fillRect(p.x - r, p.y - r, r * 2, r * 2)
    } else {
      c.beginPath()
      c.moveTo(p.x, p.y - r)
      c.lineTo(p.x + r, p.y + r)
      c.lineTo(p.x - r, p.y + r)
      c.closePath()
      c.fill()
    }
  }

  private submit(): void {
    const quality = this.score()
    this.close()
    this.cb.onSubmit(quality)
  }

  /** TZ shartlariga moslik 0..1 (har shart uchun mos shakl+rang qo'yilganmi). */
  private score(): number {
    if (!this.brief || this.brief.targets.length === 0) return 0
    let matched = 0
    for (const t of this.brief.targets) {
      if (this.placed.some((p) => p.shape === t.shape && p.hex === t.color.hex)) matched++
    }
    return matched / this.brief.targets.length
  }

  dispose(): void {
    this.root.remove()
  }
}
