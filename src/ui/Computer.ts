// Kompyuter interfeysi — stolдаги ishxona "OS"i (Part 4: freelance, loyiha, portfolio, learning).
import { el } from './dom'
import type { GameState } from '../game/GameState'
import { COURSES, type Project } from '../data/jobs'
import { OFFICES, FOUND_COST, FOUND_PORTFOLIO, type Employee } from '../data/business'
import { ACHIEVEMENTS } from '../data/achievements'
import { COMPUTER_GAMES } from '../data/distractions'

export interface ComputerCallbacks {
  onClose: () => void
  onWork: (projectId: string, projectType: string) => void
}

const TABS: { id: string; name: string; icon: string }[] = [
  { id: 'freelance', name: 'Freelance', icon: '🧑‍💻' },
  { id: 'projects', name: 'Loyihalar', icon: '📁' },
  { id: 'business', name: 'Biznes', icon: '🏢' },
  { id: 'profile', name: 'Profil', icon: '🪪' },
  { id: 'learn', name: "O'rganish", icon: '📚' },
  { id: 'fun', name: 'Dam olish', icon: '🎮' }
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

  // Mini-o'yin holati
  private activeGame: string | null = null
  private gameLevel = 1
  private gameSessionMins = 0
  // Nim (Strategiya)
  private nimPile = 0
  private nimTurn: 'player' | 'cpu' = 'player'
  private nimMsg = ''
  private nimWins = 0
  private nimWaiting = false
  // Futbol
  private ftRound = 0
  private ftMyGoals = 0
  private ftCpuGoals = 0
  private ftPhase: 'kick' | 'save' | 'done' = 'kick'
  private ftMsg = ''
  // Otishma (Shooter)
  private shtCell = -1
  private shtScore = 0
  private shtLives = 3
  private shtMsg = ''
  private shtTimerId: ReturnType<typeof setTimeout> | null = null
  private shtDeadline = 0
  // Poyga (Reaction)
  private raceRound = 0
  private raceHits = 0
  private raceState: 'wait' | 'go' | 'result' = 'wait'
  private raceGreenAt = 0
  private raceTimerId: ReturnType<typeof setTimeout> | null = null
  private raceMsg = ''

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

  /** Tashqi o'zgarishdan keyin (masalan studiyadan keyin) joriy tabni qayta chizadi. */
  refresh(): void {
    if (this.isOpen) this.render()
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
      case 'fun':
        nodes = this.renderFun(gs)
        break
      default:
        nodes = this.renderFreelance(gs)
    }
    this.content.replaceChildren(...nodes)
  }

  private renderFreelance(gs: GameState): Node[] {
    if (gs.availableJobs.length === 0) {
      return [el('div', { class: 'pc-empty', text: "Hozircha yangi ish yo'q — keyinroq qarang." })]
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
      return [el('div', { class: 'pc-empty', text: "Faol loyiha yo'q. Freelance bo'limidan ish oling." })]
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
              on: { click: () => this.cb.onWork(j.id, j.type) }
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

  private renderFun(gs: GameState): Node[] {
    if (this.activeGame) return this.renderActiveGame(gs)

    const mins = gs.distractionToday
    const note = el('div', { class: 'ph-note', text: `Bugun chalg'ish: ${Math.floor(mins / 60)}s ${mins % 60}d` })
    const games = COMPUTER_GAMES.map((g) =>
      el('div', { class: 'job-card' }, [
        el('div', { class: 'job-main' }, [
          el('div', { class: 'job-title', text: `${g.emoji} ${g.name}` }),
          el('div', { class: 'job-meta', text: "Haqiqiy o'yin — level tizimi, cheksiz" })
        ]),
        el('div', { class: 'job-side' }, [
          el('button', { class: 'pc-btn', text: "O'ynash", on: { click: () => this.startGame(g.id, gs) } })
        ])
      ])
    )
    const internet = el('div', { class: 'job-card' }, [
      el('div', { class: 'job-main' }, [
        el('div', { class: 'job-title', text: '🌐 Internetda yurish' }),
        el('div', { class: 'job-meta', text: "Vaqt o'tadi, kayfiyat biroz" })
      ]),
      el('div', { class: 'job-side' }, [
        el('button', { class: 'pc-btn', text: 'Ochish', on: { click: () => { gs.browseInternet(); this.render() } } })
      ])
    ])
    return [note, ...games, internet]
  }

  // ── Mini-o'yinlar ──────────────────────────────────────────────────────────

  private startGame(id: string, gs: GameState): void {
    this.clearTimers()
    this.activeGame = id
    this.gameLevel = 1
    this.gameSessionMins = 0
    if (id === 'strat') { this.nimPile = 10; this.nimTurn = 'player'; this.nimMsg = ''; this.nimWins = 0; this.nimWaiting = false }
    if (id === 'football') { this.ftRound = 0; this.ftMyGoals = 0; this.ftCpuGoals = 0; this.ftPhase = 'kick'; this.ftMsg = '' }
    if (id === 'shooter') this.startShooterRound(gs)
    if (id === 'racing') this.startRaceRound()
    this.render()
  }

  private exitGame(gs: GameState): void {
    this.clearTimers()
    const mins = 10 + this.gameSessionMins
    gs.applyGameSession(mins, 6)
    this.activeGame = null
    this.render()
  }

  private clearTimers(): void {
    if (this.shtTimerId) { clearTimeout(this.shtTimerId); this.shtTimerId = null }
    if (this.raceTimerId) { clearTimeout(this.raceTimerId); this.raceTimerId = null }
  }

  private gameHeader(name: string, emoji: string, gs: GameState): HTMLElement {
    return el('div', { class: 'pc-titlebar' }, [
      el('span', { class: 'pc-title', text: `${emoji} ${name} — Level ${this.gameLevel}` }),
      el('button', { class: 'pc-close', text: '✕', on: { click: () => this.exitGame(gs) } })
    ])
  }

  private renderActiveGame(gs: GameState): Node[] {
    switch (this.activeGame) {
      case 'strat':   return this.renderNim(gs)
      case 'football': return this.renderFootball(gs)
      case 'shooter': return this.renderShooter(gs)
      case 'racing':  return this.renderRace(gs)
      default: return []
    }
  }

  // ── NIM (Strategiya) ───────────────────────────────────────────────────────
  private renderNim(gs: GameState): Node[] {
    const header = this.gameHeader('Strategiya', '♟️', gs)
    const info = el('div', { class: 'ph-note' }, [])
    info.innerHTML = `G'alabalar: <b>${this.nimWins}</b> | Pile: <b>${this.nimPile}</b> tosh | ${this.nimTurn === 'player' ? '🟢 Sening navbating' : "🔴 Kompyuter o'ylayapti..."}`

    const pileDisplay = el('div', { class: 'nim-pile' }, [])
    pileDisplay.textContent = '🪨'.repeat(Math.min(this.nimPile, 30)) + (this.nimPile > 30 ? ` (+${this.nimPile - 30})` : '')

    const msg = el('div', { class: this.nimMsg.includes('Yutd') ? 'pc-empty' : 'ph-note', text: this.nimMsg })

    const btns: HTMLElement[] = []
    if (!this.nimWaiting && this.nimMsg === '' && this.nimTurn === 'player') {
      for (let t = 1; t <= Math.min(3, this.nimPile); t++) {
        const take = t
        btns.push(el('button', { class: 'pc-btn', text: `${take} tosh ol`, on: { click: () => this.nimPlayerMove(take, gs) } }))
      }
    } else if (this.nimMsg !== '') {
      const isWin = this.nimMsg.includes('Yutd')
      btns.push(el('button', {
        class: 'pc-btn' + (isWin ? ' good' : ''),
        text: isWin ? 'Keyingi level' : 'Qayta',
        on: { click: () => { this.nimNextRound(isWin, gs) } }
      }))
    }

    const rules = el('div', { class: 'ph-note', text: 'Oxirgi toshni olgan YUTQAZADI. Siz 1-3 ta olasiz, keyin kompyuter.' })
    return [header, info, pileDisplay, rules, msg, el('div', { class: 'send-row' }, btns)]
  }

  private nimPlayerMove(take: number, gs: GameState): void {
    if (this.nimWaiting || this.nimTurn !== 'player') return
    this.nimPile -= take
    if (this.nimPile === 0) { this.nimMsg = '🏆 Yutding! Kompyuter oxirgi toshni oldi.'; this.render(); return }
    this.nimTurn = 'cpu'; this.nimWaiting = true; this.render()
    setTimeout(() => {
      const cpuTake = this.nimCpuMove()
      this.nimPile -= cpuTake
      this.nimWaiting = false
      if (this.nimPile === 0) { this.nimMsg = '😞 Yutqazding. Sen oxirgi toshni olding.' }
      else this.nimTurn = 'player'
      this.render()
    }, 700)
  }

  private nimCpuMove(): number {
    const optimal = (this.nimPile - 1) % 4
    if (this.gameLevel >= 2 && optimal > 0) return Math.min(optimal, 3)
    return 1 + Math.floor(Math.random() * Math.min(3, this.nimPile - 1))
  }

  private nimNextRound(won: boolean, gs: GameState): void {
    if (won) { this.nimWins++; this.gameLevel++; this.gameSessionMins += 8; gs.needs.mood = Math.min(100, gs.needs.mood + 5) }
    this.nimPile = 10 + (this.gameLevel - 1) * 5
    this.nimTurn = 'player'; this.nimMsg = ''; this.nimWaiting = false
    this.render()
  }

  // ── FUTBOL (Football) ──────────────────────────────────────────────────────
  private renderFootball(gs: GameState): Node[] {
    const header = this.gameHeader('Futbol', '⚽', gs)
    const score = el('div', { class: 'ph-note' })
    score.innerHTML = `⚽ Siz <b>${this.ftMyGoals}</b> — <b>${this.ftCpuGoals}</b> 💻 | Tur ${Math.floor(this.ftRound / 2) + 1}/5`

    let body: HTMLElement[]
    if (this.ftPhase === 'done') {
      const won = this.ftMyGoals > this.ftCpuGoals
      body = [
        el('div', { class: won ? 'pc-empty' : 'ph-note', text: this.ftMsg }),
        el('button', { class: 'pc-btn' + (won ? ' good' : ''), text: won ? 'Keyingi level' : 'Qayta', on: { click: () => { this.ftNextLevel(won, gs) } } })
      ]
    } else {
      const isKick = this.ftPhase === 'kick'
      const label = isKick ? '⚽ Sen tepasan — qayerga?' : '🥅 Sen saqlamoqchisan — qayerga?'
      body = [
        el('div', { class: 'ph-note', text: label }),
        el('div', { class: 'ph-note', text: this.ftMsg }),
        el('div', { class: 'send-row' }, [
          el('button', { class: 'send-btn', text: '← Chap', on: { click: () => this.ftAction('L', gs) } }),
          el('button', { class: 'send-btn', text: '↑ Markaz', on: { click: () => this.ftAction('C', gs) } }),
          el('button', { class: 'send-btn', text: "O'ng →", on: { click: () => this.ftAction('R', gs) } })
        ])
      ]
    }
    return [header, score, ...body]
  }

  private ftAction(dir: string, gs: GameState): void {
    const dirs = ['L', 'C', 'R']
    const bias = this.gameLevel <= 1 ? 0.5 : 0.35
    const cpuDir = Math.random() < bias ? dir : dirs[Math.floor(Math.random() * 3)]
    const goal = dir !== cpuDir

    if (this.ftPhase === 'kick') {
      if (goal) { this.ftMyGoals++; this.ftMsg = `⚽ GOL! Saqlovchi ${cpuDir === 'L' ? 'chapga' : cpuDir === 'R' ? "o'ngga" : 'markazga'} sakradi.` }
      else this.ftMsg = `🧤 Saqlab olindi! Ikkalangiz ham ${dir === 'L' ? 'chapni' : dir === 'R' ? "o'ngni" : 'markazni'} tanladi.`
    } else {
      if (goal) { this.ftCpuGoals++; this.ftMsg = `😬 Gol olding! Sen ${dir === 'L' ? 'chapga' : dir === 'R' ? "o'ngga" : 'markazga'} secdirding.` }
      else this.ftMsg = `👊 Saqlading! To'g'ri taxmin.`
    }
    this.ftRound++
    if (this.ftRound % 2 === 0) this.ftPhase = this.ftPhase === 'kick' ? 'save' : 'kick'
    if (this.ftRound >= 10) {
      const won = this.ftMyGoals > this.ftCpuGoals
      this.ftPhase = 'done'
      this.ftMsg = won ? `🏆 Yutding! ${this.ftMyGoals}:${this.ftCpuGoals} — ajoyib!` : `😔 Yutqazding. ${this.ftMyGoals}:${this.ftCpuGoals}. Qayta urining!`
    }
    this.render()
  }

  private ftNextLevel(won: boolean, gs: GameState): void {
    if (won) { this.gameLevel++; this.gameSessionMins += 10; gs.needs.mood = Math.min(100, gs.needs.mood + 6) }
    this.ftRound = 0; this.ftMyGoals = 0; this.ftCpuGoals = 0; this.ftPhase = 'kick'; this.ftMsg = ''
    this.render()
  }

  // ── SHOOTER (Otishma) ──────────────────────────────────────────────────────
  private startShooterRound(gs: GameState): void {
    this.shtCell = Math.floor(Math.random() * 9)
    this.shtScore = 0; this.shtLives = 3; this.shtMsg = ''
    this.nextShtTarget(gs)
  }

  private nextShtTarget(gs: GameState): void {
    this.shtCell = Math.floor(Math.random() * 9)
    this.shtMsg = ''
    const limit = Math.max(800, 2000 - (this.gameLevel - 1) * 200)
    this.shtDeadline = Date.now() + limit
    if (this.shtTimerId) clearTimeout(this.shtTimerId)
    this.shtTimerId = setTimeout(() => {
      this.shtLives--
      this.shtMsg = '⏱ Vaqt tugadi! −❤️'
      if (this.shtLives <= 0) {
        this.shtMsg = `Oyun tugadi. Ball: ${this.shtScore}`
        this.shtCell = -1
      } else {
        this.nextShtTarget(gs)
      }
      this.render()
    }, limit)
    this.render()
  }

  private renderShooter(gs: GameState): Node[] {
    const header = this.gameHeader('Otishma', '🔫', gs)
    const info = el('div', { class: 'ph-note' })
    info.innerHTML = `Ball: <b>${this.shtScore}</b> | Hayot: ${'❤️'.repeat(this.shtLives)}${'🖤'.repeat(Math.max(0, 3 - this.shtLives))} | Tezlik: ${Math.max(800, 2000 - (this.gameLevel-1)*200)}ms`

    const cells = Array.from({ length: 9 }, (_, i) =>
      el('button', {
        class: 'sht-cell' + (i === this.shtCell ? ' active' : ''),
        text: i === this.shtCell ? '🎯' : '·',
        on: {
          click: () => {
            if (this.shtCell < 0 || this.shtLives <= 0) return
            if (i === this.shtCell) {
              if (this.shtTimerId) clearTimeout(this.shtTimerId)
              this.shtScore++
              this.shtMsg = '✅ Tegdi!'
              if (this.shtScore % 5 === 0) {
                this.gameLevel++; this.gameSessionMins += 5
                this.shtMsg = `🎉 Level ${this.gameLevel}! Tezroq!`
                gs.needs.mood = Math.min(100, gs.needs.mood + 3)
              }
              this.nextShtTarget(gs)
            } else {
              this.shtLives--
              this.shtMsg = '❌ Miss! −❤️'
              if (this.shtLives <= 0) {
                if (this.shtTimerId) clearTimeout(this.shtTimerId)
                this.shtCell = -1
                this.shtMsg = `Oyun tugadi! Ball: ${this.shtScore}`
              }
              this.render()
            }
          }
        }
      })
    )
    const grid = el('div', { class: 'sht-grid' }, cells)
    const msg = el('div', { class: 'ph-note', text: this.shtMsg })

    if (this.shtLives <= 0) {
      return [header, info, grid, msg, el('button', { class: 'pc-btn good', text: 'Qayta boshlash', on: { click: () => { this.startShooterRound(gs); this.render() } } })]
    }
    return [header, info, grid, msg]
  }

  // ── POYGA (Reaction race) ──────────────────────────────────────────────────
  private startRaceRound(): void {
    this.raceRound = 0; this.raceHits = 0; this.raceState = 'wait'; this.raceMsg = "Tayyor bo'lsang bosing!"
    this.render()
  }

  private raceGo(): void {
    const delay = 1500 + Math.random() * 2000
    this.raceState = 'wait'; this.raceMsg = '⏳ Kutamiz...'
    this.render()
    this.raceTimerId = setTimeout(() => {
      this.raceState = 'go'; this.raceGreenAt = Date.now(); this.raceMsg = '🟢 BOSING!'
      this.render()
      this.raceTimerId = setTimeout(() => {
        if (this.raceState === 'go') {
          this.raceState = 'result'; this.raceMsg = '😬 Kech qoldingiz!'; this.render()
        }
      }, 800 + Math.max(0, (4 - this.gameLevel) * 100))
    }, delay)
  }

  private renderRace(gs: GameState): Node[] {
    const header = this.gameHeader('Poyga', '🏎️', gs)
    const info = el('div', { class: 'ph-note' })
    info.innerHTML = `Tur: <b>${this.raceRound}</b>/5 | Muvaffaqiyat: <b>${this.raceHits}</b>`

    const isGo = this.raceState === 'go'
    const bigBtn = el('button', {
      class: 'race-btn' + (isGo ? ' go' : ''),
      text: this.raceState === 'wait' ? (this.raceMsg === "Tayyor bo'lsang bosing!" ? 'BOSHLASH' : '⏳') : (isGo ? '🟢 BOSING!' : this.raceMsg),
      on: {
        click: () => {
          if (this.raceState === 'wait' && this.raceMsg === "Tayyor bo'lsang bosing!") {
            this.raceRound++; this.raceGo()
          } else if (this.raceState === 'go') {
            const rt = Date.now() - this.raceGreenAt
            clearTimeout(this.raceTimerId!)
            this.raceHits++; this.raceState = 'result'; this.raceMsg = `⚡ ${rt}ms — ${rt < 300 ? 'Ajoyib!' : rt < 500 ? 'Yaxshi!' : 'Qabul!'}`
            this.render()
            if (this.raceRound < 5) setTimeout(() => { this.raceState = 'wait'; this.raceMsg = "Tayyor bo'lsang bosing!"; this.render() }, 1200)
            else this.raceFinish(gs)
          } else if (this.raceState === 'result') {
            if (this.raceRound >= 5) this.raceFinish(gs)
            else { this.raceState = 'wait'; this.raceMsg = "Tayyor bo'lsang bosing!"; this.render() }
          }
        }
      }
    })

    const nodes: Node[] = [header, info, bigBtn, el('div', { class: 'ph-note', text: "Signal yashilga o'tganda tez bosing! Oyna 0.8s" })]
    if (this.raceState === 'wait' && this.raceMsg !== "Tayyor bo'lsang bosing!") {
      nodes.push(el('div', { class: 'ph-note', text: 'Erta bosmang — kutilayotgan signal.' }))
    }
    return nodes
  }

  private raceFinish(gs: GameState): void {
    clearTimeout(this.raceTimerId!)
    const won = this.raceHits >= 3
    this.raceMsg = won ? `🏆 Level ${this.gameLevel+1}! ${this.raceHits}/5 — yaxshi refleks!` : `${this.raceHits}/5 — qayta urining!`
    if (won) { this.gameLevel++; this.gameSessionMins += 8; gs.needs.mood = Math.min(100, gs.needs.mood + 4) }
    this.raceState = 'result'; this.render()
    setTimeout(() => { this.raceRound = 0; this.raceHits = 0; this.raceState = 'wait'; this.raceMsg = "Tayyor bo'lsang bosing!"; this.render() }, 2500)
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
          el('div', { class: 'biz-section-title', text: "O'z agentligingni och" }),
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
        ? a.employees.map((e) => this.empCard(e, "Bo'shatish", () => { gs.fireEmployee(e.id); this.render() }))
        : [el('div', { class: 'ph-note', text: "Hozircha xodim yo'q" })])
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