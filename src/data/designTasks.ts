// Dizayn topshiriqlari — real loyiha TZ tizimi (Phase 17).

export type ShapeType = 'circle' | 'square' | 'triangle' | 'rect'

export interface DesignColor {
  name: string
  hex: string
}

export const SHAPE_LABEL: Record<ShapeType, string> = {
  circle:   'doira',
  square:   'kvadrat',
  triangle: 'uchburchak',
  rect:     "to'g'ri to'rtburchak"
}

export const SHAPES: ShapeType[] = ['circle', 'square', 'triangle', 'rect']

export interface StyleTag { label: string; bg: string; fg: string }
export interface MoodTile { color: string; label: string }

export interface DesignBrief {
  projectType: string
  client: string
  industry: string
  description: string
  style: StyleTag[]
  palette: DesignColor[]
  requirements: string[]
  mood: MoodTile[]
  targets: { shape: ShapeType; color: DesignColor }[]
}

// ── Rang kutubxonasi ──────────────────────────────────────────────────────────
const C: Record<string, DesignColor> = {
  blue:    { name: "Ko'k",        hex: '#3b82f6' },
  dblue:   { name: "To'q ko'k",   hex: '#1d4ed8' },
  sky:     { name: 'Osmon',       hex: '#0ea5e9' },
  teal:    { name: 'Moviy',       hex: '#0d9488' },
  green:   { name: 'Yashil',      hex: '#22c55e' },
  dgreen:  { name: "To'q yashil", hex: '#15803d' },
  red:     { name: 'Qizil',       hex: '#ef4444' },
  orange:  { name: 'To\'sariq',   hex: '#f97316' },
  yellow:  { name: 'Sariq',       hex: '#eab308' },
  purple:  { name: 'Binafsha',    hex: '#8b5cf6' },
  pink:    { name: 'Pushti',      hex: '#ec4899' },
  white:   { name: 'Oq',          hex: '#f8fafc' },
  light:   { name: 'Och kulrang', hex: '#e2e8f0' },
  gray:    { name: 'Kulrang',     hex: '#64748b' },
  dark:    { name: "To'q kulrang",hex: '#1e293b' },
  black:   { name: 'Qora',        hex: '#0f172a' },
  gold:    { name: 'Oltin',       hex: '#d97706' },
  cream:   { name: 'Krem',        hex: '#fef3c7' },
  coral:   { name: 'Marjon',      hex: '#f43f5e' },
  mint:    { name: 'Yalpiz',      hex: '#6ee7b7' },
}

// ── Stil teglari ──────────────────────────────────────────────────────────────
const T: Record<string, StyleTag> = {
  minimal:   { label: 'Minimal',    bg: '#1e293b', fg: '#94a3b8' },
  bold:      { label: 'Bold',       bg: '#dc2626', fg: '#ffffff' },
  clean:     { label: 'Clean',      bg: '#0f766e', fg: '#ccfbf1' },
  modern:    { label: 'Modern',     bg: '#4f46e5', fg: '#e0e7ff' },
  playful:   { label: 'Playful',    bg: '#db2777', fg: '#fce7f3' },
  corporate: { label: 'Korporativ', bg: '#075985', fg: '#bae6fd' },
  elegant:   { label: 'Elegant',    bg: '#1c1917', fg: '#d6d3d1' },
  geometric: { label: 'Geometrik',  bg: '#7c3aed', fg: '#ede9fe' },
  flat:      { label: 'Flat',       bg: '#0369a1', fg: '#e0f2fe' },
  natural:   { label: 'Natural',    bg: '#166534', fg: '#dcfce7' },
}

