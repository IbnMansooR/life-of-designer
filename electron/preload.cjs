// Preload: renderer (o'yin) uchun xavfsiz API ochadi.
// window.api orqali save/load chaqiriladi. nodeIntegration o'chirilgan, contextIsolation yoqilgan.
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  isElectron: true,
  save: (slot, data) => ipcRenderer.invoke('save:write', slot, data),
  load: (slot) => ipcRenderer.invoke('save:read', slot),
  listSaves: () => ipcRenderer.invoke('save:list')
})
