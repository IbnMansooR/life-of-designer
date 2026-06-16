// Inventar UI — o'yinchidagi buyumlar (I tugmasi bilan ochiladi).
import { el } from './dom'
import { ITEMS } from '../data/items'

export class Inventory {
  private root: HTMLElement
  private grid: HTMLElement
  private detail: HTMLElement
  isOpen = false

  constructor(parent: HTMLElement) {
    this.grid = el('div', { class: 'inv-grid' })
    this.detail = el('div', { class: 'inv-detail', text: 'Buyumni tanlang' })

    this.root = el('div', { class: 'screen inv hidden' }, [
      el('div', { class: 'inv-panel' }, [
        el('div', { class: 'inv-head' }, [
          el('h2', { text: 'Inventar' }),
          el('button', { class: 'inv-close', text: '✕', on: { click: () => this.close() } })
        ]),
        this.grid,
        this.detail
      ])
    ])
    parent.appendChild(this.root)
  }

  /** Buyumlar ro'yxati bilan to'ldiradi. */
  setItems(ids: string[]): void {
    this.grid.replaceChildren()
    for (const id of ids) {
      const def = ITEMS[id]
      if (!def) continue
      const cell = el('button', { class: 'inv-cell', on: { click: () => this.select(id) } }, [
        el('div', { class: 'inv-icon', text: def.icon }),
        el('div', { class: 'inv-name', text: def.name })
      ])
      this.grid.appendChild(cell)
    }
  }

  private select(id: string): void {
    const def = ITEMS[id]
    if (!def) return
    this.detail.replaceChildren(
      el('div', { class: 'inv-detail-name', text: `${def.icon}  ${def.name}` }),
      el('div', { class: 'inv-detail-desc', text: def.desc })
    )
  }

  open(ids: string[]): void {
    this.setItems(ids)
    this.detail.textContent = 'Buyumni tanlang'
    this.isOpen = true
    this.root.classList.remove('hidden')
  }

  close(): void {
    this.isOpen = false
    this.root.classList.add('hidden')
  }

  toggle(ids: string[]): boolean {
    if (this.isOpen) this.close()
    else this.open(ids)
    return this.isOpen
  }

  dispose(): void {
    this.root.remove()
  }
}
