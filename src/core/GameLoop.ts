// O'yin sikli (game loop) — requestAnimationFrame asosida.
// Har kadrda update(dt) chaqiradi. dt — real sekundlarda (maksimum 0.1s bilan cheklangan,
// sakrab ketishlardan saqlanish uchun).

export type UpdateFn = (dt: number) => void

export class GameLoop {
  private running = false
  private last = 0
  private rafId = 0

  constructor(private readonly update: UpdateFn) {}

  start(): void {
    if (this.running) return
    this.running = true
    this.last = performance.now()
    this.rafId = requestAnimationFrame(this.frame)
  }

  stop(): void {
    this.running = false
    cancelAnimationFrame(this.rafId)
  }

  get isRunning(): boolean {
    return this.running
  }

  private frame = (now: number): void => {
    if (!this.running) return
    const dt = Math.min((now - this.last) / 1000, 0.1)
    this.last = now
    this.update(dt)
    this.rafId = requestAnimationFrame(this.frame)
  }
}
