// Oddiy, tipizatsiyalangan hodisa shinasi (event bus).
// Tizimlar bir-biriga to'g'ridan-to'g'ri bog'lanmasdan, shu orqali "gaplashadi".
// Bu Part 6 talabini bajaradi: gameplay logikasi mustaqil va modular.

export type EventHandler<T = unknown> = (payload: T) => void

export class EventBus {
  private listeners = new Map<string, Set<EventHandler<any>>>()

  /** Hodisaga obuna bo'lish. Obunani bekor qiluvchi funksiya qaytaradi. */
  on<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    let set = this.listeners.get(event)
    if (!set) {
      set = new Set()
      this.listeners.set(event, set)
    }
    set.add(handler as EventHandler<any>)
    return () => this.off(event, handler)
  }

  off<T = unknown>(event: string, handler: EventHandler<T>): void {
    this.listeners.get(event)?.delete(handler as EventHandler<any>)
  }

  emit<T = unknown>(event: string, payload?: T): void {
    const set = this.listeners.get(event)
    if (!set) return
    for (const handler of set) {
      try {
        handler(payload as T)
      } catch (err) {
        console.error(`[EventBus] "${event}" hodisasida xato:`, err)
      }
    }
  }
}

// Butun o'yin bo'ylab yagona shina.
export const bus = new EventBus()

// O'yin hodisalari nomlari (bir joyda — xato qilmaslik uchun).
export const GameEvents = {
  TimeTick: 'time:tick',
  NewHour: 'time:hour',
  NewDay: 'time:day',
  NeedsChanged: 'needs:changed',
  MoneyChanged: 'money:changed',
  Toast: 'ui:toast'
} as const
