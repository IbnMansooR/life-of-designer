// Game — in-game orkestratori.
// Dunyo, o'yinchi, HUD, telefon, vaqt va save tizimini bir-biriga bog'laydi.
import { World } from '../world/World'
import { Player } from '../world/Player'
import { HUD } from '../ui/HUD'
import { Phone } from '../ui/Phone'
import { GameLoop } from '../core/GameLoop'
import { GameState, type SerializedGame } from './GameState'
import { saveGame, loadGame } from '../core/Save'
import { bus, GameEvents } from '../core/EventBus'
import { el, showToast } from '../ui/dom'

export interface GameCallbacks {
  onExitToMenu: () => void
}

const SAVE_SLOT = 'slot1'

export class Game {
  private world: World
  private player: Player
  private hud: HUD
  private phone: Phone
  private loop: GameLoop
  private pauseEl: HTMLElement
  private paused = false
  private disposed = false
  private unsub: Array<() => void> = []
  private keyHandler: (e: KeyboardEvent) => void

  constructor(
    private root: HTMLElement,
    private gs: GameState,
    private cb: GameCallbacks
  ) {
    this.world = new World(root)
    this.player = new Player(this.world.renderer.domElement)
    this.player.position.set(gs.position.x, gs.position.y, gs.position.z)
    this.player.yaw = gs.rotationY
    this.world.scene.add(this.player.mesh)

    this.hud = new HUD(root)
    this.phone = new Phone(root)
    this.pauseEl = this.buildPause()
    root.appendChild(this.pauseEl)

    this.loop = new GameLoop((dt) => this.update(dt))

    this.keyHandler = (e) => this.onKey(e)
    window.addEventListener('keydown', this.keyHandler)
    window.addEventListener('resize', this.onResize)

    this.unsub.push(bus.on(GameEvents.Toast, (m) => showToast(m as string)))
    this.unsub.push(bus.on(GameEvents.NewDay, () => this.autoSave()))
  }

  start(): void {
    this.hud.update(this.gs)
    this.loop.start()
    showToast(`Xush kelibsan, ${this.gs.name}!`)
  }

  private update(dt: number): void {
    if (!this.paused) {
      const before = this.gs.time.totalMinutes
      this.gs.time.update(dt)
      this.gs.updateNeeds(this.gs.time.totalMinutes - before)
      this.player.update(dt, this.world.colliders)
      this.gs.position = {
        x: this.player.position.x,
        y: this.player.position.y,
        z: this.player.position.z
      }
      this.gs.rotationY = this.player.yaw
    }
    this.world.render(this.player.camera)
    this.hud.update(this.gs)
  }

  private onKey(e: KeyboardEvent): void {
    switch (e.code) {
      case 'KeyC':
        this.player.toggleView()
        break
      case 'KeyP':
        this.togglePhone()
        break
      case 'Escape':
        this.togglePause()
        break
      case 'F5':
        e.preventDefault()
        void this.saveNow()
        break
      case 'F9':
        e.preventDefault()
        void this.loadNow()
        break
    }
  }

  private togglePhone(): void {
    if (this.paused) return
    const open = this.phone.toggle()
    this.setInteractive(!open)
  }

  private togglePause(): void {
    this.paused = !this.paused
    this.pauseEl.classList.toggle('hidden', !this.paused)
    if (this.paused) {
      this.phone.close()
      this.setInteractive(false)
    } else {
      this.setInteractive(true)
    }
  }

  private setInteractive(on: boolean): void {
    this.player.enabled = on
    if (!on) this.player.releasePointer()
  }

  private async saveNow(): Promise<void> {
    const ok = await saveGame(SAVE_SLOT, this.gs.serialize())
    showToast(ok ? 'Saqlandi ✓' : 'Saqlashda xato!')
  }

  private async autoSave(): Promise<void> {
    await saveGame(SAVE_SLOT, this.gs.serialize())
    showToast('Avto-saqlash ✓')
  }

  private async loadNow(): Promise<void> {
    const data = await loadGame<SerializedGame>(SAVE_SLOT)
    if (!data) {
      showToast('Saqlangan o‘yin yo‘q')
      return
    }
    this.gs = GameState.fromSerialized(data)
    this.player.position.set(this.gs.position.x, this.gs.position.y, this.gs.position.z)
    this.player.yaw = this.gs.rotationY
    showToast('Yuklandi ✓')
  }

  private buildPause(): HTMLElement {
    return el('div', { class: 'screen pause hidden' }, [
      el('h2', { text: 'Pauza' }),
      el('button', {
        class: 'btn-cta',
        text: 'Davom etish',
        on: { click: () => this.togglePause() }
      }),
      el('button', { class: 'btn-ghost', text: 'Saqlash', on: { click: () => void this.saveNow() } }),
      el('button', {
        class: 'btn-ghost',
        text: 'Bosh menyu',
        on: { click: () => this.cb.onExitToMenu() }
      })
    ])
  }

  private onResize = (): void => this.player.onResize()

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.loop.stop()
    window.removeEventListener('keydown', this.keyHandler)
    window.removeEventListener('resize', this.onResize)
    this.unsub.forEach((u) => u())
    this.player.dispose()
    this.hud.dispose()
    this.phone.dispose()
    this.pauseEl.remove()
    this.world.dispose()
  }
}
