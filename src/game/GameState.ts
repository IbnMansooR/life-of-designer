// Markaziy o'yin holati — yagona haqiqat manbai (single source of truth).
// Barcha tizimlar shu ma'lumotni o'qiydi/o'zgartiradi. Save tizimi shuni serializatsiya qiladi.
import { GameTime } from '../core/Time'
import { bus, GameEvents } from '../core/EventBus'
import { getFamily } from '../data/families'
import { type Appearance, DEFAULT_APPEARANCE } from '../data/appearance'
import { STARTING_ITEMS } from '../data/items'
import { type Project, type CareerLevel, generateJobs, careerLevel, COURSES } from '../data/jobs'
import {
  type Agency,
  OFFICES,
  FOUND_COST,
  FOUND_PORTFOLIO,
  generateCandidates,
  agencyTitle
} from '../data/business'
import type { EventEffect } from '../data/events'
import { ACHIEVEMENTS } from '../data/achievements'
import {
  type Partner,
  generateCandidates as generatePartnerCandidates,
  randomChildName,
  DATE_VENUES,
  ENGAGE_THRESHOLD,
  MARRY_THRESHOLD,
  WEDDING_COST
} from '../data/partners'
import { POST_PORTFOLIO_MIN } from '../data/pontorest'

export interface Needs {
  energy: number // 0..100 (uyqu/charchoq)
  hunger: number // 0..100 (0 = to'q, 100 = juda och)
  stress: number // 0..100
  mood: number // 0..100 (kayfiyat)
}

export interface Vec3 {
  x: number
  y: number
  z: number
}

export interface Skills {
  design: number // 0..100 — dizayn mahorati
}

export interface GameSettings {
  sensitivity: number  // sichqoncha sezgirligi: 0.5..2.0
  defaultSpeed: number // standart o'yin tezligi: 1 | 2 | 4
}

export interface SerializedGame {
  version: number
  createdAt: string
  name: string
  familyId: string
  appearance: Appearance
  money: number
  needs: Needs
  skills: Skills
  inventory: string[]
  familyRelationship: number
  lastFamilyContactDay: number
  reputation: number
  portfolio: number
  completedProjects: number
  availableJobs: Project[]
  activeProjects: Project[]
  agency: Agency | null
  unlockedAchievements: string[]
  partner: Partner | null
  datingCandidates: Partner[]
  followers: number
  socialReputation: number
  moodboard: string[]
  posts: number
  brandName: string
  distractionToday: number
  settings?: Partial<GameSettings>
  timeMinutes: number
  position: Vec3
  rotationY: number
}

const SAVE_VERSION = 1

export class GameState {
  name = 'Dizayner'
  familyId = 'mother_only'
  appearance: Appearance = { ...DEFAULT_APPEARANCE }
  money = 0
  needs: Needs = { energy: 90, hunger: 15, stress: 30, mood: 70 }
  skills: Skills = { design: 0 }
  inventory: string[] = [...STARTING_ITEMS]
  familyRelationship = 70 // 0..100 — oila bilan aloqa darajasi
  lastFamilyContactDay = 1
  reputation = 10 // 0..100 — kasbiy obro'
  portfolio = 0 // 0..100 — portfolio darajasi (karera bosqichini belgilaydi)
  completedProjects = 0
  availableJobs: Project[] = []
  activeProjects: Project[] = []
  agency: Agency | null = null
  unlockedAchievements: string[] = []
  partner: Partner | null = null
  datingCandidates: Partner[] = []
  followers = 0
  socialReputation = 0 // 0..100
  moodboard: string[] = []
  posts = 0
  brandName = ''
  distractionToday = 0 // bugun chalg'ishga sarflangan daqiqalar
  settings: GameSettings = { sensitivity: 1.0, defaultSpeed: 1 }
  private distractWarned = false
  time = new GameTime()
  position: Vec3 = { x: 0, y: 0, z: 0 }
  rotationY = 0

