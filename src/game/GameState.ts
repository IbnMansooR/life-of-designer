// Markaziy o'yin holati — yagona haqiqat manbai (single source of truth).
// Barcha tizimlar shu ma'lumotni o'qiydi/o'zgartiradi. Save tizimi shuni serializatsiya qiladi.
import { GameTime } from '../core/Time'
import { bus, GameEvents } from '../core/EventBus'
import { getFamily } from '../data/families'
import { type Appearance, DEFAULT_APPEARANCE } from '../data/appearance'
import { STARTING_ITEMS } from '../data/items'

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
    gs.time = new GameTime()
    gs.position = { x: 0, y: 0, z: 2 }
    gs.rotationY = 0
    return gs
  }

  /** Ehtiyojlarni vaqt o'tishi bilan yangilaydi. dtMinutes — o'tgan game-daqiqalar. */
  updateNeeds(dtMinutes: number): void {
    const n = this.needs
    n.energy = clamp(n.energy - dtMinutes * 0.03)
    n.hunger = clamp(n.hunger + dtMinutes * 0.04)
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
}

function formatSom(v: number): string {
  return Math.round(v)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v))
}
