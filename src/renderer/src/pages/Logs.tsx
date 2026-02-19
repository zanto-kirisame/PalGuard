import { useStore } from '../store/useStore'
import { useEffect, useState } from 'react'
import { translations } from '../i18n/translations'

export const Logs = () => {
    const { palworldPath, mods, language } = useStore()
    const t = translations[language]
    const [logs, setLogs] = useState<{ pal: string[], ue4ss: string[] }>({ pal: [], ue4ss: [] })
    const [activeTab, setActiveTab] = useState<'summary' | 'raw_pal' | 'raw_ue4ss'>('summary')

    useEffect(() => {
        if (palworldPath) {
            fetchLogs()
            const interval = setInterval(fetchLogs, 5000)
            return () => clearInterval(interval)
        }
        return () => { }
    }, [palworldPath])

    const fetchLogs = async () => {
        try {
            const data = await window.api.readLogs(palworldPath)
            setLogs(data)
        } catch (e) {
            console.error(e)
        }
    }

    // Analysis Logic
    const analyzeErrors = (lines: string[]) => {
        const issues: { message: string, cause: string }[] = [];
        const seen = new Set();

        lines.forEach(line => {
            if (seen.has(line)) return;
            seen.add(line);

            if (line.includes('Out of memory') || line.includes('OOM')) {
                issues.push({ message: line, cause: t.logs.causes.oom });
            } else if (line.includes('Access violation') || line.includes('0xC0000005')) {
                issues.push({ message: line, cause: t.logs.causes.access });
            } else if (line.includes('Checksum mismatch')) {
                issues.push({ message: line, cause: t.logs.causes.checksum });
            } else if (line.includes('Failed to load') || line.includes('Error loading')) {
                issues.push({ message: line, cause: t.logs.causes.loadFail });
            }
        });
        return issues;
    }

    const allIssues = [...analyzeErrors(logs.pal), ...analyzeErrors(logs.ue4ss)];

    // Recent Mods
    const recentMods = [...mods]
        .filter(m => m.isEnabled && m.lastModified)
        .sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0))
        .slice(0, 5); // Top 5

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-white flex justify-between items-center">
                <span>{t.logs.title}</span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('summary')}
                        className={`px-3 py-1 rounded text-sm transition ${activeTab === 'summary' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                    >
                        {t.logs.summary}
                    </button>
                    <button
                        onClick={() => setActiveTab('raw_pal')}
                        className={`px-3 py-1 rounded text-sm transition ${activeTab === 'raw_pal' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                    >
                        {t.logs.palTrace}
                    </button>
                    <button
                        onClick={() => setActiveTab('raw_ue4ss')}
                        className={`px-3 py-1 rounded text-sm transition ${activeTab === 'raw_ue4ss' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                    >
                        {t.logs.ue4ssLog}
                    </button>
                </div>
            </h2>

            <div className="flex-1 overflow-auto">
                {activeTab === 'summary' ? (
                    <div className="space-y-6">
                        {/* Error Analysis */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h3 className="text-lg font-bold text-white mb-3">{t.logs.issues}</h3>
                            {allIssues.length === 0 ? (
                                <div className="text-gray-400">{t.logs.noIssues}</div>
                            ) : (
                                <div className="space-y-3">
                                    {allIssues.map((issue, i) => (
                                        <div key={i} className="bg-red-900/30 border border-red-800 p-3 rounded">
                                            <div className="text-red-300 font-bold mb-1">{issue.cause}</div>
                                            <div className="text-xs text-gray-400 font-mono break-all">{issue.message}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Enabled Mods / Candidates */}
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <h3 className="text-lg font-bold text-white mb-3">{t.logs.candidates}</h3>
                            <div className="space-y-2">
                                {recentMods.map(mod => (
                                    <div key={mod.path} className="flex justify-between items-center bg-gray-700/50 p-2 rounded">
                                        <span className="text-gray-200">{mod.name}</span>
                                        <span className="text-xs text-gray-400">
                                            {mod.lastModified ? new Date(mod.lastModified).toLocaleString() : t.logs.unknownDate}
                                        </span>
                                    </div>
                                ))}
                                {recentMods.length === 0 && <div className="text-gray-500">{t.logs.noEnabledMods}</div>}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs overflow-auto border border-gray-700 h-full">
                        {activeTab === 'raw_pal' && logs.pal.map((line, i) => (
                            <div key={i} className="mb-1 border-b border-gray-800 pb-1 last:border-0 text-gray-300">
                                {line}
                            </div>
                        ))}
                        {activeTab === 'raw_ue4ss' && logs.ue4ss.map((line, i) => (
                            <div key={i} className="mb-1 border-b border-gray-800 pb-1 last:border-0 text-gray-300">
                                {line}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
