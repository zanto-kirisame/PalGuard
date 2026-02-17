import { useStore } from '../store/useStore'
import { useEffect, useState } from 'react'
import { translations } from '../i18n/translations'

export const ModList = () => {
    const { palworldPath, mods, setMods, isScanning, setIsScanning, language } = useStore()
    const t = translations[language]
    const [conflicts, setConflicts] = useState<any[]>([])

    useEffect(() => {
        if (palworldPath) {
            refresh()
        }
    }, [palworldPath])

    const refresh = async () => {
        setIsScanning(true)
        try {
            const modData = await window.api.scanMods(palworldPath)
            setMods(modData)
            const conflictData = await window.api.scanConflicts(modData)
            setConflicts(conflictData)
        } catch (e) {
            console.error(e)
        } finally {
            setIsScanning(false)
        }
    }

    const toggleMod = async (modPath: string, isEnabled: boolean) => {
        setIsScanning(true)
        const success = await window.api.toggleMod(modPath, !isEnabled)
        if (success) {
            refresh()
        } else {
            setIsScanning(false)
        }
    }

    const moveMod = async (index: number, direction: 'up' | 'down') => {
        const newMods = [...mods]
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= newMods.length) return

        [newMods[index], newMods[targetIndex]] = [newMods[targetIndex], newMods[index]]

        setIsScanning(true);
        const pakMods = newMods.filter(m => m.type === 'pak' && m.isEnabled).map(m => m.path);
        await window.api.setLoadOrder(pakMods);
        refresh();
    }

    const isWinner = (modName: string, asset: string) => {
        const conflict = conflicts.find(c => c.asset === asset);
        if (!conflict) return false;

        const lastModWithAsset = [...mods]
            .filter(m => m.isEnabled && m.type === 'pak' && conflict.mods.includes(m.name))
            .pop();

        return lastModWithAsset?.name === modName;
    }

    return (
        <div className="p-8 h-full flex flex-col">
            <header className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    📦 {t.modList.title}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            if (!confirm(t.modList.resetConfirm)) return;
                            setIsScanning(true);
                            const pakPaths = mods.filter(m => m.type === 'pak').map(m => m.path);
                            await window.api.resetLoadOrder(pakPaths);
                            refresh();
                        }}
                        className="text-xs bg-red-900 text-red-100 hover:bg-red-800 px-3 py-1 rounded transition border border-red-700"
                    >
                        {t.modList.resetPriority}
                    </button>
                    <button
                        onClick={refresh}
                        disabled={isScanning}
                        className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isScanning ? t.modList.scanning : t.modList.refresh}
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-auto bg-gray-900/50 rounded-xl border border-gray-800">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-900 sticky top-0">
                        <tr>
                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-16"></th>
                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">MOD名</th>
                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-24">{t.modList.type}</th>
                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-24">{t.modList.status}</th>
                            <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-40">{t.modList.conflicts}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {mods.map((mod, index) => {
                            const modConflicts = conflicts.filter(c => c.mods.includes(mod.name));
                            const hasConflicts = modConflicts.length > 0;
                            const winsAll = mod.isEnabled && hasConflicts && modConflicts.every(c => isWinner(mod.name, c.asset));
                            const losesAny = mod.isEnabled && hasConflicts && modConflicts.some(c => !isWinner(mod.name, c.asset));

                            return (
                                <tr key={mod.path} className="group hover:bg-gray-800/40 transition-colors">
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => moveMod(index, 'up')}
                                                disabled={index === 0 || isScanning}
                                                className="text-xs hover:text-blue-400 disabled:opacity-10"
                                            >▲</button>
                                            <button
                                                onClick={() => moveMod(index, 'down')}
                                                disabled={index === mods.length - 1 || isScanning}
                                                className="text-xs hover:text-blue-400 disabled:opacity-10"
                                            >▼</button>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {winsAll ? (
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                            ) : losesAny ? (
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
                                            ) : (
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
                                            )}
                                            <div>
                                                <div className="font-medium text-gray-200 tracking-wide">{mod.name}</div>
                                                <div className="text-[10px] text-gray-500 font-mono mt-0.5 opacity-60 group-hover:opacity-90">{mod.relativePath}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-tighter ${mod.type === 'pak' ? 'bg-purple-900/40 text-purple-300 border border-purple-800/50' : 'bg-blue-900/40 text-blue-300 border border-blue-800/50'}`}>
                                            {mod.type}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => toggleMod(mod.path, mod.isEnabled)}
                                            disabled={isScanning}
                                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all focus:outline-none ${mod.isEnabled ? 'bg-blue-600' : 'bg-gray-700'}`}
                                        >
                                            <span
                                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${mod.isEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}
                                            />
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        {hasConflicts ? (
                                            <div className="flex items-center gap-2">
                                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold ${losesAny ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                                                    {losesAny ? '⚠️' : '🏆'} {t.modList.conflictDetected} ({modConflicts.length})
                                                </div>
                                                {winsAll && (
                                                    <span className="text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded shadow-sm font-bold flex items-center gap-1 animate-pulse">
                                                        <span>Winner</span>
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-700">-</span>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                        {mods.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-gray-500">
                                    {t.modList.noMods}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
