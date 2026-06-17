// Shahar generatori yordamchilari — tumanlar, deraza teksturasi, daraxtlar.
import * as THREE from 'three'
import { isDowntown } from './cityLayout'

export type District = 'downtown' | 'business' | 'residential' | 'park'

// Deraza teksturasi — kulrang devor + qator derazalar (material rangi tushadi).
function makeWindowTexture(rx: number, ry: number): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 64
  const x = c.getContext('2d')!
  x.fillStyle = '#c2c8d2'
  x.fillRect(0, 0, 64, 64)
  x.fillStyle = '#2c3340'
  const n = 3
  const pad = 8
  const gap = 6
  const ws = (64 - pad * 2 - gap * (n - 1)) / n
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      x.fillRect(pad + i * (ws + gap), pad + j * (ws + gap), ws, ws)
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = THREE.RepeatWrapping
  t.wrapT = THREE.RepeatWrapping
  t.repeat.set(rx, ry)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

// Bino balandligiga qarab uchta umumiy tekstura (deraza zichligi).
export const WIN_TEX = {
  short: makeWindowTexture(1, 1),
  mid: makeWindowTexture(2, 3),
  tall: makeWindowTexture(2, 6)
}

export function districtAt(x: number, z: number): District {
  if (isDowntown(x, z)) return 'downtown'
  if ((x < -34 && z > 34) || (x > 44 && z > 44)) return 'park'
  if (Math.abs(x) > 54 || Math.abs(z) > 54) return 'residential'
  return 'business'
}

// Oddiy daraxt — tana + bargli konus.
export function makeTree(): THREE.Group {
  const g = new THREE.Group()
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.24, 1.4, 6),
    new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: 1 })
  )
  trunk.position.y = 0.7
  trunk.castShadow = true
  g.add(trunk)
  const foliage = new THREE.Mesh(
    new THREE.ConeGeometry(1.1, 2.3, 8),
    new THREE.MeshStandardMaterial({ color: 0x3f7a3f, roughness: 1 })
  )
  foliage.position.y = 2.45
  foliage.castShadow = true
  g.add(foliage)
  return g
}
