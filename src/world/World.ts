// 3D dunyo — Three.js sahna.
// Phase 3: yo'l to'ri, ko'p bino, chiroqlar + harakatlanuvchi transport, yuruvchi NPC, kun/tun.
// Part 3: 100% 3D shahar. Part 6: grafika gameplaydan ajratilgan (bu fayl faqat ko'rinish).
import * as THREE from 'three'
import type { GameTime } from '../core/Time'
import { Traffic } from './Traffic'
import { NpcManager } from './Npc'
import { DayNight } from './DayNight'
import { ROADS } from './cityLayout'

/** Oddiy AABB kollayder (XZ tekisligida). */
export interface BoxCollider {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

/** Interaksiya zonasi — o'yinchi yaqinlashganda E bilan ishlatadi. */
export interface Interactable {
  id: string
  label: string
  action: 'sleep' | 'eat' | 'computer'
  x: number
  z: number
  radius: number
}

const BUILDING_PALETTE = [0x5a6678, 0x4a5468, 0x6b5a78, 0x4f6b5a, 0x78705a, 0x556070, 0x6a6a78]

export class World {
  readonly scene = new THREE.Scene()
  readonly renderer: THREE.WebGLRenderer
  readonly colliders: BoxCollider[] = []
  readonly interactables: Interactable[] = []

  private sun!: THREE.DirectionalLight
  private hemi!: THREE.HemisphereLight
  private lampBulbs: THREE.MeshStandardMaterial[] = []
  private traffic!: Traffic
  private npcs!: NpcManager
  private dayNight!: DayNight

  constructor(private readonly container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.container.appendChild(this.renderer.domElement)

    this.scene.background = new THREE.Color(0x87a7d6)
    this.scene.fog = new THREE.Fog(0x87a7d6, 50, 170)

    this.buildLights()
    this.buildGround()
    this.buildApartment()
    this.buildCity()

    this.traffic = new Traffic(this.scene)
    this.npcs = new NpcManager(this.scene)
    this.dayNight = new DayNight(this.scene, this.sun, this.hemi, this.lampBulbs)

    window.addEventListener('resize', this.onResize)
  }

  private buildLights(): void {
    this.hemi = new THREE.HemisphereLight(0xcfe3ff, 0x404048, 0.9)
    this.scene.add(this.hemi)

    const sun = new THREE.DirectionalLight(0xffffff, 1.6)
    sun.position.set(30, 50, 20)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.near = 1
    sun.shadow.camera.far = 200
    const s = 60
    sun.shadow.camera.left = -s
    sun.shadow.camera.right = s
    sun.shadow.camera.top = s
    sun.shadow.camera.bottom = -s
    sun.shadow.bias = -0.0005
    this.sun = sun
    this.scene.add(sun)
  }

  private buildGround(): void {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(220, 220),
      new THREE.MeshStandardMaterial({ color: 0x4a4f57, roughness: 1 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    this.scene.add(ground)
  }

  /** Boshlang'ich kvartira — kichik xona + mebel (Part 8). Interaksiya zonalari shu yerda. */
  private buildApartment(): void {
    const group = new THREE.Group()
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xb9c0cc, roughness: 0.9 })
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x7a5b43, roughness: 0.8 })

