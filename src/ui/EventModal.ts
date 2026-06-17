// Hayot eventi modali — voqea + tanlovlar (Part 8).
import { el } from './dom'
import type { LifeEvent, EventEffect } from '../data/events'

export interface EventModalCallbacks {
  onChoice: (effect: EventEffect, result: string) => void
}

export class EventModal {
  private root: HTMLElement
  private titleEl: HTMLElement
  private descEl: HTMLElement
  private choicesEl: HTMLElement
  isOpen = false

  constructor(parent: HTMLElement, private cb: EventModalCallbacks) {
    this.titleEl = el('div', { class: 'event-title' })
    this.descEl = el('div', { class: 'event-desc' })
    this.choicesEl = el('div', { class: 'event-choices' })
    this.root = el('div', { class: 'screen event-modal hidden' }, [
      el('div', { class: 'event-card' }, [
        el('div', { class: 'event-badge', text: '✦ Hayot voqeasi' }),
        this.titleEl,
        this.descEl,
        this.choicesEl
      ])
    ])
    parent.appendChild(this.root)
  }

  open(event: LifeEvent): void {
    this.titleEl.textContent = event.title
    this.descEl.textContent = event.desc
    this.choicesEl.replaceChildren(
      ...event.choices.map((c) =>
        el('button', {
          class: 'event-choice',
          text: c.label,
          on: {
            click: () => {
              this.close()
              this.cb.onChoice(c.effect, c.result)
            }
          }
        })
      )
    )
    this.isOpen = true
    this.root.classList.remove('hidden')
  }

  close(): void {
    this.isOpen = false
    this.root.classList.add('hidden')
  }

  dispose(): void {
    this.root.remove()
  }
}
