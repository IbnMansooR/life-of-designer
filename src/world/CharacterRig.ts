// Character rig — primitivlardan to'liq qo'l-oyoqli odam + protsedural animatsiya.
// Tashqi model/skelet kerak emas: bo'g'imlar (pivot Group) aylantiriladi.
// Holatlar: idle, walk, run, sit, eat, drink, sleep.
import * as THREE from 'three'
import type { Appearance } from '../data/appearance'

export type AnimState = 'idle' | 'walk' | 'run' | 'sit' | 'eat' | 'drink' | 'sleep'

function mat(color: string): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85 })
}

function pivot(x: number, y: number, z: number): THREE.Group {
  const g = new THREE.Group()
  g.position.set(x, y, z)
  return g
}

export class CharacterRig {
  readonly group = new THREE.Group()
  private body = new THREE.Group()

  private shL!: THREE.Group
  private shR!: THREE.Group
  private elL!: THREE.Group
  private elR!: THREE.Group
  private hipL!: THREE.Group
  private hipR!: THREE.Group
  private kneeL!: THREE.Group
  private kneeR!: THREE.Group

  private state: AnimState = 'idle'
  private phase = 0

  constructor(a: Appearance, cast = true) {
    this.group.add(this.body)

    const add = (parent: THREE.Object3D, m: THREE.Mesh) => {
      m.castShadow = cast
      m.receiveShadow = cast
      parent.add(m)
    }

    // Tana (ko'ylak)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.62, 0.28), mat(a.shirt))
    torso.position.y = 1.2
    add(this.body, torso)

    // Kiyim naqshi (stripe) — ixtiyoriy rang chizig'i
    if (a.stripe) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.54, 0.30), mat(a.stripe))
      stripe.position.set(-0.13, 1.2, 0)
      add(this.body, stripe)
    }

    // Kamar (belt)
    const beltHex = '#' + new THREE.Color(a.pants).multiplyScalar(0.62).getHexString()
    const beltMesh = new THREE.Mesh(new THREE.BoxGeometry(0.51, 0.065, 0.29), mat(beltHex))
    beltMesh.position.y = 0.905
    add(this.body, beltMesh)

    // Bosh + soch
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 16), mat(a.skin))
    head.position.y = 1.64
    add(this.body, head)
    const hairR = a.gender === 'female' ? 0.195 : 0.185
    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(hairR, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.62),
      mat(a.hair)
    )
    hair.position.y = 1.66
    add(this.body, hair)
    // Qizlar uchun uzun soch (orqada osilib tushadi)
    if (a.gender === 'female') {
      const pony = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.038, 0.46, 8),
        mat(a.hair)
      )
      pony.position.set(0, 1.415, -0.13)
      add(this.body, pony)
    }

    // Qo'llar (yelka -> tirsak -> bilak)
    this.shL = pivot(0.31, 1.45, 0)
    this.shR = pivot(-0.31, 1.45, 0)
    this.body.add(this.shL, this.shR)
    for (const [sh, el] of [
      [this.shL, (this.elL = pivot(0, -0.3, 0))],
      [this.shR, (this.elR = pivot(0, -0.3, 0))]
    ] as [THREE.Group, THREE.Group][]) {
      const upper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.3, 0.12), mat(a.shirt))
      upper.position.y = -0.15
      add(sh, upper)
      sh.add(el)
      const fore = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.28, 0.1), mat(a.skin))
      fore.position.y = -0.14
      add(el, fore)
    }

    // Oyoqlar (son -> tizza -> boldir + oyoq panjasi)
    this.hipL = pivot(0.13, 0.92, 0)
    this.hipR = pivot(-0.13, 0.92, 0)
    this.body.add(this.hipL, this.hipR)
    for (const [hip, knee] of [
      [this.hipL, (this.kneeL = pivot(0, -0.46, 0))],
      [this.hipR, (this.kneeR = pivot(0, -0.46, 0))]
    ] as [THREE.Group, THREE.Group][]) {
      const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.46, 0.16), mat(a.pants))
      thigh.position.y = -0.23
      add(hip, thigh)
      hip.add(knee)
      const shin = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.44, 0.14), mat(a.pants))
      shin.position.y = -0.22
      add(knee, shin)
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.27), mat('#20242e'))
      foot.position.set(0, -0.44, 0.07)
      add(knee, foot)
    }
  }

  setState(s: AnimState): void {
    this.state = s
  }

  update(dt: number): void {
    // Har kadrda bo'g'imlarni nolga qaytarib, holatga qarab qo'yamiz
    this.body.position.set(0, 0, 0)
    this.body.rotation.set(0, 0, 0)
    this.shL.rotation.set(0, 0, 0.08)
    this.shR.rotation.set(0, 0, -0.08)
    this.elL.rotation.set(0, 0, 0)
    this.elR.rotation.set(0, 0, 0)
    this.hipL.rotation.set(0, 0, 0)
    this.hipR.rotation.set(0, 0, 0)
    this.kneeL.rotation.set(0, 0, 0)
    this.kneeR.rotation.set(0, 0, 0)

    const s = this.state
    if (s === 'walk' || s === 'run') {
      const freq = s === 'run' ? 13 : 8
      const legA = s === 'run' ? 0.85 : 0.5
      const armA = s === 'run' ? 0.7 : 0.42
      this.phase += dt * freq
      const p = this.phase
      this.hipL.rotation.x = Math.sin(p) * legA
      this.hipR.rotation.x = Math.sin(p + Math.PI) * legA
      this.kneeL.rotation.x = Math.max(0, -Math.sin(p)) * 0.8
      this.kneeR.rotation.x = Math.max(0, -Math.sin(p + Math.PI)) * 0.8
      this.shL.rotation.x = Math.sin(p + Math.PI) * armA
      this.shR.rotation.x = Math.sin(p) * armA
      this.body.position.y = Math.abs(Math.sin(p)) * (s === 'run' ? 0.05 : 0.03)
      if (s === 'run') this.body.rotation.x = 0.18
    } else if (s === 'sit') {
      this.hipL.rotation.x = -1.45
      this.hipR.rotation.x = -1.45
      this.kneeL.rotation.x = 1.45
      this.kneeR.rotation.x = 1.45
      this.elL.rotation.x = -0.3
      this.elR.rotation.x = -0.3
      this.body.position.y = -0.42
    } else if (s === 'eat' || s === 'drink') {
      this.phase += dt * 4
      const m = (s === 'eat' ? 0.18 : 0.1) * Math.sin(this.phase)
      this.shR.rotation.set(-2.0 + m, 0, -0.1)
      this.elR.rotation.x = -1.0
    } else if (s === 'sleep') {
      // Yotgan holat: tanani gorizontal qilamiz
      this.body.rotation.x = -Math.PI / 2
      this.body.position.y = 0.28
      this.shL.rotation.set(0, 0, 0.25)
      this.shR.rotation.set(0, 0, -0.25)
      this.hipL.rotation.x = 0.12
      this.hipR.rotation.x = -0.12
    } else {
      // idle — yengil nafas olish
      this.phase += dt * 1.6
      const b = Math.sin(this.phase) * 0.05
      this.shL.rotation.z = 0.09 + b * 0.4
      this.shR.rotation.z = -0.09 - b * 0.4
      this.body.position.y = b * 0.02
    }
  }
}
