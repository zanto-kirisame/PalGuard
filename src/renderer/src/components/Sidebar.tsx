import { useStore } from '../store/useStore'
import { translations } from '../i18n/translations'

export const Sidebar = () => {
    const { currentView, setCurrentView, language } = useStore()
    const t = translations[language]

    const menuItems = [
        { id: 'dashboard', label: t.sidebar.modList, icon: '📦' },
        { id: 'settings', label: t.sidebar.settings, icon: '⚙️' },
        { id: 'logs', label: t.sidebar.logs, icon: '📝' }
    ] as const

    return (
        <aside className="w-64 bg-gray-900 text-white h-screen flex flex-col">
            <div className="p-4 border-b border-gray-800">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    🛡️ PalGuard
                </h1>
            </div>
            <nav className="flex-1 p-2 space-y-1">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${currentView === item.id
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
                v0.1.0
            </div>
        </aside>
    )
}
