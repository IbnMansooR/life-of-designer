// Markaziy o'yin holati — yagona haqiqat manbai (single source of truth).
// Barcha tizimlar shu ma'lumotni o'qiydi/o'zgartiradi. Save tizimi shuni serializatsiya qiladi.
import { GameTime } from '../core/Time'
import { bus, GameEvents } from '../core/EventBus'
import { getFamily } from '../data/families'

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

export interface SerializedGame {
  version: number
  createdAt: string
  name: string
  familyId: string
  money: number
  needs: Needs
  timeMinutes: number
  position: Vec3
  rotationY: number
}

const SAVE_VERSION = 1

export class GameState {
  name = 'Dizayner'
  familyId = 'mother_only'
  money = 0
  needs: Needs = { energy: 90, hunger: 15, stress: 30, mood: 70 }
  time = new GameTime()
  position: Vec3 = { x: 0, y: 0, z: 0 }
  rotationY = 0

  /** Yangi o'yin: ism + oilaviy holat asosida boshlang'ich qiymatlarni o'rnatadi. */
  static newGame(name: string, familyId: string): GameState {
    const gs = new GameState()
    const fam = getFamily(familyId)
    gs.name = name.trim() || 'Dizayner'
    gs.familyId = familyId
    gs.money = fam.startMoney
    gs.needs = { energy: 90, hunger: 15, stress: fam.startStress, mood: 70 }
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
      money: this.money,
      needs: { ...this.needs },
      timeMinutes: this.time.totalMinutes,
      position: { ...this.position },
      rotationY: this.rotationY
    }
  }

  static fromSerialized(data: SerializedGame): GameState {
    const gs = new GameState()
    gs.name = data.name
    gs.familyId = data.familyId
    gs.money = data.money
    gs.needs = { ...data.needs }
    gs.time = new GameTime()
    gs.time.totalMinutes = data.timeMinutes
    gs.position = { ...data.position }
    gs.rotationY = data.rotationY ?? 0
    return gs
  }
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v))
}
