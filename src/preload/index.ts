import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  selectFolder: (): Promise<string | null> => ipcRenderer.invoke('select-folder'),
  getSettings: (): Promise<{ palworldInstallPath: string }> => ipcRenderer.invoke('get-settings'),
  scanMods: (path: string): Promise<any[]> => ipcRenderer.invoke('scan-mods', path),
  toggleMod: (path: string, isEnabled: boolean): Promise<boolean> =>
    ipcRenderer.invoke('toggle-mod', path, isEnabled),
  scanConflicts: (mods: any[]): Promise<any[]> => ipcRenderer.invoke('scan-conflicts', mods),
  readLogs: (path: string): Promise<{ pal: string[]; ue4ss: string[] }> => ipcRenderer.invoke('read-logs', path),
  setLoadOrder: (modPaths: string[]): Promise<boolean> => ipcRenderer.invoke('set-load-order', modPaths),
  resetLoadOrder: (modPaths: string[]): Promise<boolean> => ipcRenderer.invoke('reset-load-order', modPaths),
  checkUpdates: (): Promise<any> => ipcRenderer.invoke('check-updates')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
