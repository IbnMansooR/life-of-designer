// Kompyuter interfeysi — stolдаги ishxona "OS"i (Part 4: freelance, loyiha, portfolio, learning).
import { el } from './dom'
import type { GameState } from '../game/GameState'
import { COURSES, type Project } from '../data/jobs'
import { OFFICES, FOUND_COST, FOUND_PORTFOLIO, type Employee } from '../data/business'
import { ACHIEVEMENTS } from '../data/achievements'

export interface ComputerCallbacks {
  onClose: () => void
}

const TABS: { id: string; name: string; icon: string }[] = [
  { id: 'freelance', name: 'Freelance', icon: '🧑‍💻' },
  { id: 'projects', name: 'Loyihalar', icon: '📁' },
  { id: 'business', name: 'Biznes', icon: '🏢' },
  { id: 'profile', name: 'Profil', icon: '🪪' },
  { id: 'learn', name: 'O‘rganish', icon: '📚' }
]

function money(v: number): string {
  return Math.round(v)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function stars(n: number): string {
  return '★'.repeat(n) + '☆'.repeat(Math.max(0, 3 - n))
}

export class Computer {
  private root: HTMLElement
  private tabsEl: HTMLElement
  private content: HTMLElement
  private gs: GameState | null = null
  private tab = 'freelance'
  isOpen = false

  constructor(parent: HTMLElement, private cb: ComputerCallbacks) {
    this.tabsEl = el('div', { class: 'pc-tabs' })
    this.content = el('div', { class: 'pc-content' })

    this.root = el('div', { class: 'screen computer hidden' }, [
      el('div', { class: 'pc-window' }, [
        el('div', { class: 'pc-titlebar' }, [
          el('span', { class: 'pc-title', text: '🖥️  Designer OS' }),
          el('button', { class: 'pc-close', text: '✕', on: { click: () => this.close() } })
        ]),
        this.tabsEl,
        this.content
      ])
    ])
    parent.appendChild(this.root)
  }

  open(gs: GameState): void {
    this.gs = gs
    this.tab = 'freelance'
    this.isOpen = true
    this.renderTabs()
    this.render()
    this.root.classList.remove('hidden')
  }

  close(): void {
    if (!this.isOpen) return
    this.isOpen = false
    this.root.classList.add('hidden')
    this.cb.onClose()
  }

  private renderTabs(): void {
    this.tabsEl.replaceChildren(
      ...TABS.map((t) =>
        el('button', {
          class: 'pc-tab' + (t.id === this.tab ? ' active' : ''),
          text: `${t.icon} ${t.name}`,
          on: {
            click: () => {
              this.tab = t.id
              this.renderTabs()
              this.render()
            }
          }
        })
      )
    )
  }

  private render(): void {
    const gs = this.gs
    if (!gs) return
    let nodes: Node[]
    switch (this.tab) {
      case 'projects':
        nodes = this.renderProjects(gs)
        break
      case 'business':
        nodes = this.renderBusiness(gs)
        break
      case 'profile':
        nodes = this.renderProfile(gs)
        break
      case 'learn':
        nodes = this.renderLearn(gs)
        break
      default:
        nodes = this.renderFreelance(gs)
    }
    this.content.replaceChildren(...nodes)
  }

  private renderFreelance(gs: GameState): Node[] {
    if (gs.availableJobs.length === 0) {
      return [el('div', { class: 'pc-empty', text: 'Hozircha yangi ish yo‘q — keyinroq qarang.' })]
    }
    return gs.availableJobs.map((j) =>
      this.jobCard(j, true, () => {
        gs.acceptJob(j.id)
        this.render()
      })
    )
  }

  private renderProjects(gs: GameState): Node[] {
    if (gs.activeProjects.length === 0) {
      return [el('div', { class: 'pc-empty', text: 'Faol loyiha yo‘q. Freelance bo‘limidan ish oling.' })]
    }
    return gs.activeProjects.map((j) => this.projectCard(gs, j))
  }

  private jobCard(j: Project, accept: boolean, onClick: () => void): HTMLElement {
    return el('div', { class: 'job-card' }, [
      el('div', { class: 'job-main' }, [
        el('div', { class: 'job-title', text: j.title }),
        el('div', { class: 'job-meta', text: `${stars(j.difficulty)} · muddat ${j.deadlineDays} kun` })
      ]),
      el('div', { class: 'job-side' }, [
        el('div', { class: 'job-budget', text: `${money(j.budget)} so'm` }),
        accept
          ? el('button', { class: 'pc-btn', text: 'Qabul qilish', on: { click: onClick } })
          : el('span')
      ])
    ])
  }

  private projectCard(gs: GameState, j: Project): HTMLElement {
    const fill = el('span')
    fill.style.width = `${Math.round(j.progress)}%`
    fill.style.background = j.progress >= 100 ? 'var(--good)' : 'var(--accent)'
    const done = j.progress >= 100
    return el('div', { class: 'job-card' }, [
      el('div', { class: 'job-main' }, [
        el('div', { class: 'job-title', text: j.title }),
        el('div', { class: 'bar' }, [fill]),
        el('div', { class: 'job-meta', text: `${Math.round(j.progress)}% · ${money(j.budget)} so'm` })
      ]),
      el('div', { class: 'job-side' }, [
        done
          ? el('button', {
              class: 'pc-btn good',
              text: 'Topshirish',
              on: {
                click: () => {
                  gs.deliverProject(j.id)
                  this.render()
                }
              }
            })
          : el('button', {
              class: 'pc-btn',
              text: 'Ishlash',
              on: {
                click: () => {
                  gs.workProject(j.id)
                  this.render()
                }
              }
            })
      ])
    ])
  }

  private renderProfile(gs: GameState): Node[] {
    const c = gs.career
    const bar = (val: number, good = true) => {
      const f = el('span')
      f.style.width = `${Math.round(val)}%`
      f.style.background = good ? 'var(--good)' : 'var(--accent)'
      return el('div', { class: 'bar' }, [f])
    }
    return [
      el('div', { class: 'profile-head' }, [
        el('div', { class: 'profile-name', text: gs.name }),
        el('div', { class: 'profile-level', text: `Level ${c.level} — ${c.title}` })
      ]),
      el('div', { class: 'profile-stat' }, [el('span', { text: 'Portfolio' }), bar(gs.portfolio)]),
      el('div', { class: 'profile-stat' }, [el('span', { text: 'Reputatsiya' }), bar(gs.reputation)]),
      el('div', { class: 'profile-stat' }, [
        el('span', { text: 'Dizayn mahorati' }),
        bar(gs.skills.design, false)
      ]),
      el('div', { class: 'profile-row', text: `Tugatilgan loyihalar: ${gs.completedProjects}` }),
      el('div', { class: 'profile-row', text: `Yutuqlar: ${gs.unlockedAchievements.length}/${ACHIEVEMENTS.length}` }),
      el('div', { class: 'profile-row', text: `Balans: ${money(gs.money)} so'm` })
    ]
  }

  private renderLearn(gs: GameState): Node[] {
    return COURSES.map((c) =>
      el('div', { class: 'job-card' }, [
        el('div', { class: 'job-main' }, [
          el('div', { class: 'job-title', text: c.name }),
          el('div', { class: 'job-meta', text: `dizayn +${c.skillGain} · ${c.hours} soat` })
        ]),
        el('div', { class: 'job-side' }, [
          el('div', { class: 'job-budget', text: `${money(c.cost)} so'm` }),
          el('button', {
            class: 'pc-btn',
            text: 'Sotib olish',
            on: {
              click: () => {
                gs.buyCourse(c.id)
                this.render()
              }
            }
          })
        ])
      ])
    )
  }

  private renderBusiness(gs: GameState): Node[] {
    if (!gs.agency) {
      const can = gs.canFoundAgency()
      const nameInput = el('input', {
        class: 'biz-name',
        attrs: { type: 'text', placeholder: 'Agentlik nomi', maxlength: '24' }
      }) as HTMLInputElement
      const foundBtn = el('button', {
        class: 'pc-btn',
        text: 'Agentlik ochish',
        on: { click: () => { if (gs.foundAgency(nameInput.value)) this.render() } }
      }) as HTMLButtonElement
      foundBtn.disabled = !can
      return [
        el('div', { class: 'biz-found' }, [
          el('div', { class: 'biz-section-title', text: 'O‘z agentligingni och' }),
          el('div', { class: 'ph-note', text: `Shart: ${money(FOUND_COST)} so'm + portfolio ${FOUND_PORTFOLIO}` }),
          el('div', { class: 'ph-note', text: `Sizda: ${money(gs.money)} so'm · portfolio ${Math.round(gs.portfolio)}` }),
          nameInput,
          foundBtn
        ])
      ]
    }

    const a = gs.agency
    const cap = gs.officeCapacity
    const office = OFFICES[a.officeLevel]
    const hasNext = a.officeLevel + 1 < OFFICES.length
    const nextOffice = hasNext ? OFFICES[a.officeLevel + 1] : null

    const head = el('div', { class: 'biz-head' }, [
      el('div', { class: 'biz-name-row' }, [
        el('span', { class: 'biz-agency-name', text: a.name }),
        el('span', { class: 'biz-title', text: gs.agencyTitle })
      ]),
      el('div', { class: 'ph-note', text: `Ofis: ${office.name} · xodimlar ${a.employees.length}/${cap}` }),
      nextOffice
        ? el('button', {
            class: 'pc-btn',
            text: `Ofisni kengaytirish → ${nextOffice.name} (${money(nextOffice.upgradeCost)})`,
            on: { click: () => { gs.upgradeOffice(); this.render() } }
          })
        : el('div', { class: 'ph-note', text: 'Ofis maksimal darajada' })
    ])

    const empSection = el('div', { class: 'biz-section' }, [
      el('div', { class: 'biz-section-title', text: 'Xodimlar' }),
      ...(a.employees.length
        ? a.employees.map((e) => this.empCard(e, 'Bo‘shatish', () => { gs.fireEmployee(e.id); this.render() }))
        : [el('div', { class: 'ph-note', text: 'Hozircha xodim yo‘q' })])
    ])

    const candSection = el('div', { class: 'biz-section' }, [
      el('div', { class: 'biz-section-title', text: 'Nomzodlar' }),
      ...a.candidates.map((e) => this.empCard(e, 'Yollash', () => { gs.hireEmployee(e.id); this.render() }))
    ])

    return [head, empSection, candSection]
  }

  private empCard(e: Employee, btnText: string, onClick: () => void): HTMLElement {
    return el('div', { class: 'job-card' }, [
      el('div', { class: 'job-main' }, [
        el('div', { class: 'job-title', text: e.name }),
        el('div', { class: 'job-meta', text: `${e.role} · mahorat ${e.skill} · maosh ${money(e.salary)}/kun` })
      ]),
      el('div', { class: 'job-side' }, [el('button', { class: 'pc-btn', text: btnText, on: { click: onClick } })])
    ])
  }

  dispose(): void {
    this.root.remove()
  }
}
