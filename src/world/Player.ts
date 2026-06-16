// O'yinchi kontrolleri.
// WASD bilan yurish, sichqoncha bilan qarash (pointer lock), 1-shaxs / 3-shaxs kamera,
// binolar va devorlarga oddiy kolliziya.
import * as THREE from 'three'
import type { BoxCollider } from './World'
import type { Appearance } from '../data/appearance'

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
  private locked = false

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
    this.yaw -= e.movementX * 0.0022
    this.pitch -= e.movementY * 0.0022
    this.pitch = Math.max(-1.2, Math.min(1.2, this.pitch))
  }

  constructor(canvas: HTMLCanvasElement, appearance: Appearance) {
    this.canvas = canvas
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500)
    this.mesh = this.buildBody(appearance)
    this.bindInput()
  }

  /** 3-shaxsdagi ko'rinadigan tanani tashqi ko'rinishdan quradi. */
  private buildBody(a: Appearance): THREE.Group {
    const g = new THREE.Group()

    const legs = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.28, 0.5, 4, 12),
      new THREE.MeshStandardMaterial({ color: a.pants })
    )
    legs.position.y = 0.5
    legs.castShadow = true
    g.add(legs)

    const torso = new THREE.Mesh(
      new THREE.CapsuleGeometry(PLAYER_RADIUS, 0.6, 6, 14),
      new THREE.MeshStandardMaterial({ color: a.shirt })
    )
    torso.position.y = 1.15
    torso.castShadow = true
    g.add(torso)

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.27, 18, 18),
      new THREE.MeshStandardMaterial({ color: a.skin })
    )
    head.position.y = 1.78
    head.castShadow = true
    g.add(head)

    // Soch — boshning ustki qismini qoplaydigan yarim shar
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.29, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.62),
      new THREE.MeshStandardMaterial({ color: a.hair })
    )
    hair.position.y = 1.8
    hair.castShadow = true
    g.add(hair)

    return g
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
    if (this.enabled) this.move(dt, colliders)
    this.updateCamera()
    this.mesh.position.copy(this.position)
    this.mesh.rotation.y = this.yaw
    this.mesh.visible = this.view === 'third'
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
