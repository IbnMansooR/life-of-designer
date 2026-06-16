// Qahramon yaratish — ism + oilaviy holat tanlash (Part 1).
import { el } from './dom'
import { FAMILIES } from '../data/families'

export interface CreateCallbacks {
  onStart: (name: string, familyId: string) => void
  onBack: () => void
}

export class CharacterCreate {
  private root: HTMLElement
  private nameInput!: HTMLInputElement
  private startBtn!: HTMLButtonElement
  private selectedFamily = ''

  constructor(parent: HTMLElement, cb: CreateCallbacks) {
    this.nameInput = el('input', {
      attrs: { type: 'text', placeholder: 'Masalan: Jasur', maxlength: '24' }
    }) as HTMLInputElement
    this.nameInput.addEventListener('input', () => this.validate())

    this.startBtn = el('button', {
      class: 'btn-cta',
      text: 'Hayotni boshlash',
      on: { click: () => cb.onStart(this.nameInput.value, this.selectedFamily) }
    }) as HTMLButtonElement
    this.startBtn.disabled = true

    const grid = el(
      'div',
      { class: 'family-grid' },
      FAMILIES.map((f) =>
        el(
          'button',
          {
            class: 'family-card',
            attrs: { 'data-id': f.id },
            on: {
              click: (e) => this.selectFamily(f.id, e.currentTarget as HTMLElement)
            }
          },
          [el('div', { class: 'ttl', text: f.title }), el('div', { class: 'desc', text: f.desc })]
        )
      )
    )

    this.root = el('div', { class: 'screen create hidden' }, [
      el('h2', { text: 'Hayotingni boshla' }),
      el('div', { class: 'field' }, [
        el('label', { text: 'ISMING' }),
        this.nameInput
      ]),
      el('div', { class: 'field' }, [
        el('label', { text: 'OILAVIY HOLAT — boshlang‘ich pul, stress va motivatsiyaga ta’sir qiladi' }),
        grid
      ]),
      el('div', { class: 'create-actions' }, [
        el('button', { class: 'btn-ghost', text: 'Orqaga', on: { click: () => cb.onBack() } }),
        this.startBtn
      ])
    ])
    parent.appendChild(this.root)
  }

  private selectFamily(id: string, node: HTMLElement): void {
    this.selectedFamily = id
    this.root.querySelectorAll('.family-card').forEach((c) => c.classList.remove('selected'))
    node.classList.add('selected')
    this.validate()
  }

  private validate(): void {
    this.startBtn.disabled = this.nameInput.value.trim().length < 2 || !this.selectedFamily
  }

  show(): void {
    this.root.classList.remove('hidden')
  }

  hide(): void {
    this.root.classList.add('hidden')
  }
}
