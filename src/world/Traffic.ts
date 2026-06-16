// Transport tizimi — mashinalar lane'lar bo'ylab harakatlanadi (Part 3: traffic system).
import * as THREE from 'three'
import { buildLanes, type Lane } from './cityLayout'

const CAR_COLORS = [0xd94f4f, 0x4f7bd9, 0xe8c14a, 0x4fd98a, 0xe8e8ee, 0x2b2f3a, 0xd97b3a]

interface Car {
  mesh: THREE.Group
  lane: Lane
  t: number // 0..1 lane bo'ylab joylashuv
  speed: number // birlik/s (lane uzunligiga nisbatan emas, dunyo birligida)
  length: number
}

export class Traffic {
  private cars: Car[] = []

  constructor(scene: THREE.Scene) {
    const lanes = buildLanes()
    let i = 0
    for (const lane of lanes) {
      const length = lane.from.distanceTo(lane.to)
      const perLane = 2
      for (let k = 0; k < perLane; k++) {
        const mesh = this.buildCar(CAR_COLORS[i % CAR_COLORS.length])
        // Lane yo'nalishi bo'yicha burish
        const dir = new THREE.Vector3().subVectors(lane.to, lane.from).normalize()
        mesh.rotation.y = Math.atan2(dir.x, dir.z)
        scene.add(mesh)
        this.cars.push({
          mesh,
          lane,
          t: (k / perLane + i * 0.13) % 1,
          speed: 7 + (i % 3),
          length
        })
        i++
      }
    }
  }

  private buildCar(color: number): THREE.Group {
    const g = new THREE.Group()
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.6, 3.4),
      new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.3 })
    )
    body.position.y = 0.5
    body.castShadow = true
    g.add(body)
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.55, 1.7),
      new THREE.MeshStandardMaterial({ color: 0x10131a, roughness: 0.3, metalness: 0.2 })
    )
    cabin.position.set(0, 0.95, -0.2)
    g.add(cabin)
    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.25, 12)
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0c })
    for (const dx of [-0.85, 0.85]) {
      for (const dz of [-1.1, 1.1]) {
        const w = new THREE.Mesh(wheelGeo, wheelMat)
        w.rotation.z = Math.PI / 2
        w.position.set(dx, 0.32, dz)
        g.add(w)
      }
    }
    return g
  }

  update(dt: number): void {
    const pos = new THREE.Vector3()
    for (const car of this.cars) {
      car.t += (car.speed * dt) / car.length
      if (car.t > 1) car.t -= 1
      pos.lerpVectors(car.lane.from, car.lane.to, car.t)
      car.mesh.position.set(pos.x, 0, pos.z)
    }
  }
}