    const floor = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 8), floorMat)
    floor.position.set(0, 0.1, -10)
    floor.receiveShadow = true
    group.add(floor)

    const wallH = 3
    const wallT = 0.2
    const cx = 0
    const cz = -10
    this.addWall(group, wallMat, cx, cz - 4, 8, wallH, wallT, true)
    this.addWall(group, wallMat, cx - 4, cz, wallT, wallH, 8, true)
    this.addWall(group, wallMat, cx + 4, cz, wallT, wallH, 8, true)
    this.addWall(group, wallMat, cx - 2.75, cz + 4, 2.5, wallH, wallT, false)
    this.addWall(group, wallMat, cx + 2.75, cz + 4, 2.5, wallH, wallT, false)

    const bed = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.6, 3),
      new THREE.MeshStandardMaterial({ color: 0x3f5c8a })
    )
    bed.position.set(-2.5, 0.5, -12)
    bed.castShadow = true
    group.add(bed)

    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.1, 1),
      new THREE.MeshStandardMaterial({ color: 0x2b2f3a })
    )
    desk.position.set(2.4, 1, -13)
    desk.castShadow = true
    group.add(desk)
    const legMat = new THREE.MeshStandardMaterial({ color: 0x20242e })
    for (const dx of [-1, 1]) {
      for (const dz of [-0.4, 0.4]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1, 0.1), legMat)
        leg.position.set(2.4 + dx, 0.5, -13 + dz)
        group.add(leg)
      }
    }
    const monitor = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.65, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x0a0c10, emissive: 0x1b3a6b, emissiveIntensity: 0.8 })
    )
    monitor.position.set(2.4, 1.45, -13.3)
    group.add(monitor)

    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.9, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x9aa3b2, roughness: 0.7 })
    )
    counter.position.set(2.5, 0.45, -8)
    counter.castShadow = true
    group.add(counter)

    const fridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 1.8, 0.7),
      new THREE.MeshStandardMaterial({ color: 0xdfe6ef, roughness: 0.4, metalness: 0.2 })
    )
    fridge.position.set(3.4, 0.9, -8.3)
    fridge.castShadow = true
    group.add(fridge)

    this.scene.add(group)

    this.interactables.push(
      { id: 'bed', label: 'Uxlash', action: 'sleep', x: -2.5, z: -12, radius: 1.9 },
      { id: 'desk', label: 'Kompyuter', action: 'computer', x: 2.4, z: -13, radius: 1.9 },
      { id: 'kitchen', label: 'Ovqatlanish', action: 'eat', x: 2.5, z: -8, radius: 1.8 }
    )
  }

  /** Shahar — yo'llar, trotuarlar, binolar, chiroqlar. */
  private buildCity(): void {
    for (const r of ROADS) this.addRoad(r.dir, r.pos, r.from, r.to, r.width)
    this.addBuildings()
    this.addLamps()
  }

  private addRoad(dir: 'x' | 'z', pos: number, from: number, to: number, width: number): void {
    const length = to - from
    const center = (from + to) / 2
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x23262e, roughness: 1 })
    const lineMat = new THREE.MeshStandardMaterial({ color: 0xd9c64a, roughness: 1 })
    const walkMat = new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 1 })

    if (dir === 'x') {
      const road = new THREE.Mesh(new THREE.BoxGeometry(length, 0.04, width), roadMat)
      road.position.set(center, 0.02, pos)
      road.receiveShadow = true
      this.scene.add(road)
      const line = new THREE.Mesh(new THREE.BoxGeometry(length, 0.05, 0.18), lineMat)
      line.position.set(center, 0.05, pos)
      this.scene.add(line)
      for (const side of [-1, 1]) {
        const walk = new THREE.Mesh(new THREE.BoxGeometry(length, 0.12, 2), walkMat)
        walk.position.set(center, 0.06, pos + side * (width / 2 + 1))
        walk.receiveShadow = true
        this.scene.add(walk)
      }
    } else {
      const road = new THREE.Mesh(new THREE.BoxGeometry(width, 0.04, length), roadMat)
      road.position.set(pos, 0.02, center)
      road.receiveShadow = true
      this.scene.add(road)
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, length), lineMat)
      line.position.set(pos, 0.05, center)
      this.scene.add(line)
      for (const side of [-1, 1]) {
        const walk = new THREE.Mesh(new THREE.BoxGeometry(2, 0.12, length), walkMat)
        walk.position.set(pos + side * (width / 2 + 1), 0.06, center)
        walk.receiveShadow = true
        this.scene.add(walk)
      }
    }
  }

  private addBuildings(): void {
    for (let gx = -60; gx <= 60; gx += 12) {
      for (let gz = -60; gz <= 60; gz += 12) {
        if (onRoadBuffer(gx, gz) || nearApartmentZone(gx, gz)) continue
        const r1 = frand2(gx, gz)
        const r2 = frand2(gx + 7.1, gz - 3.3)
        const w = 6 + r1 * 3.5
        const d = 6 + r2 * 3.5
        const h = 6 + frand2(gx * 1.3, gz * 0.7) * 26
        const color = BUILDING_PALETTE[Math.floor(r1 * BUILDING_PALETTE.length)]
        const b = new THREE.Mesh(
          new THREE.BoxGeometry(w, h, d),
          new THREE.MeshStandardMaterial({ color, roughness: 0.85 })
        )
        b.position.set(gx, h / 2, gz)
        b.castShadow = true
        b.receiveShadow = true
        this.scene.add(b)
        this.colliders.push({ minX: gx - w / 2, maxX: gx + w / 2, minZ: gz - d / 2, maxZ: gz + d / 2 })
      }
    }
  }

  private addLamps(): void {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x2a2f38 })
    for (const z of [8, -46]) {
      for (let x = -60; x <= 60; x += 16) {
        for (const side of [-1, 1]) {
          const lz = z + side * 5.2
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 4, 8), poleMat)
          pole.position.set(x, 2, lz)
          pole.castShadow = true
          this.scene.add(pole)
          const bulbMat = new THREE.MeshStandardMaterial({
            color: 0xfff2c0,
            emissive: 0xffd87a,
            emissiveIntensity: 0
          })
          const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), bulbMat)
          bulb.position.set(x, 4, lz)
          this.scene.add(bulb)
          this.lampBulbs.push(bulbMat)
        }
      }
    }
  }

  private addWall(
    group: THREE.Group,
    mat: THREE.Material,
    x: number,
    z: number,
    w: number,
    h: number,
    d: number,
    asCollider: boolean
  ): void {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
    wall.position.set(x, h / 2, z)
    wall.castShadow = true
    wall.receiveShadow = true
    group.add(wall)
    if (asCollider) {
      this.colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 })
    }
  }

  /** Har kadrda (pauzada emas) — transport, NPC va kun/tun yangilanadi. */
  update(dt: number, time: GameTime): void {
    this.traffic.update(dt)
    this.npcs.update(dt)
    this.dayNight.update(time)
  }

  render(camera: THREE.Camera): void {
    this.renderer.render(this.scene, camera)
  }

  private onResize = (): void => {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  dispose(): void {
    window.removeEventListener('resize', this.onResize)
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}

// Bino joylashtirish predikatlari (cityLayout bilan mos, lekin shu yerda ham kerakli marja bilan)
function onRoadBuffer(x: number, z: number): boolean {
  for (const r of ROADS) {
    if (r.dir === 'x') {
      if (Math.abs(z - r.pos) < r.width / 2 + 4 && x > r.from - 4 && x < r.to + 4) return true
    } else {
      if (Math.abs(x - r.pos) < r.width / 2 + 4 && z > r.from - 4 && z < r.to + 4) return true
    }
  }
  return false
}

function nearApartmentZone(x: number, z: number): boolean {
  return x > -11 && x < 11 && z > -18 && z < 13
}

function frand2(x: number, z: number): number {
  const v = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453
  return v - Math.floor(v)
}
