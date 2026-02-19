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
        <div className="mb-4 bg-blue-900/30 border border-blue-500/50 p-4 rounded-xl flex flex-col gap-2 relative group overflow-hidden shadow-lg">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>

            <div className="flex justify-between items-start">
                <h3 className="font-bold text-blue-300 flex items-center gap-2">
                    ✨ {t.updates.title}
                </h3>
                <button
                    onClick={() => setDismissed(true)}
                    className="text-blue-400 hover:text-white transition-colors p-1"
                >
                    ✕
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-1">
                {[
                    { key: 'palworld', label: t.updates.palworld },
                    { key: 'ue4ss', label: t.updates.ue4ss },
                    { key: 'palschema', label: t.updates.palschema }
                ].map(({ key, label }) => {
                    const info = (updates as any)[key];
                    return (
                        <div key={key} className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{label}</span>
                            <div className="flex items-center gap-2">
                                <a
                                    href={info.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-gray-800 hover:bg-gray-700 px-2 py-0.5 rounded text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors border border-gray-700"
                                >
                                    {info.latest}
                                </a>
                                {info.date && (
                                    <span className="text-[10px] text-gray-400 font-mono">({info.date})</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="text-[10px] text-orange-400 font-bold mt-2 flex items-center gap-1.5 bg-orange-500/10 p-2 rounded border border-orange-500/20">
                <span className="animate-pulse">⚠️</span> {t.updates.backupWarning}
            </div>
        </div>
    )
}