  /** Yangi o'yin: ism + oilaviy holat + ko'rinish asosida boshlang'ich qiymatlar. */
  static newGame(name: string, familyId: string, appearance: Appearance): GameState {
    const gs = new GameState()
    const fam = getFamily(familyId)
    gs.name = name.trim() || 'Dizayner'
    gs.familyId = familyId
    gs.appearance = { ...appearance }
    gs.money = fam.startMoney
    gs.needs = { energy: 90, hunger: 15, stress: fam.startStress, mood: 70 }
    gs.skills = { design: 0 }
    gs.inventory = [...STARTING_ITEMS]
    gs.familyRelationship = 70
    gs.lastFamilyContactDay = 1
    gs.availableJobs = generateJobs(4)
    gs.datingCandidates = generatePartnerCandidates(4)
    gs.time = new GameTime()
    gs.position = { x: 0, y: 0, z: 2 }
    gs.rotationY = 0
    return gs
  }

  /** Ehtiyojlarni vaqt o'tishi bilan yangilaydi. dtMinutes — o'tgan game-daqiqalar. */
  updateNeeds(dtMinutes: number): void {
    const n = this.needs
    n.energy = clamp(n.energy - dtMinutes * 0.025)
    n.hunger = clamp(n.hunger + dtMinutes * 0.035)
    // Och va charchagan bo'lsa stress oshadi
    const pressure = (n.hunger > 70 ? 0.02 : 0) + (n.energy < 25 ? 0.02 : 0)
    n.stress = clamp(n.stress + dtMinutes * pressure - dtMinutes * 0.005)
    // Kayfiyat stress va ehtiyojlarga bog'liq
    const target = clamp(100 - n.stress * 0.6 - n.hunger * 0.2 - (100 - n.energy) * 0.2)
    n.mood += (target - n.mood) * Math.min(dtMinutes * 0.01, 1)
    n.mood = clamp(n.mood)
    bus.emit(GameEvents.NeedsChanged, n)
  }

  setMoney(value: number): void {
    this.money = Math.max(0, Math.round(value))
    bus.emit(GameEvents.MoneyChanged, this.money)
  }

  addMoney(delta: number): void {
    this.setMoney(this.money + delta)
  }

  serialize(): SerializedGame {
    return {
      version: SAVE_VERSION,
      createdAt: new Date().toISOString(),
      name: this.name,
      familyId: this.familyId,
      appearance: { ...this.appearance },
      money: this.money,
      needs: { ...this.needs },
      skills: { ...this.skills },
      inventory: [...this.inventory],
      familyRelationship: this.familyRelationship,
      lastFamilyContactDay: this.lastFamilyContactDay,
      reputation: this.reputation,
      portfolio: this.portfolio,
      completedProjects: this.completedProjects,
      availableJobs: this.availableJobs.map((j) => ({ ...j })),
      activeProjects: this.activeProjects.map((j) => ({ ...j })),
      agency: this.agency
        ? {
            ...this.agency,
            employees: this.agency.employees.map((e) => ({ ...e })),
            candidates: this.agency.candidates.map((e) => ({ ...e }))
          }
        : null,
      unlockedAchievements: [...this.unlockedAchievements],
      partner: this.partner
        ? { ...this.partner, children: this.partner.children.map((c) => ({ ...c })) }
        : null,
      datingCandidates: this.datingCandidates.map((p) => ({
        ...p,
        children: p.children.map((c) => ({ ...c }))
      })),
      followers: this.followers,
      socialReputation: this.socialReputation,
      moodboard: [...this.moodboard],
      posts: this.posts,
      brandName: this.brandName,
      distractionToday: this.distractionToday,
      settings: { ...this.settings },
      timeMinutes: this.time.totalMinutes,
      position: { ...this.position },
      rotationY: this.rotationY
    }
  }

