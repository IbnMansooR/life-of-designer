// Telefon — interaktiv smartfon skeleti (Part 5).
// Hozircha ilovalar placeholder, keyingi bosqichlarda to'liq ishlaydi.
import { el } from './dom'

interface AppDef {
  id: string
  name: string
  icon: string
  body: string
}

const APPS: AppDef[] = [
  { id: 'calls', name: 'Qo‘ng‘iroq', icon: '📞', body: 'Oila, do‘st va mijozlarga qo‘ng‘iroq — keyingi bosqichda.' },
  { id: 'messages', name: 'Xabarlar', icon: '💬', body: 'Oilaviy, romantik va ish xabarlari shu yerda bo‘ladi.' },
  { id: 'bank', name: 'Bank', icon: '🏦', body: 'Balans, to‘lov, kredit va investitsiya — moliya tizimi.' },
  { id: 'map', name: 'Xarita', icon: '🗺️', body: 'Megapolis xaritasi: uy, ofis, mijoz joylashuvi.' },
  { id: 'pontorest', name: 'PontoRest', icon: '🎨', body: 'Kreativ platforma: ilhom, moodboard, portfolio.' },
  { id: 'calendar', name: 'Kalendar', icon: '📅', body: 'Uchrashuv, deadline, tug‘ilgan kunlar.' },
  { id: 'settings', name: 'Sozlama', icon: '⚙️', body: 'Telefon sozlamalari.' }
]

export class Phone {
  private root: HTMLElement
  private appView: HTMLElement
  private appTitle: HTMLElement
  private appBody: HTMLElement
  isOpen = false

  constructor(parent: HTMLElement) {
    this.appTitle = el('div', { class: 'app-title' })
    this.appBody = el('div', { class: 'placeholder' })
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

    this.root = el('div', { class: 'phone' }, [
      el('div', { class: 'phone-status' }, [
        el('span', { text: 'Designer Phone' }),
        el('span', { text: '100%' })
      ]),
      el('div', { class: 'phone-screen' }, [grid, this.appView]),
      el('div', { class: 'phone-home-indicator' })
    ])
    parent.appendChild(this.root)
  }

  private openApp(a: AppDef): void {
    this.appTitle.textContent = a.name
    this.appBody.textContent = a.body
    this.appView.classList.add('show')
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
