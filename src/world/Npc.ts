// NPC tizimi — odamlar trotuar marshruti bo'ylab yuradi (Part 3: NPC life, kundalik harakat).
import * as THREE from 'three'
import { makeLabel } from './label'
import { buildNpcPaths } from './cityLayout'

const NAMES = [
  'Aziz',
  'Dilnoza',
  'Sardor',
  'Malika',
  'Bekzod',
  'Nigora',
  'Jasur',
  'Kamola',
  'Rustam',
  'Sevara'
]
const SHIRTS = [0x4f7bd9, 0xd94f4f, 0x4fd98a, 0xe8c14a, 0x8a5bff, 0xe8e8ee]
const SKINS = [0xf1c9a5, 0xe8b48c, 0xc98a5e, 0xa86b3c]

interface Npc {
  mesh: THREE.Group
  loop: THREE.Vector3[]
  seg: number
  dist: number
  speed: number
}

export class NpcManager {
  private npcs: Npc[] = []

  constructor(scene: THREE.Scene, perLoop = 7) {
    const loops = buildNpcPaths()
    let idx = 0
    for (const loop of loops) {
      const total = loopLength(loop)
      for (let i = 0; i < perLoop; i++) {
        const mesh = this.buildPerson(
          SHIRTS[idx % SHIRTS.length],
          SKINS[idx % SKINS.length],
          NAMES[idx % NAMES.length]
        )
        scene.add(mesh)
        const { seg, dist } = positionOnLoop(loop, (i / perLoop) * total)
        this.npcs.push({ mesh, loop, seg, dist, speed: 1.0 + (idx % 4) * 0.18 })
        idx++
      }
    }
  }

  private buildPerson(shirt: number, skin: number, name: string): THREE.Group {
    const g = new THREE.Group()
    const torso = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.32, 0.7, 5, 12),
      new THREE.MeshStandardMaterial({ color: shirt })
    )
    torso.position.y = 1.0
    torso.castShadow = true
    g.add(torso)
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 14, 14),
      new THREE.MeshStandardMaterial({ color: skin })
    )
    head.position.y = 1.62
    head.castShadow = true
    g.add(head)
    const label = makeLabel(name)
    label.position.y = 2.05
    label.scale.set(1.6, 0.4, 1)
    g.add(label)
    return g
  }

  update(dt: number): void {
    for (const n of this.npcs) {
      n.dist += n.speed * dt
      let from = n.loop[n.seg]
      let to = n.loop[(n.seg + 1) % n.loop.length]
      let segLen = from.distanceTo(to) || 1
      // Bir kadrda bir nechta segmentdan o'tib ketishi mumkin
      while (n.dist >= segLen) {
        n.dist -= segLen
        n.seg = (n.seg + 1) % n.loop.length
        from = n.loop[n.seg]
        to = n.loop[(n.seg + 1) % n.loop.length]
        segLen = from.distanceTo(to) || 1
      }
      const f = n.dist / segLen
      n.mesh.position.set(from.x + (to.x - from.x) * f, 0, from.z + (to.z - from.z) * f)
      n.mesh.rotation.y = Math.atan2(to.x - from.x, to.z - from.z)
    }
  }
}

function loopLength(loop: THREE.Vector3[]): number {
  let total = 0
  for (let i = 0; i < loop.length; i++) {
    total += loop[i].distanceTo(loop[(i + 1) % loop.length])
  }
  return total
}

function positionOnLoop(loop: THREE.Vector3[], d: number): { seg: number; dist: number } {
  let seg = 0
  let remaining = d
  for (let i = 0; i < loop.length; i++) {
    const len = loop[i].distanceTo(loop[(i + 1) % loop.length])
    if (remaining <= len) {
      seg = i
      break
    }
    remaining -= len
  }
  return { seg, dist: remaining }
}
