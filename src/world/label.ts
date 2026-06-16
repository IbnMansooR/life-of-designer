// Matnli yorliq (sprite) — NPC ismi va belgilar uchun. Bir joyda, qayta ishlatiladi.
import * as THREE from 'three'

export function makeLabel(text: string): THREE.Sprite {
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
