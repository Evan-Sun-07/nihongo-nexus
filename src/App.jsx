import { useContext } from 'react'
import { AppProvider } from './context/AppContext'
import { AppContext } from './context/AppContext'
import Header from './components/layout/Header'
import Dashboard from './components/dashboard/Dashboard'
import VocabNetwork from './components/vocabulary/VocabNetwork'
import GrammarStack from './components/grammar/GrammarStack'
import AudioTraining from './components/audio/AudioTraining'
import ExamEngine from './components/exam/ExamEngine'

function AppContent() {
  const { currentModule } = useContext(AppContext)

  const modules = {
    dashboard: <Dashboard />,
    vocabulary: <VocabNetwork />,
    grammar: <GrammarStack />,
    audio: <AudioTraining />,
    exam: <ExamEngine />,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">
        {modules[currentModule] || <Dashboard />}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
