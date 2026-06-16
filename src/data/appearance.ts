// Qahramon tashqi ko'rinishi (Part 9: o'yinchi ko'rinish tanlaydi).
// Ranglar CSS hex sifatida saqlanadi — THREE.Color ham, DOM ham shuni tushunadi.

export interface Appearance {
  skin: string
  hair: string
  shirt: string
  pants: string
}

export const SKIN_TONES = ['#f1c9a5', '#e8b48c', '#c98a5e', '#a86b3c', '#7a4a28']
export const HAIR_COLORS = ['#1a1410', '#2b2118', '#4a2f1a', '#6b4423', '#b5651d', '#8a8a8a']
export const SHIRT_COLORS = ['#5b8cff', '#45d483', '#ff6b6b', '#ffcf5b', '#8a5bff', '#e8ecf4', '#2b2f3a']
export const PANTS_COLORS = ['#2b2f3a', '#3a3f4a', '#1b2030', '#4a3a2a', '#5a4632']

export const DEFAULT_APPEARANCE: Appearance = {
  skin: '#e8b48c',
  hair: '#2b2118',
  shirt: '#5b8cff',
  pants: '#2b2f3a'
}
