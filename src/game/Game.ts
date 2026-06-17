// Game — in-game orkestratori.
// Dunyo, o'yinchi, HUD, telefon, inventar, interaksiya, vaqt va save tizimini bog'laydi.
import { World, type Interactable } from '../world/World'
import { Player } from '../world/Player'
import { HUD } from '../ui/HUD'
import { Phone } from '../ui/Phone'
import { Inventory } from '../ui/Inventory'
import { Computer } from '../ui/Computer'
import { EventModal } from '../ui/EventModal'
import { DesignStudio } from '../ui/DesignStudio'
import { InteractPrompt } from '../ui/InteractPrompt'
import { randomEvent } from '../data/events'
import { makeBrief } from '../data/designTasks'
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
  private inventory: Inventory
  private computer: Computer
  private eventModal: EventModal
  private designStudio: DesignStudio
  private workingProjectId = ''
  private interactPrompt: InteractPrompt
  private loop: GameLoop
  private pauseEl: HTMLElement
  private paused = false
  private disposed = false
  private current: Interactable | null = null
  private unsub: Array<() => void> = []
  private keyHandler: (e: KeyboardEvent) => void

  constructor(
    private root: HTMLElement,
    private gs: GameState,
    private cb: GameCallbacks
  ) {
    this.world = new World(root)
    this.player = new Player(this.world.renderer.domElement, gs.appearance)
    this.player.position.set(gs.position.x, gs.position.y, gs.position.z)
    this.player.yaw = gs.rotationY
    this.world.scene.add(this.player.mesh)

    this.hud = new HUD(root)
    this.phone = new Phone(root)
    this.inventory = new Inventory(root)
    this.computer = new Computer(root, {
      onClose: () => this.setInteractive(true),
      onWork: (id, type) => this.openDesignStudio(id, type)
    })
    this.eventModal = new EventModal(root, {
      onChoice: (effect, result) => {
        this.gs.applyEventChoice(effect)
        showToast(result)
        this.setInteractive(true)
      }
    })
    this.designStudio = new DesignStudio(root, {
      onSubmit: (quality) => {
        this.gs.submitDesignWork(this.workingProjectId, quality)
        this.computer.refresh()
      }
    })
    this.interactPrompt = new InteractPrompt(root)
    this.pauseEl = this.buildPause()
    root.appendChild(this.pauseEl)

    this.loop = new GameLoop((dt) => this.update(dt))

    this.keyHandler = (e) => this.onKey(e)
    window.addEventListener('keydown', this.keyHandler)
    window.addEventListener('resize', this.onResize)

    this.unsub.push(bus.on(GameEvents.Toast, (m) => showToast(m as string)))
    this.unsub.push(bus.on(GameEvents.NewDay, (day) => this.onNewDay(day as number)))
  }

  private onNewDay(day: number): void {
    const r = this.gs.applyDailyFamily(day)
    const biz = this.gs.processAgencyDay()
    this.gs.processRelationshipDay()
    this.gs.checkAchievements()
    void this.autoSave()
    if (r.neglected) {
      showToast('📞 Onang sog‘indi — telefon qilsang yaxshi bo‘lardi')
    }
    if (biz) {
      const sign = biz.net >= 0 ? '+' : ''
      showToast(`🏢 Agentlik (kunlik): ${sign}${money(biz.net)} so'm`)
    }
    this.maybeTriggerEvent(day)
  }

  /** Yangi kunda — ehtimollik bilan hayot voqeasi (Part 8). */
  private maybeTriggerEvent(day: number): void {
    if (day < 2) return
    if (
      this.paused ||
      this.phone.isOpen ||
      this.inventory.isOpen ||
      this.computer.isOpen ||
      this.eventModal.isOpen
    ) {
      return
    }
    if (Math.random() < 0.55) {
      this.setInteractive(false)
      this.eventModal.open(randomEvent())
    }
  }

  start(): void {
    this.hud.update(this.gs)
    this.phone.update(this.gs)
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

      if (this.player.enabled) this.updateInteraction()
      else this.interactPrompt.hide()

      this.world.update(dt, this.gs.time)
    }
    this.world.render(this.player.camera)
    this.hud.update(this.gs)
    this.phone.update(this.gs)
  }

  /** Eng yaqin interaksiya zonasini topadi va promptni ko'rsatadi. */
  private updateInteraction(): void {
    let nearest: Interactable | null = null
    let best = Infinity
    const px = this.player.position.x
    const pz = this.player.position.z
    for (const it of this.world.interactables) {
      const d = Math.hypot(px - it.x, pz - it.z)
      if (d <= it.radius && d < best) {
        best = d
        nearest = it
      }
    }
    this.current = nearest
    if (nearest) this.interactPrompt.show(nearest.label)
    else this.interactPrompt.hide()
  }

  private onKey(e: KeyboardEvent): void {
    switch (e.code) {
      case 'KeyC':
        this.player.toggleView()
        break
      case 'KeyP':
        this.togglePhone()
        break
      case 'KeyI':
        this.toggleInventory()
        break
      case 'KeyE':
        this.interact()
        break
      case 'Escape':
        if (this.eventModal.isOpen) break
        if (this.designStudio.isOpen) this.designStudio.close()
        else if (this.computer.isOpen) this.computer.close()
        else this.togglePause()
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

  private interact(): void {
    if (this.paused || !this.player.enabled || !this.current) return
    switch (this.current.action) {
      case 'sleep':
        this.doSleep()
        break
      case 'computer':
        this.openComputer()
        break
      case 'eat':
        this.doEat()
        break
    }
  }

  private openComputer(): void {
    if (this.paused) return
    this.phone.close()
    this.inventory.close()
    this.setInteractive(false)
    this.computer.open(this.gs)
  }

  /** "Ishlash" -> dizayn studiyasi (TZ bilan). */
  private openDesignStudio(id: string, type: string): void {
    if (this.gs.needs.energy < 12) {
      showToast('Juda charchagansan — avval dam ol')
      return
    }
    this.workingProjectId = id
    this.designStudio.open(makeBrief(type))
  }

  private doSleep(): void {
    this.player.playAction('sleep', 2.5)
    const cur = this.gs.time.totalMinutes % 1440
    let delta = 7 * 60 - cur
    if (delta <= 0) delta += 1440
    this.gs.time.advance(delta)
    const n = this.gs.needs
    n.energy = 100
    n.stress -= 25
    n.mood += 8
    n.hunger += 20
    this.gs.clampNeeds()
    showToast('😴 Yaxshi uxlading — energiya to‘ldi')
  }

  private doEat(): void {
    this.player.playAction('eat', 2)
    this.gs.time.advance(20)
    const n = this.gs.needs
    n.hunger -= 45
    n.mood += 5
    n.energy += 5
    this.gs.clampNeeds()
    showToast('🍽️ Qorin to‘ydi')
  }

  private togglePhone(): void {
    if (this.paused || this.computer.isOpen) return
    this.inventory.close()
    const open = this.phone.toggle()
    this.setInteractive(!open)
  }

  private toggleInventory(): void {
    if (this.paused || this.computer.isOpen) return
    this.phone.close()
    const open = this.inventory.toggle(this.gs.inventory)
    this.setInteractive(!open)
  }

  private togglePause(): void {
    this.paused = !this.paused
    this.pauseEl.classList.toggle('hidden', !this.paused)
    if (this.paused) {
      this.phone.close()
      this.inventory.close()
      this.computer.close()
      this.interactPrompt.hide()
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
    this.inventory.dispose()
    this.computer.dispose()
    this.eventModal.dispose()
    this.designStudio.dispose()
    this.interactPrompt.dispose()
    this.pauseEl.remove()
    this.world.dispose()
  }
}

function money(v: number): string {
  return Math.round(v)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
