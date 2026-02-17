import { Sidebar } from './components/Sidebar'
import { Settings } from './pages/Settings'
import { ModList } from './pages/ModList'
import { Logs } from './pages/Logs'
import { useStore } from './store/useStore'

function App() {
  const { currentView } = useStore()

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      <Sidebar />
      <main className="flex-1 overflow-hidden bg-gray-950">
        {currentView === 'settings' && <Settings />}
        {currentView === 'dashboard' && <ModList />}
        {currentView === 'logs' && <Logs />}
      </main>
    </div>
  )
}

export default App
