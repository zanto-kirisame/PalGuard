/// <reference types="vite/client" />

export interface IAPI {
    selectFolder: () => Promise<string | null>
    getSettings: () => Promise<{ palworldInstallPath: string }>
    scanMods: (path: string) => Promise<any[]>
    toggleMod: (path: string, isEnabled: boolean) => Promise<boolean>
    scanConflicts: (mods: any[]) => Promise<any[]>
    readLogs: (path: string) => Promise<{ pal: string[]; ue4ss: string[] }>
    setLoadOrder: (modPaths: string[]) => Promise<boolean>
    resetLoadOrder: (modPaths: string[]) => Promise<boolean>
}

declare global {
    interface Window {
        electron: any
        api: IAPI
    }
}
