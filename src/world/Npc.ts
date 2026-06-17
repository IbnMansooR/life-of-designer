// NPC tizimi — odamlar trotuar marshruti bo'ylab yuradi (Part 3: NPC life, kundalik harakat).
import * as THREE from 'three'
import { makeLabel } from './label'
import { buildNpcPaths } from './cityLayout'
import { CharacterRig } from './CharacterRig'
import type { Appearance } from '../data/appearance'

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
  rig: CharacterRig
  loop: THREE.Vector3[]
  seg: number
  dist: number
  speed: number
}

const HAIRS = [0x1a1410, 0x2b2118, 0x4a2f1a, 0x6b4423, 0xb5651d, 0x8a8a8a]
const PANTS = [0x2b2f3a, 0x3a3f4a, 0x4a3a2a, 0x1b2030, 0x2a3040]
const FEMALE_NAMES = new Set(['Dilnoza', 'Malika', 'Nigora', 'Kamola', 'Sevara'])
const STRIPES = [
  undefined, '#f0a858', undefined, '#58d4a0', undefined,
  '#c878f0', undefined, '#f06868', undefined, '#78a8f0'
]

function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0')
}

export class NpcManager {
  private npcs: Npc[] = []

  constructor(scene: THREE.Scene, perLoop = 5) {
    const loops = buildNpcPaths()
    let idx = 0
    for (const loop of loops) {
      const total = loopLength(loop)
      for (let i = 0; i < perLoop; i++) {
        const rig = this.buildPerson(idx, NAMES[idx % NAMES.length])
        scene.add(rig.group)
        const { seg, dist } = positionOnLoop(loop, (i / perLoop) * total)
        this.npcs.push({ mesh: rig.group, rig, loop, seg, dist, speed: 1.0 + (idx % 4) * 0.18 })
        idx++
      }
    }
  }

  private buildPerson(idx: number, name: string): CharacterRig {
    const isFemale = FEMALE_NAMES.has(name)
    const appearance: Appearance = {
      skin: hex(SKINS[idx % SKINS.length]),
      hair: hex(HAIRS[idx % HAIRS.length]),
      shirt: hex(SHIRTS[idx % SHIRTS.length]),
      pants: hex(PANTS[idx % PANTS.length]),
      gender: isFemale ? 'female' : 'male',
      stripe: STRIPES[idx % STRIPES.length]
    }
    const rig = new CharacterRig(appearance, false)
    const label = makeLabel(name)
    label.position.y = 2.05
    label.scale.set(1.6, 0.4, 1)
    rig.group.add(label)
    return rig
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
      n.rig.setState('walk')
      n.rig.update(dt)
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
