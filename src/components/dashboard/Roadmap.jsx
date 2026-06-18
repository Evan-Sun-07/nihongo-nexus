import { useContext, useMemo, useState } from 'react'
import { AppContext } from '../../context/AppContext'

const LEVEL_COLORS = {
  N5: { border: 'border-green-200', badge: 'bg-green-100 text-green-700 border-green-200', bar: 'bg-green-500', ring: 'ring-green-300' },
  N4: { border: 'border-teal-200', badge: 'bg-teal-100 text-teal-700 border-teal-200', bar: 'bg-teal-500', ring: 'ring-teal-300' },
  N3: { border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700 border-blue-200', bar: 'bg-blue-500', ring: 'ring-blue-300' },
  N2: { border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700 border-indigo-200', bar: 'bg-indigo-500', ring: 'ring-indigo-300' },
  N1: { border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700 border-violet-200', bar: 'bg-violet-500', ring: 'ring-violet-300' },
}

export default function Roadmap() {
  const { wordsData, grammarData, currentLevel, learnedWords, loading, setModule } = useContext(AppContext)
  const [selectedUnit, setSelectedUnit] = useState(null)

  const units = useMemo(() => {
    const map = {}
    wordsData.forEach(word => {
      const u = word.unit || 1
      if (!map[u]) map[u] = { wordCount: 0, grammarCount: 0, learnedCount: 0, words: [] }
      map[u].wordCount++
      map[u].words.push(word)
      if (learnedWords.has(word.id)) map[u].learnedCount++
    })
    grammarData.forEach(g => {
      const u = Math.ceil((g.order_index || 1) / 2)
      if (!map[u]) map[u] = { wordCount: 0, grammarCount: 0, learnedCount: 0, words: [] }
      map[u].grammarCount++
    })
    return Object.entries(map)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([unit, data]) => ({ unit: Number(unit), ...data }))
  }, [wordsData, grammarData, learnedWords])

  const totalLearned = useMemo(
    () => wordsData.filter(w => learnedWords.has(w.id)).length,
    [wordsData, learnedWords]
  )

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-lg" />)}
        </div>
      </div>
    )
  }

  const colors = LEVEL_COLORS[currentLevel] || LEVEL_COLORS.N5
  const overallProgress = wordsData.length > 0
    ? Math.round((totalLearned / wordsData.length) * 100)
    : 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-700">
          学習ロードマップ — {currentLevel}
        </h3>
        <button
          onClick={() => setModule('vocabulary')}
          className="text-xs text-blue-500 hover:underline"
        >
          単語網を開く →
        </button>
      </div>

      {/* Overall progress */}
      <div>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
          <span>全体進捗</span>
          <span className="font-semibold text-gray-700">
            {totalLearned} / {wordsData.length} 語 学習済み
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-700 ${colors.bar}`}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-right text-xs text-gray-400 mt-0.5">{overallProgress}%</p>
      </div>

      {/* Unit grid */}
      {units.length === 0 ? (
        <p className="text-sm text-gray-400">データがありません</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {units.map(unit => {
            const progress = unit.wordCount > 0
              ? Math.round((unit.learnedCount / unit.wordCount) * 100)
              : 0
            const isSelected = selectedUnit === unit.unit
            const allDone = unit.wordCount > 0 && unit.learnedCount === unit.wordCount

            return (
              <button
                key={unit.unit}
                onClick={() => setSelectedUnit(isSelected ? null : unit.unit)}
                className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? `${colors.border} bg-gray-50`
                    : allDone
                    ? 'border-green-100 bg-green-50'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-800 flex items-center gap-1">
                    Unit {unit.unit}
                    {allDone && <span className="text-green-500 text-sm">✓</span>}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colors.badge}`}>
                    {progress}%
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-gray-500 mb-2">
                  <span>単語 {unit.learnedCount}/{unit.wordCount}語</span>
                  {unit.grammarCount > 0 && <span>文法 {unit.grammarCount}項目</span>}
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${colors.bar}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Expanded: show word list */}
                {isSelected && unit.words.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-1">
                    {unit.words.map(w => (
                      <span
                        key={w.id}
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          learnedWords.has(w.id)
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {w.word}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
