# LIFE OF DESIGNER

> Chuqur 3D hayot simulyatsiyasi — 19 yoshli yigit qishloqdan megapolisga kelib, dizayner sifatida hayot quradi. Offline desktop o'yin.

**Holat:** `v0.1.0` — **Phase 1: Core Foundation** (ishlaydigan poydevor)

---

## Texnologiyalar

| Qatlam | Texnologiya |
|--------|-------------|
| 3D dunyo | **Three.js** |
| Til | **TypeScript** |
| Dev / live preview | **Vite** |
| Desktop / `.exe` | **Electron** + **electron-builder** |

O'yin **offline** ishlaydi, internet talab qilmaydi. Save fayllari lokalda saqlanadi.

---

## Ishga tushirish

```bash
npm install        # bog'lamalarni o'rnatish (bir marta)
```

### 1. Brauzerda live preview (VS Code)
```bash
npm run dev
```
So'ng brauzerda ochiladi: `http://localhost:5173`
(VS Code "Live Preview" yoki oddiy brauzer — 3D sahna shu yerda ko'rinadi.)

### 2. Desktop oynada (Electron)
```bash
npm run dev:app
```
Vite + Electron birga ishga tushadi, haqiqiy o'yin oynasi ochiladi.

### 3. Bitta offline `.exe` yasash
```bash
npm run build:exe
```
Natija: `release/LifeOfDesigner.exe` — o'rnatishsiz, ikki marta bosib ochiladigan portable fayl.

---

## Boshqaruv

| Tugma | Vazifa |
|-------|--------|
| `W A S D` | Yurish |
| `Shift` | Yugurish |
| Sichqoncha | Qarash (kanvasga bosib pointer lock) |
| `E` | Ishlatish (uxlash / ishlash / ovqatlanish) |
| `I` | Inventar |
| `C` | 1-shaxs / 3-shaxs kamera |
| `P` | Telefon |
| `Esc` | Pauza / menyu |
| `F5` / `F9` | Saqlash / Yuklash |

---

## Papka strukturasi

```
src/
  core/        # EventBus, Time, GameLoop, Save  (yadro engine)
  game/        # GameState, Game                 (markaziy holat + orkestrator)
  world/       # World (Three.js sahna), Player  (3D + kontroller)
  ui/          # Launcher, CharacterCreate, HUD, Phone
  data/        # families (oilaviy holatlar)
  styles/      # main.css
electron/      # main.cjs (oyna + save IPC), preload.cjs
```

Prinsip: **gameplay logikasi grafikadan mustaqil** — har bir tizim alohida modul (Master Prompt Part 6).

---

## Roadmap (Master Prompt Part 7)

- [x] **Phase 1 — Core Foundation:** launcher, save, vaqt, asosiy UI, 3D sahna
- [x] **Phase 2 — Player System:** tashqi ko'rinish (teri/soch/kiyim), inventar, interaksiya (uxlash/ishlash/ovqatlanish), jonli telefon (balans/xabar/kontakt)
- [x] **Phase 3 — Basic City:** yo'l to'ri + trotuar, ko'p bino, harakatlanuvchi transport, yuruvchi NPC'lar, kun/tun sikli (chiroqlar tunda yonadi)
- [x] **Phase 4 — Life Simulation:** oila aloqa darajasi (0–100), telefonda qo'ng'iroq, oilaga pul yuborish, e'tiborsizlik oqibati (onang sog'inadi), dinamik xabarlar
- [ ] **Phase 5 — Designer Career:** o'qish, ish, freelance, mijoz, portfolio
- [ ] **Phase 6 — Business System:** agentlik, xodimlar, ofis
- [ ] **Phase 7 — Complete World:** to'liq megapolis

---

## Asosiy til
O'zbek tili. Kelajakda boshqa tillar qo'shish uchun struktura tayyor.
