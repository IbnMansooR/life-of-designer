// Save tizimi.
// Electron ichida -> lokal JSON faylga yoziladi (window.api orqali).
// Oddiy brauzerda (VS Code live preview) -> localStorage'ga fallback qiladi.
// Shu sabab o'yin ikkala muhitda ham ishlaydi.

export interface ElectronApi {
  isElectron: boolean
  save: (slot: string, data: unknown) => Promise<{ ok: boolean; error?: string }>
  load: (slot: string) => Promise<{ ok: boolean; data?: unknown; error?: string }>
  listSaves: () => Promise<{ ok: boolean; slots?: string[]; error?: string }>
}

declare global {
  interface Window {
    api?: ElectronApi
  }
}

const LS_PREFIX = 'lod:save:'

function hasElectron(): boolean {
  return typeof window !== 'undefined' && !!window.api?.isElectron
}

export async function saveGame(slot: string, data: unknown): Promise<boolean> {
  try {
    if (hasElectron()) {
      const res = await window.api!.save(slot, data)
      return res.ok
    }
    localStorage.setItem(LS_PREFIX + slot, JSON.stringify(data))
    return true
  } catch (err) {
    console.error('[Save] saqlashda xato:', err)
    return false
  }
}

export async function loadGame<T = unknown>(slot: string): Promise<T | null> {
  try {
    if (hasElectron()) {
      const res = await window.api!.load(slot)
      return (res.ok ? (res.data as T) : null) ?? null
    }
    const raw = localStorage.getItem(LS_PREFIX + slot)
    return raw ? (JSON.parse(raw) as T) : null
  } catch (err) {
    console.error('[Save] yuklashda xato:', err)
    return null
  }
}

export async function listSaves(): Promise<string[]> {
  try {
    if (hasElectron()) {
      const res = await window.api!.listSaves()
      return res.ok ? res.slots ?? [] : []
    }
    const slots: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(LS_PREFIX)) slots.push(key.slice(LS_PREFIX.length))
    }
    return slots
  } catch {
    return []
  }
}

export async function hasSave(slot: string): Promise<boolean> {
  return (await loadGame(slot)) !== null
}