  static fromSerialized(data: SerializedGame): GameState {
    const gs = new GameState()
    gs.name = data.name
    gs.familyId = data.familyId
    gs.appearance = { ...DEFAULT_APPEARANCE, ...(data.appearance ?? {}) }
    gs.money = data.money
    gs.needs = { ...data.needs }
    gs.skills = { design: data.skills?.design ?? 0 }
    gs.inventory = data.inventory ? [...data.inventory] : [...STARTING_ITEMS]
    gs.familyRelationship = data.familyRelationship ?? 70
    gs.lastFamilyContactDay = data.lastFamilyContactDay ?? 1
    gs.reputation = data.reputation ?? 10
    gs.portfolio = data.portfolio ?? 0
    gs.completedProjects = data.completedProjects ?? 0
    gs.availableJobs = data.availableJobs ? data.availableJobs.map((j) => ({ ...j })) : generateJobs(4)
    gs.activeProjects = data.activeProjects ? data.activeProjects.map((j) => ({ ...j })) : []
    gs.agency = data.agency
      ? {
          ...data.agency,
          employees: data.agency.employees.map((e) => ({ ...e })),
          candidates: data.agency.candidates.map((e) => ({ ...e }))
        }
      : null
    gs.unlockedAchievements = data.unlockedAchievements ? [...data.unlockedAchievements] : []
    gs.partner = data.partner
      ? { ...data.partner, children: data.partner.children.map((c) => ({ ...c })) }
      : null
    gs.datingCandidates = data.datingCandidates
      ? data.datingCandidates.map((p) => ({ ...p, children: p.children.map((c) => ({ ...c })) }))
      : []
    gs.followers = data.followers ?? 0
    gs.socialReputation = data.socialReputation ?? 0
    gs.moodboard = data.moodboard ? [...data.moodboard] : []
    gs.posts = data.posts ?? 0
    gs.brandName = data.brandName ?? ''
    gs.distractionToday = data.distractionToday ?? 0
    gs.settings = { sensitivity: 1.0, defaultSpeed: 1, ...(data.settings ?? {}) }
    gs.time = new GameTime()
    gs.time.totalMinutes = data.timeMinutes
    gs.position = { ...data.position }
    gs.rotationY = data.rotationY ?? 0
    return gs
  }

  /** Ehtiyojlarni 0..100 oralig'ida ushlab turadi va hodisani chiqaradi. */
  clampNeeds(): void {
    const n = this.needs
    n.energy = clamp(n.energy)
    n.hunger = clamp(n.hunger)
    n.stress = clamp(n.stress)
    n.mood = clamp(n.mood)
    bus.emit(GameEvents.NeedsChanged, n)
  }

  /** Oila bilan qo'ng'iroq — aloqa darajasi va kayfiyat oshadi (Part 1: telefon qilish). */
  contactFamily(): void {
    this.familyRelationship = clamp(this.familyRelationship + 9)
    this.needs.mood = clamp(this.needs.mood + 6)
    this.lastFamilyContactDay = this.time.day
    this.time.advance(15)
    bus.emit(GameEvents.Toast, 'Oila bilan gaplashding 💛 aloqa oshdi')
    bus.emit(GameEvents.NeedsChanged, this.needs)
  }

  /** Oilaga pul yuborish — aloqa darajasi oshadi (Part 1: pul yuborish tizimi). */
  sendFamilyMoney(amount: number): boolean {
    if (this.money < amount) {
      bus.emit(GameEvents.Toast, 'Mablag‘ yetarli emas')
      return false
    }
    this.addMoney(-amount)
    this.familyRelationship = clamp(this.familyRelationship + 13)
    this.lastFamilyContactDay = this.time.day
    this.needs.mood = clamp(this.needs.mood + 3)
    bus.emit(GameEvents.Toast, `Oilaga ${formatSom(amount)} so'm yubording 💛`)
    return true
  }

  /** Har yangi kunda — aloqasiz qolsa daraja pasayadi. neglected -> ogohlantirish kerak. */
  applyDailyFamily(currentDay: number): { neglected: boolean } {
    const daysSince = currentDay - this.lastFamilyContactDay
    if (daysSince >= 2) {
      this.familyRelationship = clamp(this.familyRelationship - 7)
      this.needs.mood = clamp(this.needs.mood - 3)
    }
    return { neglected: daysSince >= 2 && this.familyRelationship < 55 }
  }

