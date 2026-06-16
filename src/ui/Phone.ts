// Telefon — Phase 4: oila bilan haqiqiy aloqa (qo'ng'iroq, pul yuborish), dinamik xabarlar.
import { el } from './dom'
import type { GameState } from '../game/GameState'
import { getFamilyMembers } from '../data/families'

interface AppDef {
  id: string
  name: string
  icon: string
}

const APPS: AppDef[] = [
  { id: 'calls', name: 'Oila', icon: '📞' },
  { id: 'messages', name: 'Xabarlar', icon: '💬' },
  { id: 'bank', name: 'Bank', icon: '🏦' },
  { id: 'map', name: 'Xarita', icon: '🗺️' },
  { id: 'pontorest', name: 'PontoRest', icon: '🎨' },
  { id: 'calendar', name: 'Kalendar', icon: '📅' },
  { id: 'settings', name: 'Sozlama', icon: '⚙️' }
]

const SEND_AMOUNTS = [100_000, 500_000]

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
  private currentAppId: string | null = null
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
      el('div', { class: 'phone-status' }, [el('span', { text: 'Designer Phone' }), this.statusClock]),
      el('div', { class: 'phone-screen' }, [grid, this.appView]),
      el('div', { class: 'phone-home-indicator' })
    ])
    parent.appendChild(this.root)
  }

  update(gs: GameState): void {
    this.gs = gs
    this.statusClock.textContent = gs.time.clock
  }

  private openApp(a: AppDef): void {
    this.currentAppId = a.id
    this.appTitle.textContent = a.name
    this.appBody.replaceChildren(...this.renderApp(a.id))
    this.appView.classList.add('show')
  }

  /** Amaldan keyin ochiq ilovani qayta chizadi (balans/aloqa yangilansin). */
  private refresh(): void {
    if (this.currentAppId) this.appBody.replaceChildren(...this.renderApp(this.currentAppId))
  }

  private renderApp(id: string): Node[] {
    const gs = this.gs
    switch (id) {
      case 'calls':
        return this.renderFamily(gs)
      case 'bank':
        return this.renderBank(gs)
      case 'messages':
        return this.renderMessages(gs)
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

  private renderFamily(gs: GameState | null): Node[] {
    const rel = Math.round(gs?.familyRelationship ?? 0)
    const members = getFamilyMembers(gs?.familyId ?? 'mother_only')
    const relFill = el('span')
    relFill.style.width = `${rel}%`
    relFill.style.background = rel > 50 ? 'var(--good)' : rel > 25 ? 'var(--warn)' : 'var(--bad)'

    return [
      el('div', { class: 'fam-status' }, [
        el('div', { class: 'fam-rel-label', text: `Oila aloqasi: ${rel}/100` }),
        el('div', { class: 'bar' }, [relFill]),
        el('div', { class: 'ph-note', text: `Oxirgi aloqa: ${gs?.lastFamilyContactDay ?? 1}-kun` })
      ]),
      el(
        'div',
        { class: 'contact-list' },
        members.map((name) =>
          el('div', { class: 'contact' }, [
            el('span', { class: 'contact-name', text: name }),
            el('button', {
              class: 'call-btn',
              text: '📞 Qo‘ng‘iroq',
              on: {
                click: () => {
                  gs?.contactFamily()
                  this.refresh()
                }
              }
            })
          ])
        )
      ),
      el('div', { class: 'ph-note', text: 'Muntazam aloqa — aloqa darajasini oshiradi.' })
    ]
  }

  private renderBank(gs: GameState | null): Node[] {
    return [
      el('div', { class: 'bank-balance' }, [
        el('div', { class: 'bank-label', text: 'Joriy balans' }),
        el('div', { class: 'bank-amount', text: `${formatMoney(gs?.money ?? 0)} so'm` })
      ]),
      el('div', { class: 'bank-section' }, [
        el('div', { class: 'bank-section-title', text: 'Oilaga pul yuborish' }),
        el(
          'div',
          { class: 'send-row' },
          SEND_AMOUNTS.map((amt) =>
            el('button', {
              class: 'send-btn',
              text: `${formatMoney(amt)} so'm`,
              on: {
                click: () => {
                  if (gs?.sendFamilyMoney(amt)) this.refresh()
                }
              }
            })
          )
        )
      ]),
      el('div', { class: 'ph-note', text: 'Kredit va investitsiya — keyingi bosqichda.' })
    ]
  }

  private renderMessages(gs: GameState | null): Node[] {
    const member = getFamilyMembers(gs?.familyId ?? 'mother_only')[0]
    const rel = gs?.familyRelationship ?? 70
    const msgs =
      rel < 50
        ? ['Bolam, ko‘rinmay ketding, sog‘inib qoldim...', 'Telefoningga javob ber, xavotirdaman.']
        : ['Bolam, yetib oldingmi? O‘zingni ehtiyot qil.', 'Telefon qilib tur, sog‘indim.']
    return [
      el('div', { class: 'chat' }, [
        el('div', { class: 'chat-from', text: member }),
        ...msgs.map((m) => el('div', { class: 'bubble', text: m }))
      ])
    ]
  }

  private closeApp(): void {
    this.currentAppId = null
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
