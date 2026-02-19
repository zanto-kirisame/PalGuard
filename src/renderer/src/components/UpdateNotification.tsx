import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { translations } from '../i18n/translations'

export const UpdateNotification = () => {
    const { language } = useStore()
    const t = translations[language]
    const [updates, setUpdates] = useState<Record<string, { latest: string; url?: string }> | null>(null)
    const [dismissed, setDismissed] = useState(false)

    useEffect(() => {
        window.api.checkUpdates().then((data) => {
            setUpdates(data)
        })
    }, [])

    if (dismissed || !updates) return null

    // Check if any service has an "unknown" or specific version that indicates update needed
    // Since we don't have local comparison yet, we show the latest info.
    // The user requested: "Show notification if new version available".
    // For now, we show it if we got data.

    return (
        <div className="mb-6 bg-blue-900/30 border border-blue-500/50 p-4 rounded-xl flex flex-col gap-2 relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>

            <div className="flex justify-between items-start">
                <h3 className="font-bold text-blue-300 flex items-center gap-2">
                    ✨ {t.updates.newVersion}
                </h3>
                <button
                    onClick={() => setDismissed(true)}
                    className="text-blue-400 hover:text-white transition-colors"
                >
                    ✕
                </button>
            </div>

            <div className="flex flex-wrap gap-4 text-sm mt-1">
                <div className="flex items-center gap-2">
                    <span className="text-gray-400">{t.updates.palworld}:</span>
                    <span className="bg-gray-800 px-2 py-0.5 rounded text-xs font-mono">{updates.palworld.latest}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-400">{t.updates.ue4ss}:</span>
                    <span className="bg-gray-800 px-2 py-0.5 rounded text-xs font-mono">{updates.ue4ss.latest}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-400">{t.updates.palschema}:</span>
                    <span className="bg-gray-800 px-2 py-0.5 rounded text-xs font-mono">{updates.palschema.latest}</span>
                </div>
            </div>

            <div className="text-xs text-orange-400 font-bold mt-2 animate-pulse">
                {t.updates.backupWarning}
            </div>
        </div>
    )
}