// ── Brieflar ──────────────────────────────────────────────────────────────────
const LOGO_BRIEFS: DesignBrief[] = [
  {
    projectType: 'Logo', client: 'TechFlow Solutions', industry: "IT / Dasturiy ta'minot",
    description: "Texnologiya startapi uchun minimal va zamonaviy logo. Kompaniya sun'iy intellekt asosidagi mahsulotlar yaratadi.",
    style: [T.minimal, T.modern, T.geometric],
    palette: [C.blue, C.dblue, C.white, C.dark],
    requirements: [
      "Asosiy rang: ko'k (#3b82f6) — ishonch va texnologiya",
      'Geometrik shakllar asosida (doira yoki kvadrat)',
      'Minimal — ortiqcha detallar bo\'lmasin',
      "Quyuq fon ustida ham ko'rinishi shart",
    ],
    mood: [
      { color: '#3b82f6', label: 'Asosiy' }, { color: '#1d4ed8', label: "Quyuq" },
      { color: '#0f172a', label: 'Fon' },    { color: '#f8fafc', label: 'Yozuv' },
    ],
    targets: [{ shape: 'circle', color: C.blue }, { shape: 'square', color: C.dark }]
  },
  {
    projectType: 'Logo', client: 'FreshBite Cafe', industry: 'Oziq-ovqat / Restoran',
    description: "Zamonaviy kafe uchun do'stona va issiq brend. Tabiiy ingredientlar va qo'lda tayyorlangan taomlarni ta'kidlaydi.",
    style: [T.natural, T.playful, T.clean],
    palette: [C.dgreen, C.green, C.cream, C.gold],
    requirements: [
      "Yashil ranglar — tabiiylik va sog'liqni anglatadi",
      'Yumshoq shakllar (doira yoki ovallar)',
      'Sariq yoki oltin accent qo\'shing',
      "Quvnoq va do'stona ko'rinish",
    ],
    mood: [
      { color: '#15803d', label: 'Asosiy' }, { color: '#22c55e', label: 'Yon rang' },
      { color: '#d97706', label: 'Accent' }, { color: '#fef3c7', label: 'Fon' },
    ],
    targets: [{ shape: 'circle', color: C.dgreen }, { shape: 'triangle', color: C.gold }]
  },
  {
    projectType: 'Logo', client: 'Vertex Studio', industry: 'Arxitektura / Dizayn',
    description: 'Arxitektura va interior dizayn studiyasi. Premium segment. Sodda, kuchli, professional.',
    style: [T.elegant, T.minimal, T.geometric],
    palette: [C.black, C.dark, C.gray, C.gold],
    requirements: [
      "Qora va oltin kombinatsiyasi — premium duygu",
      "O'tkir geometrik shakllar (uchburchak yoki kvadrat)",
      'Nosimmetrik tuzilish',
      "Qat'iy korporativ uslub",
    ],
    mood: [
      { color: '#0f172a', label: 'Asosiy' }, { color: '#1e293b', label: 'Fon' },
      { color: '#d97706', label: 'Accent' }, { color: '#64748b', label: "Qo'shimcha" },
    ],
    targets: [{ shape: 'triangle', color: C.gold }, { shape: 'square', color: C.black }]
  },
  {
    projectType: 'Logo', client: 'PulseHealth', industry: 'Salomatlik / Tibbiyot',
    description: "Raqamli tibbiyot platformasi. Ishonch, yengillik va zamonaviylikni ifodalovchi logo.",
    style: [T.clean, T.modern, T.flat],
    palette: [C.teal, C.sky, C.white, C.light],
    requirements: [
      'Moviy-yashil ranglar — salomatlik va ishonch',
      "Doira: butunlik, himoya ramzi",
      "Toza va professional — muassasa logo uslubida",
      "Minimal rang — 2-3 tadan oshmasin",
    ],
    mood: [
      { color: '#0d9488', label: 'Teal' }, { color: '#0ea5e9', label: 'Sky' },
      { color: '#f8fafc', label: 'Oq' },   { color: '#e2e8f0', label: 'Fon' },
    ],
    targets: [{ shape: 'circle', color: C.teal }, { shape: 'rect', color: C.sky }]
  },
]

