// Electron asosiy jarayoni (main process).
// Vazifasi: oyna ochish, o'yinni yuklash va lokal save/load fayllarini boshqarish.
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

const isDev = process.env.ELECTRON_DEV === '1'

// Save fayllari foydalanuvchi papkasida saqlanadi (offline, lokal).
function savesDir() {
  const dir = path.join(app.getPath('userData'), 'saves')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: '#0b0d12',
    title: 'Life of Designer',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  win.setMenuBarVisibility(false)
  win.once('ready-to-show', () => win.show())

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }
}

// === IPC: lokal save tizimi ===
ipcMain.handle('save:write', (_e, slot, data) => {
  try {
    const file = path.join(savesDir(), `${slot}.json`)
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
    return { ok: true }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
})

ipcMain.handle('save:read', (_e, slot) => {
  try {
    const file = path.join(savesDir(), `${slot}.json`)
    if (!fs.existsSync(file)) return { ok: true, data: null }
    const raw = fs.readFileSync(file, 'utf-8')
    return { ok: true, data: JSON.parse(raw) }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
})

ipcMain.handle('save:list', () => {
  try {
    const files = fs.readdirSync(savesDir()).filter((f) => f.endsWith('.json'))
    return { ok: true, slots: files.map((f) => f.replace(/\.json$/, '')) }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
})

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
