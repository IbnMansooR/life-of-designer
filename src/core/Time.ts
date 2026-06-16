// Vaqt tizimi (Part 6 talabi: 1 o'yin kuni = 45 real daqiqa).
// O'yin vaqti game-daqiqalarda saqlanadi. Real dt (sekund) ni game-daqiqaga aylantiradi.
import { bus, GameEvents } from './EventBus'

const MINUTES_PER_DAY = 1440 // 24 * 60

export class GameTime {
  /** O'yin boshidan beri o'tgan jami game-daqiqalar. */
  totalMinutes: number
  /** Vaqt oqimi tezligi (1 = normal, 0 = pauza, 2/4 = tezlatish). */
  speed = 1
  /** 1 real sekundda nechta game-daqiqa o'tishi. */
  private readonly minutesPerRealSecond: number

  constructor(startMinutes = 7 * 60, realMinutesPerGameDay = 45) {
    // Boshlanish: 07:00. Standart: 45 real daqiqa = 1 o'yin kuni.
    this.totalMinutes = startMinutes
    this.minutesPerRealSecond = MINUTES_PER_DAY / (realMinutesPerGameDay * 60)
  }

  /** Har kadrda chaqiriladi. dt — real sekundlar. */
  update(dt: number): void {
    if (this.speed <= 0) return
    const before = this.totalMinutes
    this.totalMinutes += dt * this.minutesPerRealSecond * this.speed

    const beforeHour = Math.floor(before / 60)
    const afterHour = Math.floor(this.totalMinutes / 60)
    if (afterHour > beforeHour) {
      bus.emit(GameEvents.NewHour, this.hour)
    }

    const beforeDay = Math.floor(before / MINUTES_PER_DAY)
    const afterDay = Math.floor(this.totalMinutes / MINUTES_PER_DAY)
    if (afterDay > beforeDay) {
      bus.emit(GameEvents.NewDay, this.day)
    }

    bus.emit(GameEvents.TimeTick, this.totalMinutes)
  }

  /** 1-kundan boshlab kun raqami. */
  get day(): number {
    return Math.floor(this.totalMinutes / MINUTES_PER_DAY) + 1
  }

  get hour(): number {
    return Math.floor(this.totalMinutes / 60) % 24
  }

  get minute(): number {
    return Math.floor(this.totalMinutes % 60)
  }

  /** "07:35" ko'rinishida. */
  get clock(): string {
    const h = String(this.hour).padStart(2, '0')
    const m = String(this.minute).padStart(2, '0')
    return `${h}:${m}`
  }

  /** Kun qismi nomi (o'zbekcha). */
  get partOfDay(): string {
    const h = this.hour
    if (h < 6) return 'Tun'
    if (h < 12) return 'Ertalab'
    if (h < 17) return 'Kunduz'
    if (h < 21) return 'Kechqurun'
    return 'Tun'
  }
}
