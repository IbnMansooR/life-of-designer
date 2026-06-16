// Qahramon yaratish — ism + tashqi ko'rinish + oilaviy holat (Part 1, Part 9).
import { el } from './dom'
import { FAMILIES } from '../data/families'
import {
  type Appearance,
  DEFAULT_APPEARANCE,
  SKIN_TONES,
  HAIR_COLORS,
  SHIRT_COLORS,
  PANTS_COLORS
} from '../data/appearance'

export interface CreateCallbacks {
  onStart: (name: string, familyId: string, appearance: Appearance) => void
  onBack: () => void
}

export class CharacterCreate {
  private root: HTMLElement
  private nameInput!: HTMLInputElement
  private startBtn!: HTMLButtonElement
  private selectedFamily = ''
  private appearance: Appearance = { ...DEFAULT_APPEARANCE }

  // Avatar qismlari (jonli ko'rinish uchun)
  private avHair!: HTMLElement
  private avHead!: HTMLElement
  private avTorso!: HTMLElement
  private avLegs!: HTMLElement

  constructor(parent: HTMLElement, cb: CreateCallbacks) {
    this.nameInput = el('input', {
      attrs: { type: 'text', placeholder: 'Masalan: Jasur', maxlength: '24' }
    }) as HTMLInputElement
    this.nameInput.addEventListener('input', () => this.validate())

    this.startBtn = el('button', {
      class: 'btn-cta',
      text: 'Hayotni boshlash',
      on: { click: () => cb.onStart(this.nameInput.value, this.selectedFamily, this.appearance) }
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
            on: { click: (e) => this.selectFamily(f.id, e.currentTarget as HTMLElement) }
          },
          [el('div', { class: 'ttl', text: f.title }), el('div', { class: 'desc', text: f.desc })]
        )
      )
    )

    this.root = el('div', { class: 'screen create hidden' }, [
      el('h2', { text: 'Hayotingni boshla' }),
      el('div', { class: 'create-body' }, [
        el('div', { class: 'create-col' }, [
          el('div', { class: 'field' }, [el('label', { text: 'ISMING' }), this.nameInput]),
          el('div', { class: 'field' }, [
            el('label', { text: 'KO‘RINISH' }),
            el('div', { class: 'appearance' }, [this.buildAvatar(), this.buildPickers()])
          ])
        ]),
        el('div', { class: 'create-col' }, [
          el('div', { class: 'field' }, [
            el('label', { text: 'OILAVIY HOLAT — boshlang‘ich pul, stress va motivatsiyaga ta’sir qiladi' }),
            grid
          ])
        ])
      ]),
      el('div', { class: 'create-actions' }, [
        el('button', { class: 'btn-ghost', text: 'Orqaga', on: { click: () => cb.onBack() } }),
        this.startBtn
      ])
    ])
    parent.appendChild(this.root)
  }

  private buildAvatar(): HTMLElement {
    this.avHair = el('div', { class: 'av-hair' })
    this.avHead = el('div', { class: 'av-head' })
    this.avTorso = el('div', { class: 'av-torso' })
    this.avLegs = el('div', { class: 'av-legs' })
    const avatar = el('div', { class: 'avatar' }, [
      this.avLegs,
      this.avTorso,
      this.avHead,
      this.avHair
    ])
    this.refreshAvatar()
    return avatar
  }

  private buildPickers(): HTMLElement {
    return el('div', { class: 'pickers' }, [
      this.swatchRow('Teri', SKIN_TONES, 'skin'),
      this.swatchRow('Soch', HAIR_COLORS, 'hair'),
      this.swatchRow('Ko‘ylak', SHIRT_COLORS, 'shirt'),
      this.swatchRow('Shim', PANTS_COLORS, 'pants')
    ])
  }

  private swatchRow(title: string, colors: string[], key: keyof Appearance): HTMLElement {
    const swatches = colors.map((c) => {
      const sw = el('button', {
        class: 'swatch' + (this.appearance[key] === c ? ' selected' : ''),
        style: { background: c },
        attrs: { 'data-color': c }
      })
      sw.addEventListener('click', () => {
        this.appearance[key] = c
        this.refreshAvatar()
        row.querySelectorAll('.swatch').forEach((s) => s.classList.remove('selected'))
        sw.classList.add('selected')
      })
      return sw
    })
    const row = el('div', { class: 'swatch-row' }, [
      el('span', { class: 'swatch-label', text: title }),
      el('div', { class: 'swatches' }, swatches)
    ])
    return row
  }

  private refreshAvatar(): void {
    this.avHair.style.background = this.appearance.hair
    this.avHead.style.background = this.appearance.skin
    this.avTorso.style.background = this.appearance.shirt
    this.avLegs.style.background = this.appearance.pants
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
