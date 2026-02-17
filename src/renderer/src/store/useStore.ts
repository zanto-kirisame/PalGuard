import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Language } from '../i18n/translations'

export interface Mod {
    name: string
    path: string
    relativePath: string
    isEnabled: boolean
    type: 'pak' | 'script'
    lastModified?: number
}

interface AppState {
    currentView: 'dashboard' | 'settings' | 'logs'
    palworldPath: string
    mods: Mod[]
    language: Language
    isScanning: boolean
    setCurrentView: (view: 'dashboard' | 'settings' | 'logs') => void
    setPalworldPath: (path: string) => void
    setMods: (mods: Mod[]) => void
    setIsScanning: (isScanning: boolean) => void
    setLanguage: (lang: Language) => void
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            currentView: 'dashboard',
            palworldPath: '',
            mods: [],
            language: 'ja',
            isScanning: false,
            setCurrentView: (view) => set({ currentView: view }),
            setPalworldPath: (path) => set({ palworldPath: path }),
            setMods: (mods) => set({ mods }),
            setIsScanning: (isScanning) => set({ isScanning }),
            setLanguage: (language) => set({ language })
        }),
        {
            name: 'palguard-storage'
        }
    )
)
