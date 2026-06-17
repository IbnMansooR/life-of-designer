// Launcher — kirish ekrani + sozlamalar paneli (Phase 17).
import { el } from './dom'
import { hasSave } from '../core/Save'

export interface LauncherCallbacks {
  onNew: () => void
  onContinue: () => void
}

const SETTINGS_KEY = 'lod_settings'

export interface LauncherSettings {
  sensitivity: number   // 0.5 .. 2.0
  gameSpeed: number     // 1 | 2 | 4
}

export function loadSettings(): LauncherSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return { sensitivity: 1.0, gameSpeed: 1, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return { sensitivity: 1.0, gameSpeed: 1 }
}

function saveSettings(s: LauncherSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
}

export class Launcher {
  private root: HTMLElement
  private continueBtn!: HTMLButtonElement
  private settingsPanel!: HTMLElement
  private settingsVisible = false
  private settings: LauncherSettings = loadSettings()

  constructor(parent: HTMLElement, cb: LauncherCallbacks) {
    this.continueBtn = el('button', {
      class: 'btn',
      text: 'Davom etish',
      on: { click: () => cb.onContinue() }
    }) as HTMLButtonElement
    this.continueBtn.disabled = true

    this.settingsPanel = this.buildSettingsPanel()

    this.root = el('div', { class: 'screen launcher hidden' }, [
      el('div', { class: 'brand' }, [
        el('h1', { text: 'LIFE OF DESIGNER' }),
        el('p', { text: 'Bitta qaror — butun bir hayot' })
      ]),
      el('div', { class: 'menu' }, [
        el('button', { class: 'btn primary', text: 'Yangi hayot', on: { click: () => cb.onNew() } }),
        this.continueBtn,
        el('button', {
          class: 'btn',
          text: 'Sozlamalar',
          on: { click: () => this.toggleSettings() }
        }),
        el('button', { class: 'btn', text: 'Chiqish', on: { click: () => window.close() } })
      ]),
      this.settingsPanel,
      el('div', { class: 'version-tag', text: 'v0.1.0 — Phase 17' })
    ])
    parent.appendChild(this.root)
  }

  private buildSettingsPanel(): HTMLElement {
    const panel = el('div', { class: 'settings-panel hidden' })
    this.rebuildSettings(panel)
    return panel
  }

  private rebuildSettings(panel: HTMLElement): void {
    panel.innerHTML = ''

    const title = el('div', { class: 'settings-title', text: '⚙️ Sozlamalar' })

    // Sichqoncha sezgirligi
    const sensLabel = el('div', { class: 'settings-label', text: `Sichqoncha sezgirligi: ${this.settings.sensitivity.toFixed(1)}x` })
    const sensSlider = el('input', {
      attrs: { type: 'range', min: '0.5', max: '2.0', step: '0.1', value: String(this.settings.sensitivity) }
    }) as HTMLInputElement
    sensSlider.addEventListener('input', () => {
      this.settings.sensitivity = parseFloat(sensSlider.value)
      sensLabel.textContent = `Sichqoncha sezgirligi: ${this.settings.sensitivity.toFixed(1)}x`
      saveSettings(this.settings)
    })

    // O'yin tezligi
    const speedLabel = el('div', { class: 'settings-label', text: "O'yin tezligi" })
    const speedRow = el('div', { class: 'settings-row' },
      [1, 2, 4].map((v) =>
        el('button', {
          class: 'settings-speed-btn' + (this.settings.gameSpeed === v ? ' active' : ''),
          text: `${v}x`,
          on: {
            click: (e) => {
              this.settings.gameSpeed = v
              saveSettings(this.settings)
              panel.querySelectorAll('.settings-speed-btn').forEach((b) => b.classList.remove('active'));
              (e.target as HTMLElement).classList.add('active')
            }
          }
        })
      )
    )

    // Tugmalar
    const divider = el('div', { class: 'settings-divider' })
    const keysTitle = el('div', { class: 'settings-label', text: 'Tugmalar (o\'zgartirib bo\'lmaydi)' })
    const keys = [
      ['E',   'Interaksiya / Kirish'],
      ['P',   'Telefon'],
      ['I',   'Inventar'],
      ['C',   "Ko'rinish (1-chi / 3-chi shaxs)"],
      ['F5',  'Saqlash'],
      ['F9',  'Yuklash'],
      ['Esc', 'Pauza / Orqaga'],
    ]
    const keysList = el('div', { class: 'settings-keys' },
      keys.map(([k, desc]) =>
        el('div', { class: 'settings-key-row' }, [
          el('kbd', { text: k }),
          el('span', { text: desc }),
        ])
      )
    )

    panel.append(title, sensLabel, sensSlider, speedLabel, speedRow, divider, keysTitle, keysList)
  }

  private toggleSettings(): void {
    this.settingsVisible = !this.settingsVisible
    this.settingsPanel.classList.toggle('hidden', !this.settingsVisible)
    if (this.settingsVisible) this.rebuildSettings(this.settingsPanel)
  }

  async refreshContinue(): Promise<void> {
    this.continueBtn.disabled = !(await hasSave('slot1'))
  }

  show(): void { this.root.classList.remove('hidden') }
  hide(): void { this.root.classList.add('hidden') }
}