const BRAND_BRIEFS: DesignBrief[] = [
  {
    projectType: 'Brand Book', client: 'NovaPay', industry: "Fintech / To'lovlar",
    description: "Onlayn to'lov tizimi brand identifikatsiyasi. Ishonch, xavfsizlik va tezlik.",
    style: [T.corporate, T.modern, T.flat],
    palette: [C.dblue, C.blue, C.white, C.light],
    requirements: [
      "Asosiy: to'q ko'k + yengil ko'k + oq",
      "Kvadrat — karta, ekran, tugma uchun asos shakl",
      "Rang nisbati: 60% asosiy, 30% qo'shimcha, 10% accent",
      "Barcha elementlar grid tizimida",
    ],
    mood: [
      { color: '#1d4ed8', label: 'Primary' }, { color: '#3b82f6', label: 'Secondary' },
      { color: '#e2e8f0', label: 'Background'}, { color: '#f8fafc', label: 'Surface' },
    ],
    targets: [
      { shape: 'square', color: C.dblue }, { shape: 'rect', color: C.blue },
      { shape: 'rect', color: C.light }
    ]
  },
  {
    projectType: 'Brand Book', client: 'Bloom Cosmetics', industry: "Go'zallik / Parvarish",
    description: "Premium kosmetika brendining to'liq vizual identifikatsiyasi. Nozik, jozibali, zamonaviy.",
    style: [T.elegant, T.playful],
    palette: [C.pink, C.coral, C.cream, C.white],
    requirements: [
      "Pushti va marjon — asosiy rang gamasi",
      "Yumshoq shakllar: doira, ellips",
      "Krem fon — premium, issiq muhit",
      "Elementlar orasida kenglik (white space)",
    ],
    mood: [
      { color: '#ec4899', label: 'Signature' }, { color: '#f43f5e', label: 'Accent' },
      { color: '#fef3c7', label: 'Background'}, { color: '#f8fafc', label: 'White' },
    ],
    targets: [
      { shape: 'circle', color: C.pink }, { shape: 'circle', color: C.coral },
      { shape: 'rect', color: C.cream }
    ]
  },
  {
    projectType: 'Brand Book', client: 'BuildRight', industry: "Qurilish / Muhandislik",
    description: "Qurilish kompaniyasi uchun ishonchli va kuchli brand tizimi.",
    style: [T.bold, T.corporate, T.geometric],
    palette: [C.orange, C.dark, C.gray, C.white],
    requirements: [
      "Asosiy: to'q sariq (#f97316) — energiya, harakat",
      "Qora fon — kuch va ishonchlilik",
      "Geometrik to'rtburchak shakllar",
      "Kontrastli kompozitsiya — uzoqdan ham ko'rinsin",
    ],
    mood: [
      { color: '#f97316', label: 'Primary' }, { color: '#0f172a', label: 'Dark' },
      { color: '#1e293b', label: 'Surface' }, { color: '#64748b', label: 'Gray' },
    ],
    targets: [
      { shape: 'rect', color: C.dark }, { shape: 'square', color: C.orange },
      { shape: 'triangle', color: C.gray }
    ]
  },
]

const UI_BRIEFS: DesignBrief[] = [
  {
    projectType: 'UI / UX', client: 'TaskFlow App', industry: 'Produktivlik / Dastur',
    description: "Vazifalar boshqaruvi ilovasi asosiy ekranlar dizayni. Toza, tez va intuitiv.",
    style: [T.clean, T.minimal, T.flat],
    palette: [C.blue, C.white, C.light, C.dark],
    requirements: [
      "Card-based layout: har bir vazifa alohida karta (rect)",
      "Ko'k accent: faol elementlar, tugmalar, progress",
      "Oq/och kulrang fon — ko'z toliqtirmaydi",
      "Doira: avatar va status indikator",
    ],
    mood: [
      { color: '#3b82f6', label: 'Accent' },     { color: '#f8fafc', label: 'Background' },
      { color: '#e2e8f0', label: 'Card' },        { color: '#1e293b', label: 'Text' },
    ],
    targets: [
      { shape: 'rect', color: C.white }, { shape: 'rect', color: C.blue },
      { shape: 'circle', color: C.blue }
    ]
  },
  {
    projectType: 'UI / UX', client: 'GameZone Platform', industry: "O'yin / Entertainment",
    description: "O'yin platformasi qorong'i mavzuli bosh sahifa. Dinamik, energetik.",
    style: [T.bold, T.modern, T.geometric],
    palette: [C.purple, C.dark, C.black, C.yellow],
    requirements: [
      "Qorong'i fon (#0f172a) — gaming muhiti",
      "Binafsha va sariq — kontrast accent",
      "Katta geometrik shakllar — hero section",
      "Sariq: CTA tugmalar, muhim elementlar",
    ],
    mood: [
      { color: '#0f172a', label: 'Background' }, { color: '#1e293b', label: 'Surface' },
      { color: '#8b5cf6', label: 'Primary' },    { color: '#eab308', label: 'CTA' },
    ],
    targets: [
      { shape: 'rect', color: C.dark }, { shape: 'square', color: C.purple },
      { shape: 'circle', color: C.yellow }
    ]
  },
  {
    projectType: 'UI / UX', client: 'LearnHub', industry: "Ta'lim / EdTech",
    description: "Online ta'lim platformasi uchun kurs sahifasi. Ochiq, ilhomlantiruvchi, do'stona.",
    style: [T.clean, T.modern, T.playful],
    palette: [C.purple, C.pink, C.cream, C.white],
    requirements: [
      "Binafsha — asosiy brand rangi",
      "Pushti accent — interaktiv elementlar",
      "Ochiq fon — o'qishga qulay",
      "Doira: kurs thumbnails, instructor avatarlar",
      "Rect: kontent kartalar, progress bar",
    ],
    mood: [
      { color: '#8b5cf6', label: 'Primary' }, { color: '#ec4899', label: 'Accent' },
      { color: '#fef3c7', label: 'Warm bg' }, { color: '#f8fafc', label: 'White' },
    ],
    targets: [
      { shape: 'rect', color: C.white }, { shape: 'circle', color: C.purple },
      { shape: 'rect', color: C.pink }
    ]
  },
]

