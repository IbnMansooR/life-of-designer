// Launcher — o'yinning kirish ekrani (Part 6: launcher tizimi).
import { el } from './dom'
import { hasSave } from '../core/Save'

export interface LauncherCallbacks {
  onNew: () => void
  onContinue: () => void
}

export class Launcher {
  private root: HTMLElement
  private continueBtn!: HTMLButtonElement

  constructor(parent: HTMLElement, cb: LauncherCallbacks) {
    this.continueBtn = el('button', {
      class: 'btn',
      text: 'Davom etish',
      on: { click: () => cb.onContinue() }
    })
    this.continueBtn.disabled = true

    this.root = el('div', { class: 'screen launcher hidden' }, [
      el('div', { class: 'brand' }, [
        el('h1', { text: 'LIFE OF DESIGNER' }),
        el('p', { text: 'Bitta qaror — butun bir hayot' })
      ]),
      el('div', { class: 'menu' }, [
        el('button', {
          class: 'btn primary',
          text: 'Yangi hayot',
          on: { click: () => cb.onNew() }
        }),
        this.continueBtn,
        el('button', {
          class: 'btn',
          text: 'Sozlamalar',
          on: { click: () => alert('Sozlamalar — keyingi bosqichda') }
        }),
        el('button', {
          class: 'btn',
          text: 'Chiqish',
          on: { click: () => window.close() }
        })
      ]),
      el('div', { class: 'version-tag', text: 'v0.1.0 — Phase 1 (Core Foundation)' })
    ])
    parent.appendChild(this.root)
  }

  async refreshContinue(): Promise<void> {
    this.continueBtn.disabled = !(await hasSave('slot1'))
  }

  show(): void {
    this.root.classList.remove('hidden')
  }

  hide(): void {
    this.root.classList.add('hidden')
  }
}
