// Hayot eventlari — tasodifiy voqealar tanlov bilan (Part 8: event generation).

export interface EventEffect {
  money?: number
  mood?: number
  stress?: number
  relationship?: number
  reputation?: number
}

export interface EventChoice {
  label: string
  effect: EventEffect
  result: string
}

export interface LifeEvent {
  id: string
  title: string
  desc: string
  choices: EventChoice[]
}

export const EVENTS: LifeEvent[] = [
  {
    id: 'old_friend',
    title: 'Eski do‘st',
    desc: 'Eski do‘sting uchrashuvga chaqirdi. Borasanmi?',
    choices: [
      { label: 'Boraman', effect: { mood: 8, stress: -6, money: -50_000 }, result: 'Ajoyib vaqt o‘tkazding 🙂' },
      { label: 'Ishim bor', effect: { mood: -4 }, result: 'Ishni tanlading...' }
    ]
  },
  {
    id: 'big_client',
    title: 'Kutilmagan mijoz',
    desc: 'Katta kompaniya yirik loyiha taklif qilyapti — lekin muddati qisqa.',
    choices: [
      { label: 'Qabul qilaman', effect: { money: 800_000, reputation: 6, stress: 10 }, result: 'Katta daromad, lekin charchading' },
      { label: 'Rad etaman', effect: { mood: 3 }, result: 'Dam olishni afzal ko‘rding' }
    ]
  },
  {
    id: 'family_need',
    title: 'Oilaviy muammo',
    desc: 'Oilangda kutilmagan xarajat chiqdi, yordam so‘rashyapti.',
    choices: [
      { label: 'Yordam beraman', effect: { money: -500_000, relationship: 16 }, result: 'Oilang juda minnatdor 💛' },
      { label: 'Imkonim yo‘q', effect: { relationship: -12, mood: -6 }, result: 'Aybdorlik hissi qoldi' }
    ]
  },
  {
    id: 'contest_win',
    title: 'Konkurs g‘olibi!',
    desc: 'Dizayn konkursida g‘olib chiqding!',
    choices: [{ label: 'Zo‘r!', effect: { money: 400_000, reputation: 10, mood: 12 }, result: 'Tabriklaymiz! 🎉' }]
  },
  {
    id: 'vacation',
    title: 'Charchadingmi?',
    desc: 'Bir muncha vaqtdan beri tinim yo‘q. Sayohatga chiqasanmi?',
    choices: [
      { label: 'Sayohatga', effect: { money: -700_000, stress: -30, mood: 16 }, result: 'Yangi kuch bilan qaytding' },
      { label: 'Keyinroq', effect: { stress: 8 }, result: 'O‘zingni qiynama...' }
    ]
  },
  {
    id: 'rent',
    title: 'Ijara xarajati',
    desc: 'Kutilmagan kommunal to‘lov keldi.',
    choices: [{ label: 'To‘layman', effect: { money: -250_000, mood: -3 }, result: 'Hal qilindi' }]
  },
  {
    id: 'new_meeting',
    title: 'Yangi tanishuv',
    desc: 'Kafeda kimdir bilan tanishding.',
    choices: [
      { label: 'Suhbatlashaman', effect: { mood: 7 }, result: 'Yangi tanish — yaxshi kayfiyat' },
      { label: 'O‘tib ketaman', effect: {}, result: 'Boshqa safar...' }
    ]
  }
]

export function randomEvent(): LifeEvent {
  return EVENTS[Math.floor(Math.random() * EVENTS.length)]
}
