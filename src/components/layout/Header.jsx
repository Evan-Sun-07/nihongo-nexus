import { useContext } from 'react'
import { AppContext } from '../../context/AppContext'

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1']
const LEVEL_COLORS = {
  N5: '#22c55e',
  N4: '#14b8a6',
  N3: '#3b82f6',
  N2: '#6366f1',
  N1: '#8b5cf6',
}

const MODULES = [
  { id: 'dashboard', label: '🎯 今日看板' },
  { id: 'vocabulary', label: '📝 単語網' },
  { id: 'grammar', label: '⛩️ 文法スタック' },
  { id: 'audio', label: '🎧 聴解・口語' },
  { id: 'exam', label: '✍️ JLPT試験' },
]

export default function Header() {
  const { currentLevel, setLevel, currentModule, setModule } = useContext(AppContext)
  const accentColor = LEVEL_COLORS[currentLevel]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        {/* Top row: logo + level switcher */}
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-lg font-bold tracking-tight text-gray-800">
              語網
            </span>
            <span className="text-sm font-medium text-gray-500">NihongoNexus</span>
          </div>

          {/* Level switcher */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {LEVELS.map(level => {
              const color = LEVEL_COLORS[level]
              const isActive = currentLevel === level
              return (
                <button
                  key={level}
                  onClick={() => setLevel(level)}
                  style={
                    isActive
                      ? { backgroundColor: color, color: '#fff', borderColor: color }
                      : { borderColor: color, color: color }
                  }
                  className="px-3 py-1 text-sm font-semibold rounded-full border-2 transition-all duration-200 whitespace-nowrap"
                >
                  {level}
                </button>
              )
            })}
          </div>
        </div>

        {/* Module tabs */}
        <div className="flex overflow-x-auto gap-0 -mb-px">
          {MODULES.map(mod => {
            const isActive = currentModule === mod.id
            return (
              <button
                key={mod.id}
                onClick={() => setModule(mod.id)}
                style={
                  isActive
                    ? { borderBottomColor: accentColor, color: accentColor }
                    : {}
                }
                className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors duration-200 ${
                  isActive
                    ? 'font-semibold border-b-2'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                {mod.label}
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}