  // ===== Karera / Freelance (Part 4) =====

  get career(): CareerLevel {
    return careerLevel(this.portfolio)
  }

  /** Ish takliflari kam bo'lsa yangilarini qo'shadi. */
  ensureJobs(): void {
    if (this.availableJobs.length < 3) {
      this.availableJobs.push(...generateJobs(3 - this.availableJobs.length))
    }
  }

  /** Ishni qabul qilish — faol loyihaga aylanadi (maks 3 ta). */
  acceptJob(id: string): boolean {
    if (this.activeProjects.length >= 3) {
      bus.emit(GameEvents.Toast, 'Bir vaqtda ko‘pi bilan 3 ta loyiha')
      return false
    }
    const idx = this.availableJobs.findIndex((j) => j.id === id)
    if (idx < 0) return false
    const [job] = this.availableJobs.splice(idx, 1)
    job.progress = 0
    this.activeProjects.push(job)
    this.ensureJobs()
    bus.emit(GameEvents.Toast, `Ish qabul qilindi: ${job.title}`)
    return true
  }

  /** Dizayn studiyasidan keyin loyihaga progress (sifat 0..1 ga bog'liq). */
  submitDesignWork(id: string, quality: number): void {
    const job = this.activeProjects.find((j) => j.id === id)
    if (!job) return
    const base = Math.max(8, 16 + this.skills.design * 0.4 - job.difficulty * 2)
    const gain = base * (0.5 + quality) // sifat 0 -> 0.5x, sifat 1 -> 1.5x
    job.progress = Math.min(100, job.progress + gain)
    this.skills.design = clamp(this.skills.design + 1 + quality)
    this.needs.energy = clamp(this.needs.energy - 15)
    this.needs.stress = clamp(this.needs.stress + 9)
    this.needs.hunger = clamp(this.needs.hunger + 10)
    this.time.advance(150)
    bus.emit(GameEvents.Toast, `Ishlading — sifat ${Math.round(quality * 100)}% · ${Math.round(job.progress)}%`)
    bus.emit(GameEvents.NeedsChanged, this.needs)
  }

  /** Tugagan loyihani topshirish — pul, reputatsiya, portfolio, skill. */
  deliverProject(id: string): void {
    const idx = this.activeProjects.findIndex((j) => j.id === id)
    if (idx < 0) return
    const job = this.activeProjects[idx]
    if (job.progress < 100) {
      bus.emit(GameEvents.Toast, 'Loyiha hali tugamagan')
      return
    }
    this.activeProjects.splice(idx, 1)
    this.completedProjects++
    this.addMoney(job.budget)
    this.reputation = clamp(this.reputation + 4 + job.difficulty * 3)
    this.portfolio = clamp(this.portfolio + 2 + job.difficulty * 2)
    this.skills.design = clamp(this.skills.design + 2)
    this.needs.mood = clamp(this.needs.mood + 8)
    bus.emit(GameEvents.Toast, `✅ Topshirildi! +${formatSom(job.budget)} so'm`)
    bus.emit(GameEvents.NeedsChanged, this.needs)
    this.checkAchievements()
  }

  /** Kurs sotib olish — dizayn mahorati oshadi (Part 4: learning system). */
  buyCourse(courseId: string): void {
    const course = COURSES.find((c) => c.id === courseId)
    if (!course) return
    if (this.money < course.cost) {
      bus.emit(GameEvents.Toast, 'Mablag‘ yetarli emas')
      return
    }
    this.addMoney(-course.cost)
    this.skills.design = clamp(this.skills.design + course.skillGain)
    this.needs.energy = clamp(this.needs.energy - 8)
    this.time.advance(course.hours * 60)
    bus.emit(GameEvents.Toast, `📚 ${course.name} — dizayn +${course.skillGain}`)
    bus.emit(GameEvents.NeedsChanged, this.needs)
  }

  // ===== Biznes / Agentlik (Part 4) =====

