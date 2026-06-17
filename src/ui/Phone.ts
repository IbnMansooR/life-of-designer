// Telefon — Phase 4: oila bilan haqiqiy aloqa (qo'ng'iroq, pul yuborish), dinamik xabarlar.
import { el } from './dom'
import type { GameState } from '../game/GameState'
import { getFamilyMembers } from '../data/families'
import {
  DATE_VENUES,
  statusLabel,
  childStage,
  childYears,
  ENGAGE_THRESHOLD,
  MARRY_THRESHOLD,
  WEDDING_COST
} from '../data/partners'
import { INSPIRATIONS, formatFollowers } from '../data/pontorest'

interface AppDef {
  id: string
  name: string
  icon: string
}

const APPS: AppDef[] = [
  { id: 'calls', name: 'Oila', icon: '📞' },
  { id: 'love', name: 'Sevgi', icon: '💞' },
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
      case 'love':
        return this.renderLove(gs)
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
        return this.renderPontoRest(gs)
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

  private renderLove(gs: GameState | null): Node[] {
    if (!gs) return [el('div', { class: 'ph-note', text: '...' })]
    const p = gs.partner
    if (!p) {
      const cands = gs.datingCandidates
      if (!cands.length) return [el('div', { class: 'ph-note', text: 'Hozircha nomzod yo‘q.' })]
      return [
        el('div', { class: 'ph-note', text: 'Tanishish uchun birini tanlang:' }),
        ...cands.map((c) =>
          el('div', { class: 'love-cand' }, [
            el('div', { class: 'love-cname', text: `${c.name}, ${c.age}` }),
            el('div', { class: 'love-cmeta', text: `${c.job} · ${c.personality}` }),
            el('button', {
              class: 'call-btn',
              text: 'Tanishish',
              on: { click: () => { gs.startDating(c.id); this.refresh() } }
            })
          ])
        )
      ]
    }

    const rel = Math.round(p.relationship)
    const relFill = el('span')
    relFill.style.width = `${rel}%`
    relFill.style.background = rel > 50 ? 'var(--good)' : rel > 25 ? 'var(--warn)' : 'var(--bad)'

    const nodes: Node[] = [
      el('div', { class: 'love-header' }, [
        el('div', { class: 'love-pname', text: `${p.name}, ${p.age}` }),
        el('div', { class: 'love-status', text: `${statusLabel(p.status)} · ${p.job}` }),
        el('div', { class: 'bar' }, [relFill]),
        el('div', { class: 'love-rel', text: `Aloqa: ${rel}/100` })
      ]),
      el('div', { class: 'love-sub', text: 'Uchrashuv' }),
      el(
        'div',
        { class: 'send-row' },
        DATE_VENUES.map((v, i) =>
          el('button', {
            class: 'send-btn',
            text: v.name,
            on: { click: () => { gs.dateWith(i); this.refresh() } }
          })
        )
      )
    ]

    const actions: HTMLElement[] = [
      el('button', {
        class: 'love-btn',
        text: 'Vaqt o‘tkazish',
        on: { click: () => { gs.spendTimeWithPartner(); this.refresh() } }
      }),
      el('button', {
        class: 'love-btn',
        text: 'Sovg‘a (100 000)',
        on: { click: () => { gs.giftPartner(100_000); this.refresh() } }
      })
    ]
    if (p.status === 'dating') {
      actions.push(
        el('button', {
          class: 'love-btn',
          text: `Unashtirish (aloqa ${ENGAGE_THRESHOLD}+)`,
          on: { click: () => { gs.engagePartner(); this.refresh() } }
        })
      )
    }
    if (p.status === 'engaged') {
      actions.push(
        el('button', {
          class: 'love-btn',
          text: `Turmush qurish (aloqa ${MARRY_THRESHOLD}+, ${formatMoney(WEDDING_COST)})`,
          on: { click: () => { gs.marryPartner(); this.refresh() } }
        })
      )
    }
    if (p.status === 'married') {
      actions.push(
        el('button', {
          class: 'love-btn',
          text: 'Farzand ko‘rish 👶',
          on: { click: () => { gs.haveChild(); this.refresh() } }
        })
      )
    }
    actions.push(
      el('button', {
        class: 'love-btn danger',
        text: 'Ajralish',
        on: { click: () => { gs.breakup(); this.refresh() } }
      })
    )
    nodes.push(el('div', { class: 'love-actions' }, actions))

    if (p.children.length) {
      nodes.push(el('div', { class: 'love-sub', text: 'Farzandlar' }))
      nodes.push(
        el(
          'div',
          { class: 'love-children' },
          p.children.map((c) =>
            el('div', {
              class: 'love-child',
              text: `${c.name} — ${childYears(c.ageDays)} yosh (${childStage(c.ageDays)})`
            })
          )
        )
      )
    }
    return nodes
  }

  private renderPontoRest(gs: GameState | null): Node[] {
    if (!gs) return [el('div', { class: 'ph-note', text: '...' })]
    const rep = Math.round(gs.socialReputation)
    const repFill = el('span')
    repFill.style.width = `${rep}%`
    repFill.style.background = 'var(--accent-2)'

    const nodes: Node[] = []
    if (!gs.brandName) {
      const bi = el('input', {
        class: 'biz-name',
        attrs: { type: 'text', placeholder: 'Brend nomi', maxlength: '24' }
      }) as HTMLInputElement
      nodes.push(
        el('div', { class: 'pr-brand' }, [
          bi,
          el('button', {
            class: 'call-btn',
            text: 'Saqlash',
            on: { click: () => { gs.setBrand(bi.value); this.refresh() } }
          })
        ])
      )
    } else {
      nodes.push(el('div', { class: 'pr-brandname', text: `🎨 ${gs.brandName}` }))
    }

    nodes.push(
      el('div', { class: 'pr-stats' }, [
        el('div', { class: 'pr-followers', text: `${formatFollowers(gs.followers)} obunachi` }),
        el('div', { class: 'bar' }, [repFill]),
        el('div', { class: 'ph-note', text: `Ijtimoiy obro': ${rep}/100 · postlar: ${gs.posts}` })
      ])
    )
    nodes.push(
      el('button', {
        class: 'love-btn',
        text: '📢 Ish e‘lon qilish',
        on: { click: () => { gs.postWork(); this.refresh() } }
      })
    )

    nodes.push(el('div', { class: 'love-sub', text: 'Ilhom' }))
    for (const ins of INSPIRATIONS) {
      const saved = gs.moodboard.includes(ins.id)
      nodes.push(
        el('div', { class: 'pr-insp' }, [
          el('span', { class: 'pr-emoji', text: ins.emoji }),
          el('div', { class: 'pr-itext' }, [
            el('div', { class: 'pr-ititle', text: ins.title }),
            el('div', { class: 'pr-icat', text: ins.category })
          ]),
          saved
            ? el('span', { class: 'pr-saved', text: '✓' })
            : el('button', {
                class: 'call-btn',
                text: 'Saqlash',
                on: { click: () => { gs.saveInspiration(ins.id); this.refresh() } }
              })
        ])
      )
    }
    nodes.push(el('div', { class: 'ph-note', text: `Moodboard: ${gs.moodboard.length} ta` }))
    return nodes
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
