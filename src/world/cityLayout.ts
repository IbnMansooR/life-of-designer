// Shahar tartibi — yo'llar, mashina yo'laklari (lane) va NPC marshrutlari bir manbadan.
// World vizualni shundan quradi, Traffic/NpcManager harakatni shundan oladi — hammasi mos.
import * as THREE from 'three'

export interface RoadDef {
  dir: 'x' | 'z' // 'x' -> X bo'ylab (gorizontal), z=pos; 'z' -> Z bo'ylab (vertikal), x=pos
  pos: number
  from: number
  to: number
  width: number
}

export const ROADS: RoadDef[] = [
  { dir: 'x', pos: 8, from: -92, to: 92, width: 8 },
  { dir: 'x', pos: -46, from: -92, to: 92, width: 8 },
  { dir: 'x', pos: 60, from: -92, to: 92, width: 8 },
  { dir: 'z', pos: -26, from: -92, to: 92, width: 8 },
  { dir: 'z', pos: 28, from: -92, to: 92, width: 8 },
  { dir: 'z', pos: 72, from: -92, to: 92, width: 8 }
]

/** Downtown — osmono'par binolar zonasi (Part 3: DOWNTOWN district). */
export function isDowntown(x: number, z: number): boolean {
  return x > 34 && z < -30
}

export interface Lane {
  from: THREE.Vector3
  to: THREE.Vector3
}

/** Har yo'l uchun ikki yo'nalishli lane'lar. */
export function buildLanes(): Lane[] {
  const lanes: Lane[] = []
  const off = 2
  for (const r of ROADS) {
    if (r.dir === 'x') {
      lanes.push({
        from: new THREE.Vector3(r.from, 0, r.pos - off),
        to: new THREE.Vector3(r.to, 0, r.pos - off)
      })
      lanes.push({
        from: new THREE.Vector3(r.to, 0, r.pos + off),
        to: new THREE.Vector3(r.from, 0, r.pos + off)
      })
    } else {
      lanes.push({
        from: new THREE.Vector3(r.pos - off, 0, r.from),
        to: new THREE.Vector3(r.pos - off, 0, r.to)
      })
      lanes.push({
        from: new THREE.Vector3(r.pos + off, 0, r.to),
        to: new THREE.Vector3(r.pos + off, 0, r.from)
      })
    }
  }
  return lanes
}

/** Trotuar marshrutlari (NPC'lar shu bo'ylab yuradi) — markaziy blok perimetri. */
export function buildNpcPaths(): THREE.Vector3[][] {
  const loop1 = [
    new THREE.Vector3(-22, 0, 4),
    new THREE.Vector3(24, 0, 4),
    new THREE.Vector3(24, 0, -42),
    new THREE.Vector3(-22, 0, -42)
  ]
  const loop2 = [
    new THREE.Vector3(-20, 0, 32),
    new THREE.Vector3(24, 0, 32),
    new THREE.Vector3(24, 0, 56),
    new THREE.Vector3(-20, 0, 56)
  ]
  return [loop1, loop2]
}

/** (x,z) yo'l ustidami (bino qo'ymaslik uchun). */
export function onRoad(x: number, z: number, margin = 3): boolean {
  for (const r of ROADS) {
    if (r.dir === 'x') {
      if (Math.abs(z - r.pos) < r.width / 2 + margin && x > r.from - margin && x < r.to + margin) {
        return true
      }
    } else {
      if (Math.abs(x - r.pos) < r.width / 2 + margin && z > r.from - margin && z < r.to + margin) {
        return true
      }
    }
  }
  return false
}

/** Kvartira hududimi (bino/marshrut o'tkazmaslik uchun). */
export function nearApartment(x: number, z: number): boolean {
  return x > -11 && x < 11 && z > -18 && z < 13
}

/** Deterministik psevdo-tasodifiy [0,1) — bino o'lchami/balandligi uchun. */
export function frand(x: number, z: number): number {
  const v = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453
  return v - Math.floor(v)
}
