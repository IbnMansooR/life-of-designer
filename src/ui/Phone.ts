// Telefon — endi haqiqiy o'yin ma'lumotlari bilan ishlaydi (Part 5).
import { el } from './dom'
import type { GameState } from '../game/GameState'

interface AppDef {
  id: string
  name: string
  icon: string
}

const APPS: AppDef[] = [
  { id: 'calls', name: 'Qo‘ng‘iroq', icon: '📞' },
  { id: 'messages', name: 'Xabarlar', icon: '💬' },
  { id: 'bank', name: 'Bank', icon: '🏦' },
  { id: 'map', name: 'Xarita', icon: '🗺️' },
  { id: 'pontorest', name: 'PontoRest', icon: '🎨' },
  { id: 'calendar', name: 'Kalendar', icon: '📅' },
  { id: 'settings', name: 'Sozlama', icon: '⚙️' }
]

// Oilaviy holatga qarab qo'shimcha kontaktlar.
const FAMILY_MEMBERS: Record<string, string[]> = {
  mother_sister: ['Ona', 'Singil'],
  mother_brother: ['Ona', 'Aka'],
  mother_father: ['Ona', 'Ota'],
  mother_only: ['Ona'],
  father_only: ['Ota'],
  big_family: ['Ona', 'Ota', 'Aka', 'Singil'],
  relatives: ['Amma', 'Tog‘a'],
  complex: ['Ona']
}

function formatMoney(v: number): string {
  return Math.round(v)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export class Phone {
  private root: HTMLElement
  private appView: HTMLElement
  private appTitle: HTMLElement
  private appBody: HTMLElement
  private statusClock: HTMLElement
  private gs: GameState | null = null
  isOpen = false

  constructor(parent: HTMLElement) {
    this.appTitle = el('div', { class: 'app-title' })
    this.appBody = el('div', { class: 'app-body' })
    this.appView = el('div', { class: 'app-view' }, [
      el('div', { class: 'app-head' }, [
        el('button', { class: 'back', text: '‹ Orqaga', on: { click: () => this.closeApp() } }),
        this.appTitle
      ]),
      this.appBody
    ])

    const grid = el(
      'div',
      { class: 'app-grid' },
      APPS.map((a) =>
        el('button', { class: 'app', on: { click: () => this.openApp(a) } }, [
          el('div', { class: 'icon', text: a.icon }),
          el('div', { class: 'lbl', text: a.name })
        ])
      )
    )

    this.statusClock = el('span', { text: '07:00' })

    this.root = el('div', { class: 'phone' }, [
      el('div', { class: 'phone-status' }, [
        el('span', { text: 'Designer Phone' }),
        this.statusClock
      ]),
      el('div', { class: 'phone-screen' }, [grid, this.appView]),
      el('div', { class: 'phone-home-indicator' })
    ])
    parent.appendChild(this.root)
  }

  /** Har kadrda — soatni yangilab turadi. */
  update(gs: GameState): void {
    this.gs = gs
    this.statusClock.textContent = gs.time.clock
  }

  private openApp(a: AppDef): void {
    this.appTitle.textContent = a.name
    this.appBody.replaceChildren(...this.renderApp(a.id))
    this.appView.classList.add('show')
  }

  private renderApp(id: string): Node[] {
    const gs = this.gs
    switch (id) {
      case 'bank':
        return [
          el('div', { class: 'bank-balance' }, [
            el('div', { class: 'bank-label', text: 'Joriy balans' }),
            el('div', { class: 'bank-amount', text: `${formatMoney(gs?.money ?? 0)} so'm` })
          ]),
          el('div', { class: 'bank-acc', text: 'Designer Bank · Asosiy hisob' }),
          el('div', { class: 'ph-note', text: 'To‘lov, kredit va investitsiya keyingi bosqichda.' })
        ]
      case 'messages': {
        const member = FAMILY_MEMBERS[gs?.familyId ?? 'mother_only']?.[0] ?? 'Ona'
        return [
          el('div', { class: 'chat' }, [
            el('div', { class: 'chat-from', text: member }),
            el('div', { class: 'bubble', text: 'Bolam, yetib oldingmi? O‘zingni ehtiyot qil.' }),
            el('div', { class: 'bubble', text: 'Telefon qilib tur, sog‘inib qoldim.' })
          ])
        ]
      }
      case 'calls': {
        const contacts = this.contacts()
        return [
          el(
            'div',
            { class: 'contact-list' },
            contacts.map((c) =>
              el('div', { class: 'contact' }, [
                el('span', { class: 'contact-name', text: c }),
                el('span', { class: 'contact-call', text: '📞' })
              ])
            )
          )
        ]
      }
      case 'calendar':
        return [
          el('div', { class: 'cal-day', text: `${gs?.time.day ?? 1}-kun` }),
          el('div', { class: 'cal-time', text: `${gs?.time.clock ?? '07:00'} · ${gs?.time.partOfDay ?? ''}` }),
          el('div', { class: 'ph-note', text: 'Uchrashuv va deadline’lar keyingi bosqichda.' })
        ]
      case 'pontorest':
        return [el('div', { class: 'ph-note', text: 'Kreativ platforma: ilhom, moodboard, portfolio — tez orada.' })]
      case 'map':
        return [el('div', { class: 'ph-note', text: 'Megapolis xaritasi: uy, ofis, mijoz joylashuvi — tez orada.' })]
      default:
        return [el('div', { class: 'ph-note', text: 'Bu bo‘lim keyingi bosqichlarda ochiladi.' })]
    }
  }

  private contacts(): string[] {
    const fam = FAMILY_MEMBERS[this.gs?.familyId ?? 'mother_only'] ?? ['Ona']
    return [...fam, 'Do‘st', 'Ish beruvchi', 'Mijoz']
  }

  private closeApp(): void {
    this.appView.classList.remove('show')
  }

  toggle(): boolean {
    this.isOpen = !this.isOpen
    this.root.classList.toggle('open', this.isOpen)
    if (!this.isOpen) this.closeApp()
    return this.isOpen
  }

  close(): void {
    this.isOpen = false
    this.root.classList.remove('open')
    this.closeApp()
  }

  dispose(): void {
    this.root.remove()
  }
}
