// HUD — ekran ustidagi ma'lumot paneli: vaqt, pul, ehtiyojlar.
import { el } from './dom'
import type { GameState } from '../game/GameState'

export class HUD {
  private root: HTMLElement
  private clockBig!: HTMLElement
  private clockSmall!: HTMLElement
  private moneyBig!: HTMLElement
  private bars: Record<string, HTMLElement> = {}
  private gs: GameState | null = null
  private speedButtons: { speed: number; btn: HTMLButtonElement }[] = []

  constructor(parent: HTMLElement) {
    this.clockBig = el('div', { class: 'big', text: '07:00' })
    this.clockSmall = el('div', { class: 'small', text: '1-kun • Ertalab' })
    this.moneyBig = el('div', { class: 'big', text: "0 so'm" })

    const needRow = (key: string, name: string) => {
      const fill = el('span')
      this.bars[key] = fill
      return el('div', { class: 'need-row' }, [
        el('span', { class: 'nm', text: name }),
        el('div', { class: 'bar' }, [fill])
      ])
    }

    this.root = el('div', { class: 'hud' }, [
      el('div', { class: 'hud-top' }, [
        el('div', { class: 'hud-card hud-clock' }, [this.clockBig, this.clockSmall]),
        el('div', { class: 'hud-card hud-money' }, [
          el('div', { class: 'small', text: 'BALANS' }),
          this.moneyBig
        ]),
        el('div', { class: 'hud-card needs' }, [
          needRow('energy', 'Energiya'),
          needRow('food', 'To‘qlik'),
          needRow('stress', 'Stress'),
          needRow('mood', 'Kayfiyat')
        ]),
        this.buildSpeedControl()
      ]),
      el('div', {
        class: 'hud-hint',
        text: 'WASD yurish · E ishlatish · I inventar · C kamera · P telefon · Esc menyu · F5 saqlash'
      })
    ])
    parent.appendChild(this.root)
  }

  /** Vaqt tezligini boshqarish (Polish: 1 kun = 45 daq, shuning uchun tezlatish kerak). */
  private buildSpeedControl(): HTMLElement {
    const speeds: [number, string][] = [
      [0, '❚❚'],
      [1, '1×'],
      [2, '2×'],
      [4, '4×']
    ]
    const btns = speeds.map(([sp, label]) => {
      const btn = el('button', { class: 'speed-btn', text: label }) as HTMLButtonElement
      btn.addEventListener('click', () => {
        if (this.gs) this.gs.time.speed = sp
      })
      this.speedButtons.push({ speed: sp, btn })
      return btn
    })
    return el('div', { class: 'hud-card hud-speed' }, [
      el('div', { class: 'small', text: 'TEZLIK' }),
      el('div', { class: 'speed-row' }, btns)
    ])
  }

  update(gs: GameState): void {
    this.gs = gs
    this.clockBig.textContent = gs.time.clock
    this.clockSmall.textContent = `${gs.time.day}-kun • ${gs.time.partOfDay}`
    this.moneyBig.textContent = `${formatMoney(gs.money)} so'm`

    const n = gs.needs
    this.setBar('energy', n.energy, true)
    this.setBar('food', 100 - n.hunger, true) // to'qlik = teskari ochlik
    this.setBar('stress', n.stress, false) // stress past bo'lgani yaxshi
    this.setBar('mood', n.mood, true)

    for (const s of this.speedButtons) {
      s.btn.classList.toggle('active', gs.time.speed === s.speed)
    }
  }

  private setBar(key: string, value: number, highIsGood: boolean): void {
    const fill = this.bars[key]
    if (!fill) return
    fill.style.width = `${Math.max(0, Math.min(100, value))}%`
    const good = highIsGood ? value > 50 : value < 50
    const warn = highIsGood ? value > 25 : value < 75
    fill.style.background = good ? 'var(--good)' : warn ? 'var(--warn)' : 'var(--bad)'
  }

  show(): void {
    this.root.style.display = 'block'
  }

  hide(): void {
    this.root.style.display = 'none'
  }

  dispose(): void {
    this.root.remove()
  }
}

function formatMoney(v: number): string {
  return Math.round(v)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
