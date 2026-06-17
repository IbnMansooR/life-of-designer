// O'yinchi kontrolleri.
// WASD bilan yurish, sichqoncha bilan qarash (pointer lock), 1-shaxs / 3-shaxs kamera,
// binolar va devorlarga oddiy kolliziya.
import * as THREE from 'three'
import type { BoxCollider } from './World'
import type { Appearance } from '../data/appearance'
import { CharacterRig, type AnimState } from './CharacterRig'

export type ViewMode = 'first' | 'third'

const EYE_HEIGHT = 1.6
const PLAYER_RADIUS = 0.4
const WALK_SPEED = 3.6
const RUN_SPEED = 6.6

export class Player {
  readonly camera: THREE.PerspectiveCamera
  readonly mesh: THREE.Group
  position = new THREE.Vector3(0, 0, 2)
  yaw = 0
  pitch = 0
  view: ViewMode = 'third'

  /** Qarash/harakat yoqilganmi (telefon yoki pauza ochilganda o'chiriladi). */
  enabled = true
  sensitivity = 1.0
  private locked = false

  private rig: CharacterRig
  private actionTimer = 0
  private actionState: AnimState = 'idle'

  private keys = new Set<string>()
  private readonly canvas: HTMLCanvasElement

  // Saqlangan handler'lar — dispose'da olib tashlash uchun
  private onKeyDown = (e: KeyboardEvent): void => {
    this.keys.add(e.code)
  }
  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.code)
  }
  private onCanvasClick = (): void => {
    if (this.enabled && !this.locked) this.canvas.requestPointerLock()
  }
  private onPointerLockChange = (): void => {
    this.locked = document.pointerLockElement === this.canvas
  }
  private onMouseMove = (e: MouseEvent): void => {
    if (!this.locked || !this.enabled) return
    const s = 0.0022 * this.sensitivity
    this.yaw -= e.movementX * s
    this.pitch -= e.movementY * s
    this.pitch = Math.max(-1.2, Math.min(1.2, this.pitch))
  }

  constructor(canvas: HTMLCanvasElement, appearance: Appearance) {
    this.canvas = canvas
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500)
    this.rig = new CharacterRig(appearance, true)
    this.mesh = this.rig.group
    this.bindInput()
  }

  /** Qisqa muddatli harakat animatsiyasi (yeyish/uxlash) — shu vaqt davomida yurmaydi. */
  playAction(state: AnimState, duration: number): void {
    this.actionState = state
    this.actionTimer = duration
  }

  private bindInput(): void {
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    this.canvas.addEventListener('click', this.onCanvasClick)
    document.addEventListener('pointerlockchange', this.onPointerLockChange)
    document.addEventListener('mousemove', this.onMouseMove)
  }

  dispose(): void {
    this.releasePointer()
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    this.canvas.removeEventListener('click', this.onCanvasClick)
    document.removeEventListener('pointerlockchange', this.onPointerLockChange)
    document.removeEventListener('mousemove', this.onMouseMove)
  }

  toggleView(): void {
    this.view = this.view === 'first' ? 'third' : 'first'
  }

  releasePointer(): void {
    if (this.locked) document.exitPointerLock()
  }

  /** Har kadrda. dt — real sekund. */
  update(dt: number, colliders: BoxCollider[]): void {
    if (this.actionTimer > 0) {
      this.actionTimer -= dt
      this.rig.setState(this.actionState)
    } else {
      if (this.enabled) this.move(dt, colliders)
      const moving = this.enabled && this.isMovingInput()
      this.rig.setState(moving ? (this.keys.has('ShiftLeft') ? 'run' : 'walk') : 'idle')
    }
    this.rig.update(dt)
    this.updateCamera()
    this.mesh.position.copy(this.position)
    this.mesh.rotation.y = this.yaw
    this.mesh.visible = this.view === 'third'
  }

  private isMovingInput(): boolean {
    const k = this.keys
    return (
      k.has('KeyW') ||
      k.has('KeyS') ||
      k.has('KeyA') ||
      k.has('KeyD') ||
      k.has('ArrowUp') ||
      k.has('ArrowDown') ||
      k.has('ArrowLeft') ||
      k.has('ArrowRight')
    )
  }

  private move(dt: number, colliders: BoxCollider[]): void {
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw))
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw))

    const dir = new THREE.Vector3()
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) dir.add(forward)
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) dir.sub(forward)
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) dir.add(right)
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) dir.sub(right)

    if (dir.lengthSq() === 0) return
    dir.normalize()

    const speed = this.keys.has('ShiftLeft') ? RUN_SPEED : WALK_SPEED
    const dx = dir.x * speed * dt
    const dz = dir.z * speed * dt

    // O'qlar bo'yicha alohida tekshirib siljitamiz (oddiy kolliziya)
    if (!this.collides(this.position.x + dx, this.position.z, colliders)) {
      this.position.x += dx
    }
    if (!this.collides(this.position.x, this.position.z + dz, colliders)) {
      this.position.z += dz
    }
  }

  private collides(x: number, z: number, colliders: BoxCollider[]): boolean {
    for (const c of colliders) {
      if (
        x + PLAYER_RADIUS > c.minX &&
        x - PLAYER_RADIUS < c.maxX &&
        z + PLAYER_RADIUS > c.minZ &&
        z - PLAYER_RADIUS < c.maxZ
      ) {
        return true
      }
    }
    return false
  }

  private updateCamera(): void {
    if (this.view === 'first') {
      this.camera.position.set(this.position.x, this.position.y + EYE_HEIGHT, this.position.z)
      const dir = new THREE.Vector3(
        -Math.sin(this.yaw) * Math.cos(this.pitch),
        Math.sin(this.pitch),
        -Math.cos(this.yaw) * Math.cos(this.pitch)
      )
      this.camera.lookAt(this.camera.position.clone().add(dir))
    } else {
      const dist = 4.8
      const height = 2.4
      const camX = this.position.x + Math.sin(this.yaw) * dist
      const camZ = this.position.z + Math.cos(this.yaw) * dist
      this.camera.position.set(camX, this.position.y + height - this.pitch * 1.5, camZ)
      this.camera.lookAt(this.position.x, this.position.y + 1.5, this.position.z)
    }
  }

  onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
  }
}
