// Chalg'ituvchi omillar — o'yinlar, internet, ijtimoiy tarmoq (vaqt yeydi, kayfiyat beradi).

export interface ComputerGame {
  id: string
  name: string
  emoji: string
}

export const COMPUTER_GAMES: ComputerGame[] = [
  { id: 'strat', name: 'Strategiya', emoji: '♟️' },
  { id: 'shooter', name: 'Otishma', emoji: '🔫' },
  { id: 'racing', name: 'Poyga', emoji: '🏎️' },
  { id: 'football', name: 'Futbol', emoji: '⚽' }
]

export const MOBILE_GAME = 'Pixel Run'

export const SOCIAL_POSTS: string[] = [
  '🔥 2025 dizayn trendlari — top 10',
  '😂 Dizayner hayoti: "oxirgi marta o‘zgartirdik"',
  '🎨 Bu logoni qanday yasashgan?',
  '💡 Figma’da 5 ta zo‘r maslahat',
  '🐱 Mushukcha klaviaturada o‘tiribdi',
  '📈 "Men qanday million topdim" (reklama)',
  '🖌️ Yangi shrift chiqdi — bepul',
  '🌆 Eng chiroyli shaharlar — fotoset',
  '🍕 Tunda ishlayotganlar uchun retsept',
  '⚡ AI dizaynni o‘ldiradimi? (bahs)'
]