const POSTER_BRIEFS: DesignBrief[] = [
  {
    projectType: 'Poster', client: 'UzDesign Conference 2025', industry: 'Tadbir / Dizayn',
    description: "Dizayn konferensiyasi asosiy posteri. A4 format. Ijodiy, ilhomlantiruvchi.",
    style: [T.bold, T.geometric, T.modern],
    palette: [C.purple, C.pink, C.dark, C.white],
    requirements: [
      "Asosiy fon: to'q (#1e293b)",
      "Binafsha va pushti — gradient accent",
      "Yirik geometrik shakllar — kompozitsiya asosi",
      "Oq matn uchun joy qoldiring",
      "Dinamik, nosimmetrik joylashuv",
    ],
    mood: [
      { color: '#1e293b', label: 'Fon' },     { color: '#8b5cf6', label: 'Primary' },
      { color: '#ec4899', label: 'Secondary'},  { color: '#f8fafc', label: 'Matn' },
    ],
    targets: [
      { shape: 'circle', color: C.purple }, { shape: 'triangle', color: C.pink },
      { shape: 'rect', color: C.dark }
    ]
  },
  {
    projectType: 'Poster', client: 'EcoFest Toshkent', industry: 'Ekologiya / Festival',
    description: "Ekologik festival tashviqot posteri. Tabiiy, energetik, motivatsion.",
    style: [T.natural, T.bold, T.playful],
    palette: [C.dgreen, C.mint, C.yellow, C.white],
    requirements: [
      "Yashil va yalpiz — asosiy ranglar",
      "Sariq — quvonch va energiya",
      "Organik shakllar (doiralar)",
      "Och fon — tabiatni anglatadi",
      "Katta elementlar — uzoqdan ko'rinishi kerak",
    ],
    mood: [
      { color: '#15803d', label: 'Dark green' }, { color: '#6ee7b7', label: 'Mint' },
      { color: '#eab308', label: 'Yellow' },     { color: '#f8fafc', label: 'Background' },
    ],
    targets: [
      { shape: 'circle', color: C.dgreen }, { shape: 'circle', color: C.mint },
      { shape: 'triangle', color: C.yellow }
    ]
  },
  {
    projectType: 'Poster', client: 'SoundWave Festival', industry: 'Musiqa / Tadbir',
    description: "Musiqa festivali posteri. Ritmik, qozon va dinamik dizayn.",
    style: [T.bold, T.geometric, T.modern],
    palette: [C.coral, C.orange, C.black, C.yellow],
    requirements: [
      "Qizil-to'sariq oralig'i — issiqlik va energiya",
      "Qora fon — kecha tushirilishi kerak",
      "Ritmik takrorlanuvchi shakllar",
      "Sariq: asosiy matn va CTA elementi",
    ],
    mood: [
      { color: '#0f172a', label: 'Fon' },   { color: '#f43f5e', label: 'Red' },
      { color: '#f97316', label: 'Orange' }, { color: '#eab308', label: 'Yellow' },
    ],
    targets: [
      { shape: 'circle', color: C.coral }, { shape: 'triangle', color: C.orange },
      { shape: 'rect', color: C.black }
    ]
  },
]

const ALL_BRIEFS: DesignBrief[] = [
  ...LOGO_BRIEFS, ...BRAND_BRIEFS, ...UI_BRIEFS, ...POSTER_BRIEFS,
]

const TYPE_MAP: Record<string, DesignBrief[]> = {
  logo:   LOGO_BRIEFS,
  brand:  BRAND_BRIEFS,
  ui:     UI_BRIEFS,
  poster: POSTER_BRIEFS,
}

function pick<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)]
}

export function makeBrief(projectType: string): DesignBrief {
  const key = projectType.toLowerCase().split(/\s+/)[0]
  return pick(TYPE_MAP[key] ?? ALL_BRIEFS)
}

export function briefText(b: DesignBrief): string {
  return `${b.client} — ${b.projectType}`
}

// Eski tizim bilan moslik
export const DESIGN_COLORS: DesignColor[] = Object.values(C)