  canFoundAgency(): boolean {
    return !this.agency && this.money >= FOUND_COST && this.portfolio >= FOUND_PORTFOLIO
  }

  foundAgency(name: string): boolean {
    if (!this.canFoundAgency()) {
      bus.emit(GameEvents.Toast, `Shart: ${formatSom(FOUND_COST)} so'm + portfolio ${FOUND_PORTFOLIO}`)
      return false
    }
    this.addMoney(-FOUND_COST)
    this.agency = {
      name: name.trim() || 'Studio',
      foundedDay: this.time.day,
      officeLevel: 0,
      employees: [],
      candidates: generateCandidates(4)
    }
    bus.emit(GameEvents.Toast, `🏢 "${this.agency.name}" agentligi ochildi!`)
    this.checkAchievements()
    return true
  }

  get officeCapacity(): number {
    return this.agency ? OFFICES[this.agency.officeLevel].capacity : 0
  }

  get agencyTitle(): string {
    return this.agency ? agencyTitle(this.agency.employees.length) : ''
  }

  hireEmployee(id: string): void {
    const a = this.agency
    if (!a) return
    if (a.employees.length >= this.officeCapacity) {
      bus.emit(GameEvents.Toast, 'Ofis to‘la — avval kengaytiring')
      return
    }
    const idx = a.candidates.findIndex((e) => e.id === id)
    if (idx < 0) return
    const [emp] = a.candidates.splice(idx, 1)
    a.employees.push(emp)
    if (a.candidates.length < 3) a.candidates.push(...generateCandidates(3 - a.candidates.length))
    bus.emit(GameEvents.Toast, `${emp.name} (${emp.role}) ishga olindi`)
    this.checkAchievements()
  }

  fireEmployee(id: string): void {
    const a = this.agency
    if (!a) return
    const idx = a.employees.findIndex((e) => e.id === id)
    if (idx < 0) return
    const [emp] = a.employees.splice(idx, 1)
    bus.emit(GameEvents.Toast, `${emp.name} ishdan bo‘shatildi`)
  }

  upgradeOffice(): void {
    const a = this.agency
    if (!a) return
    const next = a.officeLevel + 1
    if (next >= OFFICES.length) {
      bus.emit(GameEvents.Toast, 'Ofis allaqachon maksimal')
      return
    }
    const cost = OFFICES[next].upgradeCost
    if (this.money < cost) {
      bus.emit(GameEvents.Toast, 'Mablag‘ yetarli emas')
      return
    }
    this.addMoney(-cost)
    a.officeLevel = next
    bus.emit(GameEvents.Toast, `🏢 Ofis kengaydi: ${OFFICES[next].name}`)
  }

  /** Har kunda — agentlik daromadi minus maoshlar (Part 4: company management). */
  processAgencyDay(): { income: number; salaries: number; net: number } | null {
    const a = this.agency
    if (!a || a.employees.length === 0) return null
    let income = 0
    let salaries = 0
    for (const e of a.employees) {
      income += e.skill * 8000
      salaries += e.salary
    }
    const net = income - salaries
    this.addMoney(net)
    return { income, salaries, net }
  }

  // ===== Hayot eventlari va yutuqlar (Part 8 / Part 5) =====

  applyEventChoice(e: EventEffect): void {
    if (e.money) this.addMoney(e.money)
    if (e.mood) this.needs.mood = clamp(this.needs.mood + e.mood)
    if (e.stress) this.needs.stress = clamp(this.needs.stress + e.stress)
    if (e.relationship) this.familyRelationship = clamp(this.familyRelationship + e.relationship)
    if (e.reputation) this.reputation = clamp(this.reputation + e.reputation)
    this.clampNeeds()
    this.checkAchievements()
  }

  /** Ochilmagan yutuqlarni tekshiradi va ochadi. */
  checkAchievements(): void {
    for (const a of ACHIEVEMENTS) {
      if (!this.unlockedAchievements.includes(a.id) && a.test(this)) {
        this.unlockedAchievements.push(a.id)
        bus.emit(GameEvents.Toast, `🏆 Yutuq: ${a.title}`)
      }
    }
  }

