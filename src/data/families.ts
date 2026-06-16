// Oilaviy holat variantlari (Master Prompt — Part 1).
// Har bir variant boshlang'ich pul, stress va motivatsiyaga ta'sir qiladi.

export interface FamilyOption {
  id: string
  title: string
  desc: string
  startMoney: number
  startStress: number
  startMotivation: number
}

export const FAMILIES: FamilyOption[] = [
  {
    id: 'mother_sister',
    title: 'Ona + Singil',
    desc: "Ona va kichik singling. Ularga g'amxo'rlik — sening zimmangda.",
    startMoney: 500_000,
    startStress: 35,
    startMotivation: 75
  },
  {
    id: 'mother_brother',
    title: 'Ona + Aka',
    desc: 'Ona va aka. Aka ba’zan yordam beradi, ba’zan yordam so‘raydi.',
    startMoney: 700_000,
    startStress: 30,
    startMotivation: 70
  },
  {
    id: 'mother_father',
    title: 'Ona + Ota',
    desc: "To'liq oila. Ota xarakteri alohida generatsiya qilinadi.",
    startMoney: 900_000,
    startStress: 25,
    startMotivation: 65
  },
  {
    id: 'mother_only',
    title: 'Faqat Ona',
    desc: 'Faqat onang bor. Eng kuchli hissiy bog‘lanish — eng katta mas’uliyat.',
    startMoney: 300_000,
    startStress: 45,
    startMotivation: 85
  },
  {
    id: 'father_only',
    title: 'Faqat Ota',
    desc: 'Faqat otang bor. Sovuqroq, lekin barqaror muhit.',
    startMoney: 600_000,
    startStress: 35,
    startMotivation: 70
  },
  {
    id: 'big_family',
    title: 'Katta Oila',
    desc: "Ko'p aka-uka, opa-singillar. Shovqinli, iliq, lekin xarajatli.",
    startMoney: 800_000,
    startStress: 40,
    startMotivation: 72
  },
  {
    id: 'relatives',
    title: 'Qarindoshlar bilan',
    desc: "Qarindoshlar qo'lida ulg'aygansan. Mustaqillikka chanqoqsan.",
    startMoney: 400_000,
    startStress: 42,
    startMotivation: 80
  },
  {
    id: 'complex',
    title: 'Murakkab Holat',
    desc: 'Murakkab oilaviy tarix. Og‘ir start, lekin po‘lat iroda.',
    startMoney: 200_000,
    startStress: 55,
    startMotivation: 90
  }
]

export function getFamily(id: string): FamilyOption {
  return FAMILIES.find((f) => f.id === id) ?? FAMILIES[0]
}
