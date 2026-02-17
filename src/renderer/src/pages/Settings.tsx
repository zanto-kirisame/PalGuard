import { useStore } from '../store/useStore'
import { useEffect } from 'react'
import { translations } from '../i18n/translations'

export const Settings = () => {
    const { palworldPath, setPalworldPath, language, setLanguage } = useStore()
    const t = translations[language]

    useEffect(() => {
        window.api.getSettings().then((settings) => {
            if (settings.palworldInstallPath) {
                setPalworldPath(settings.palworldInstallPath)
            }
        })
    }, [setPalworldPath])

    const handleSelectFolder = async () => {
        const path = await window.api.selectFolder()
        if (path) {
            setPalworldPath(path)
        }
    }

    return (
        <div className="p-8 space-y-6">
            <h2 className="text-2xl font-bold text-white">{t.settings.title}</h2>

            {/* Installation Path */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                <label className="block text-sm font-medium text-gray-400 mb-3">
                    {t.settings.installPath}
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={palworldPath}
                        readOnly
                        placeholder={t.settings.placeholder}
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
                    />
                    <button
                        onClick={handleSelectFolder}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm shadow-md"
                    >
                        {t.settings.selectPath}
                    </button>
                </div>
            </div>

            {/* Language Selection */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                <label className="block text-sm font-medium text-gray-400 mb-3">
                    {t.settings.language}
                </label>
                <div className="max-w-xs">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as any)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm appearance-none cursor-pointer"
                    >
                        <option value="ja">日本語 (Japanese)</option>
                        <option value="en">English</option>
                    </select>
                </div>
            </div>
        </div>
    )
}