  // ===== Munosabat / Oila (Part 2) =====

  refreshCandidates(): void {
    if (!this.partner && this.datingCandidates.length < 3) {
      this.datingCandidates.push(...generatePartnerCandidates(3 - this.datingCandidates.length))
    }
  }

  startDating(id: string): void {
    if (this.partner) return
    const idx = this.datingCandidates.findIndex((p) => p.id === id)
    if (idx < 0) return
    const [p] = this.datingCandidates.splice(idx, 1)
    p.relationship = 25
    p.status = 'dating'
    p.lastContactDay = this.time.day
    this.partner = p
    bus.emit(GameEvents.Toast, `${p.name} bilan tanishding 💞`)
  }

  dateWith(venueIndex: number): void {
    const p = this.partner
    const v = DATE_VENUES[venueIndex]
    if (!p || !v) return
    if (this.money < v.cost) {
      bus.emit(GameEvents.Toast, 'Mablag‘ yetarli emas')
      return
    }
    this.addMoney(-v.cost)
    p.relationship = clamp(p.relationship + v.rel)
    p.lastContactDay = this.time.day
    this.needs.mood = clamp(this.needs.mood + 6)
    this.time.advance(120)
    bus.emit(GameEvents.Toast, `${v.name}da uchrashuv — aloqa +${v.rel}`)
    bus.emit(GameEvents.NeedsChanged, this.needs)
  }

  giftPartner(amount: number): void {
    const p = this.partner
    if (!p) return
    if (this.money < amount) {
      bus.emit(GameEvents.Toast, 'Mablag‘ yetarli emas')
      return
    }
    this.addMoney(-amount)
    p.relationship = clamp(p.relationship + 8)
    p.lastContactDay = this.time.day
    bus.emit(GameEvents.Toast, 'Sovg‘a berding — aloqa +8 💝')
  }

  spendTimeWithPartner(): void {
    const p = this.partner
    if (!p) return
    p.relationship = clamp(p.relationship + 6)
    p.lastContactDay = this.time.day
    this.needs.mood = clamp(this.needs.mood + 7)
    this.time.advance(90)
    bus.emit(GameEvents.Toast, 'Birga vaqt o‘tkazding 💞')
    bus.emit(GameEvents.NeedsChanged, this.needs)
  }

  engagePartner(): void {
    const p = this.partner
    if (!p || p.status !== 'dating') return
    if (p.relationship < ENGAGE_THRESHOLD) {
      bus.emit(GameEvents.Toast, `Aloqa ${ENGAGE_THRESHOLD}+ bo‘lishi kerak`)
      return
    }
    p.status = 'engaged'
    bus.emit(GameEvents.Toast, `💍 ${p.name} bilan unashtirildingiz!`)
  }

  marryPartner(): void {
    const p = this.partner
    if (!p || p.status !== 'engaged') return
    if (p.relationship < MARRY_THRESHOLD) {
      bus.emit(GameEvents.Toast, `Aloqa ${MARRY_THRESHOLD}+ bo‘lishi kerak`)
      return
    }
    if (this.money < WEDDING_COST) {
      bus.emit(GameEvents.Toast, `To‘y uchun ${formatSom(WEDDING_COST)} so'm kerak`)
      return
    }
    this.addMoney(-WEDDING_COST)
    p.status = 'married'
    this.needs.mood = clamp(this.needs.mood + 20)
    bus.emit(GameEvents.Toast, `🎉 ${p.name} bilan turmush qurdingiz!`)
    bus.emit(GameEvents.NeedsChanged, this.needs)
    this.checkAchievements()
  }

  haveChild(): void {
    const p = this.partner
    if (!p || p.status !== 'married') return
    if (p.children.length >= 4) {
      bus.emit(GameEvents.Toast, 'Hozircha yetarli 🙂')
      return
    }
    p.children.push({ name: randomChildName(), ageDays: 0 })
    this.needs.mood = clamp(this.needs.mood + 15)
    bus.emit(GameEvents.Toast, '👶 Farzand ko‘rdingiz — tabriklaymiz!')
    bus.emit(GameEvents.NeedsChanged, this.needs)
    this.checkAchievements()
  }

