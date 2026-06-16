// Interaksiya prompti — o'yinchi zonaga yaqinlashganda "E — Uxlash" kabi ko'rinadi.
import { el } from './dom'

export class InteractPrompt {
  private root: HTMLElement
  private label: HTMLElement
  private visible = false

  constructor(parent: HTMLElement) {
    this.label = el('span', { class: 'ip-label' })
    this.root = el('div', { class: 'interact-prompt hidden' }, [
      el('span', { class: 'ip-key', text: 'E' }),
      this.label
    ])
    parent.appendChild(this.root)
  }

  show(text: string): void {
    if (!this.visible) {
      this.visible = true
      this.root.classList.remove('hidden')
    }
    if (this.label.textContent !== text) this.label.textContent = text
  }

  hide(): void {
    if (!this.visible) return
    this.visible = false
    this.root.classList.add('hidden')
  }

  dispose(): void {
    this.root.remove()
  }
}
