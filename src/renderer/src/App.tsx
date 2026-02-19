import { Sidebar } from './components/Sidebar'
import { Settings } from './pages/Settings'
import { ModList } from './pages/ModList'
import { Logs } from './pages/Logs'
import { UpdateNotification } from './components/UpdateNotification'
import { useStore } from './store/useStore'

function App() {
  const { currentView } = useStore()

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      <Sidebar />
      <main className="flex-1 bg-gray-950 overflow-hidden">
        <div className="page-container">
          <UpdateNotification />
          {currentView === 'settings' && <Settings />}
          {currentView === 'dashboard' && <ModList />}
          {currentView === 'logs' && <Logs />}
        </div>
      </main>
    </div>
  )
}

export default App