  breakup(): void {
    const p = this.partner
    if (!p) return
    this.partner = null
    this.needs.mood = clamp(this.needs.mood - 15)
    this.refreshCandidates()
    bus.emit(GameEvents.Toast, `${p.name} bilan ajrashdingiz 💔`)
    bus.emit(GameEvents.NeedsChanged, this.needs)
  }

  /** Har kunda — aloqa pasayishi, farzand o'sishi, ajralish xavfi (Part 2). */
  processRelationshipDay(): void {
    const p = this.partner
    if (!p) {
      this.refreshCandidates()
      return
    }
    for (const c of p.children) c.ageDays += 1
    const daysSince = this.time.day - p.lastContactDay
    if (daysSince >= 2 && p.status !== 'married') {
      p.relationship = clamp(p.relationship - 6)
    }
    if (p.relationship > 60) this.needs.mood = clamp(this.needs.mood + 2)
    if (p.relationship <= 0) this.breakup()
  }

  // ===== PontoRest / Ijtimoiy (Part 5) =====

  saveInspiration(id: string): void {
    if (this.moodboard.includes(id)) return
    this.moodboard.push(id)
    this.skills.design = clamp(this.skills.design + 0.5)
    this.needs.mood = clamp(this.needs.mood + 2)
    bus.emit(GameEvents.Toast, 'Moodboard’ga saqlandi — ilhom +')
    bus.emit(GameEvents.NeedsChanged, this.needs)
  }

  postWork(): void {
    if (this.portfolio < POST_PORTFOLIO_MIN) {
      bus.emit(GameEvents.Toast, `Avval portfolio ${POST_PORTFOLIO_MIN}+ bo‘lsin`)
      return
    }
    const gain = Math.round(
      10 + this.portfolio * 1.5 + this.socialReputation * 0.5 + this.moodboard.length
    )
    this.followers += gain
    this.socialReputation = clamp(this.socialReputation + 3)
    this.posts++
    this.time.advance(60)
    bus.emit(GameEvents.Toast, `📢 Post — +${gain} obunachi`)
    this.checkAchievements()
  }

  setBrand(name: string): void {
    this.brandName = name.trim().slice(0, 24)
    bus.emit(GameEvents.Toast, `Brend: ${this.brandName || '—'}`)
  }

  // ===== Chalg'ituvchi omillar (Part 8: kundalik hayot) =====

  private addDistraction(min: number, mood: number, energy: number, stressDelta: number): void {
    this.needs.mood = clamp(this.needs.mood + mood)
    if (energy) this.needs.energy = clamp(this.needs.energy - energy)
    if (stressDelta) this.needs.stress = clamp(this.needs.stress + stressDelta)
    this.time.advance(min)
    this.distractionToday += min
    if (this.distractionToday >= 240 && !this.distractWarned) {
      this.distractWarned = true
      bus.emit(GameEvents.Toast, '😅 Bugun ancha chalg‘iding — ishni unutma!')
    }
    bus.emit(GameEvents.NeedsChanged, this.needs)
  }

  playComputerGame(name: string): void {
    this.addDistraction(90, 12, 8, -8)
    bus.emit(GameEvents.Toast, `🎮 ${name} o‘ynading`)
  }

  browseInternet(): void {
    this.addDistraction(40, 4, 0, 0)
    bus.emit(GameEvents.Toast, '🌐 Internetda yurding')
  }

  scrollSocial(): void {
    this.addDistraction(20, 3, 0, 0)
  }

  playMobileGame(name: string): void {
    this.addDistraction(45, 8, 5, -4)
    bus.emit(GameEvents.Toast, `📱 ${name}`)
  }

  resetDistraction(): void {
    this.distractionToday = 0
    this.distractWarned = false
  }
}

function formatSom(v: number): string {
  return Math.round(v)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v))
}
