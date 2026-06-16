// Inventar buyumlari (Part 6: Character.inventory; Part 8: ish quroli).

export interface ItemDef {
  id: string
  name: string
  icon: string
  category: 'tech' | 'tool' | 'clothing' | 'misc'
  desc: string
}

export const ITEMS: Record<string, ItemDef> = {
  phone: {
    id: 'phone',
    name: 'Smartfon',
    icon: '📱',
    category: 'tech',
    desc: 'Aloqa, bank, xarita, kreativ platformalar. P tugmasi bilan ochiladi.'
  },
  laptop: {
    id: 'laptop',
    name: 'Laptop',
    icon: '💻',
    category: 'tech',
    desc: 'Asosiy ish quroli — dizayn loyihalari shu yerda bajariladi.'
  },
  sketchbook: {
    id: 'sketchbook',
    name: 'Eskiz daftari',
    icon: '📓',
    category: 'tool',
    desc: 'G‘oyalar va eskizlar uchun. Kreativlikni oshiradi.'
  },
  camera: {
    id: 'camera',
    name: 'Kamera',
    icon: '📷',
    category: 'tech',
    desc: 'Referens va kontent uchun. Keyingi bosqichlarda ochiladi.'
  },
  wallet: {
    id: 'wallet',
    name: 'Hamyon',
    icon: '👛',
    category: 'misc',
    desc: 'Naqd pul va hujjatlar.'
  },
  tablet: {
    id: 'tablet',
    name: 'Grafik planshet',
    icon: '🖊️',
    category: 'tool',
    desc: 'Raqamli chizmachilik uchun. Dizayn sifatini oshiradi.'
  }
}

// Yangi o'yinchi qo'lidagi boshlang'ich buyumlar.
export const STARTING_ITEMS = ['phone', 'laptop', 'sketchbook', 'wallet']

export function getItem(id: string): ItemDef | undefined {
  return ITEMS[id]
}
