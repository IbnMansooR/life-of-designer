// 3D dunyo — Three.js sahna.
// Vertical slice uchun: kichik kvartira + ko'cha + bir nechta bino + NPC placeholder'lar.
// Part 3 talabi: 100% 3D muhit. Part 6: grafika gameplaydan ajratilgan (bu fayl faqat ko'rinish).
import * as THREE from 'three'

/** Oddiy AABB kollayder (XZ tekisligida). */
export interface BoxCollider {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export class World {
  readonly scene = new THREE.Scene()
  readonly renderer: THREE.WebGLRenderer
  readonly colliders: BoxCollider[] = []
  private sun!: THREE.DirectionalLight

  constructor(private readonly container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.container.appendChild(this.renderer.domElement)

    this.scene.background = new THREE.Color(0x87a7d6)
    this.scene.fog = new THREE.Fog(0x87a7d6, 40, 140)

    this.buildLights()
    this.buildGround()
    this.buildApartment()
    this.buildStreet()
    this.buildNpcs()

    window.addEventListener('resize', this.onResize)
  }

  private buildLights(): void {
    const hemi = new THREE.HemisphereLight(0xcfe3ff, 0x404048, 0.9)
    this.scene.add(hemi)

    const sun = new THREE.DirectionalLight(0xffffff, 1.6)
    sun.position.set(30, 50, 20)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.near = 1
    sun.shadow.camera.far = 160
    const s = 50
    sun.shadow.camera.left = -s
    sun.shadow.camera.right = s
    sun.shadow.camera.top = s
    sun.shadow.camera.bottom = -s
    sun.shadow.bias = -0.0005
    this.sun = sun
    this.scene.add(sun)
  }

  private buildGround(): void {
    // Asfalt ko'cha
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: 0x3a3f4a, roughness: 1 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    this.scene.add(ground)

    // Trotuar (sidewalk)
    const walk = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 200),
      new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 1 })
    )
    walk.rotation.x = -Math.PI / 2
    walk.position.set(0, 0.01, 0)
    walk.receiveShadow = true
    this.scene.add(walk)
  }

  /** Boshlang'ich kvartira — kichik xona + oddiy mebel (Part 8: ish stoli muhim). */
  private buildApartment(): void {
    const group = new THREE.Group()
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xb9c0cc, roughness: 0.9 })
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x7a5b43, roughness: 0.8 })

    // Pol
    const floor = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 8), floorMat)
    floor.position.set(0, 0.1, -10)
    floor.receiveShadow = true
    group.add(floor)

    const wallH = 3
    const wallT = 0.2
    const cx = 0
    const cz = -10
    // To'rt devor (old devorda eshik joyi — kollajsiz qoldiramiz)
    this.addWall(group, wallMat, cx, cz - 4, 8, wallH, wallT, false) // orqa
    this.addWall(group, wallMat, cx - 4, cz, wallT, wallH, 8, true) // chap
    this.addWall(group, wallMat, cx + 4, cz, wallT, wallH, 8, true) // o'ng
    // Old devor — eshik uchun ikki bo'lak
    this.addWall(group, wallMat, cx - 2.75, cz + 4, 2.5, wallH, wallT, false)
    this.addWall(group, wallMat, cx + 2.75, cz + 4, 2.5, wallH, wallT, false)

    // Krovat
    const bed = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.6, 3),
      new THREE.MeshStandardMaterial({ color: 0x3f5c8a })
    )
    bed.position.set(-2.5, 0.5, -12)
    bed.castShadow = true
    group.add(bed)

    // Ish stoli + monitor (dizayner ish joyi)
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

    this.scene.add(group)
  }

  /** Ko'cha bo'ylab binolar — shahar bloki hissi. */
  private buildStreet(): void {
    const palette = [0x5a6678, 0x4a5468, 0x6b5a78, 0x4f6b5a, 0x78705a]
    let seed = 1234
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }

    for (let i = 0; i < 10; i++) {
      const z = -6 - i * 9
      for (const side of [-1, 1]) {
        // Kvartira tomonini (chap, oldingi bloklar) bo'sh qoldiramiz, qolgan joyga bino
        if (side === -1 && z > -12) continue
        const w = 6 + rand() * 3
        const d = 6 + rand() * 3
        const h = 6 + rand() * 22
        const x = side * (10 + rand() * 2)
        const b = new THREE.Mesh(
          new THREE.BoxGeometry(w, h, d),
          new THREE.MeshStandardMaterial({
            color: palette[Math.floor(rand() * palette.length)],
            roughness: 0.85
          })
        )
        b.position.set(x, h / 2, z)
        b.castShadow = true
        b.receiveShadow = true
        this.scene.add(b)
        this.colliders.push({
          minX: x - w / 2,
          maxX: x + w / 2,
          minZ: z - d / 2,
          maxZ: z + d / 2
        })
      }
    }
  }

  /** Boshlang'ich NPC placeholder'lar (Part 9: ona, do'st, ish beruvchi, mijoz). */
  private buildNpcs(): void {
    const npcs = [
      { name: 'Do‘st', color: 0x45d483, x: -3, z: -2 },
      { name: 'Ish beruvchi', color: 0xffcf5b, x: 4, z: -5 },
      { name: 'Mijoz', color: 0xff6b6b, x: -2, z: -18 }
    ]
    for (const n of npcs) {
      const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.35, 0.9, 6, 12),
        new THREE.MeshStandardMaterial({ color: n.color })
      )
      body.position.set(n.x, 1.0, n.z)
      body.castShadow = true
      this.scene.add(body)
      const label = this.makeLabel(n.name)
      label.position.set(n.x, 2.1, n.z)
      this.scene.add(label)
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

  /** Matnli yorliq (sprite) — NPC ismi uchun. */
  private makeLabel(text: string): THREE.Sprite {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = 'rgba(11,13,18,0.8)'
    roundRect(ctx, 4, 12, 248, 40, 12)
    ctx.fill()
    ctx.fillStyle = '#e8ecf4'
    ctx.font = 'bold 26px Segoe UI, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 128, 33)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false }))
    sprite.scale.set(2, 0.5, 1)
    return sprite
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

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
