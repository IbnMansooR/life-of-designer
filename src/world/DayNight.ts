// Kun/tun sikli — quyosh holati, osmon rangi va yorug'lik o'yin vaqtiga bog'liq (Part 3).
import * as THREE from 'three'
import type { GameTime } from '../core/Time'

const NIGHT_SKY = new THREE.Color(0x0a0f1c)
const DAY_SKY = new THREE.Color(0x87a7d6)
const SUNSET = new THREE.Color(0xd98a4a)

export class DayNight {
  constructor(
    private scene: THREE.Scene,
    private sun: THREE.DirectionalLight,
    private hemi: THREE.HemisphereLight,
    private lampBulbs: THREE.MeshStandardMaterial[]
  ) {}

  update(time: GameTime): void {
    const h = time.hour + time.minute / 60

    // Quyosh ufqda 6:00–18:00 oralig'ida; kunduzi balandda
    const ang = ((h - 6) / 12) * Math.PI // 6:00 -> 0, 18:00 -> PI
    const sinA = Math.sin(ang)
    this.sun.position.set(Math.cos(ang) * 60, Math.max(sinA * 70, 3), 25)

    const day = Math.max(0, sinA) // 0 tunda, 1 tushda
    this.sun.intensity = 0.12 + day * 1.5
    this.hemi.intensity = 0.28 + day * 0.72

    // Osmon rangi: tun <-> kunduz, past quyoshda shafaq tusi
    const sky = NIGHT_SKY.clone().lerp(DAY_SKY, day)
    if (day > 0 && day < 0.35) {
      sky.lerp(SUNSET, (0.35 - day) / 0.35 * 0.45)
    }
    if (this.scene.background instanceof THREE.Color) this.scene.background.copy(sky)
    if (this.scene.fog) this.scene.fog.color.copy(sky)

    // Chiroqlar — kechqurun/tunda yonadi
    const lampOn = Math.max(0, Math.min(1, (0.45 - day) * 3))
    for (const mat of this.lampBulbs) mat.emissiveIntensity = lampOn
  }
}
