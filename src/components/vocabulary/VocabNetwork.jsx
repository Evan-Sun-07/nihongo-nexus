import { useContext, useState, useMemo } from 'react'
import { AppContext } from '../../context/AppContext'
import WordCard from './WordCard'
import KanjiModal from './KanjiModal'

const TABS = [
  { id: 'all', label: 'すべて' },
  { id: 'learned', label: '✓ 学習済み' },
  { id: 'unlearned', label: '未学習' },
]

export default function VocabNetwork() {
  const { wordsData, learnedWords, loading } = useContext(AppContext)
  const [search, setSearch] = useState('')
  const [filterUnit, setFilterUnit] = useState('all')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedRoot, setSelectedRoot] = useState(null)
  const [highlightedWord, setHighlightedWord] = useState(null)

  const units = useMemo(() => {
    const unitSet = new Set(wordsData.map(w => w.unit))
    return Array.from(unitSet).sort((a, b) => a - b)
  }, [wordsData])

  const filtered = useMemo(() => {
    return wordsData.filter(w => {
      const matchUnit = filterUnit === 'all' || String(w.unit) === String(filterUnit)
      const matchSearch =
        !search ||
        w.word.includes(search) ||
        w.kana.includes(search) ||
        w.meaning.includes(search)
      const matchTab =
        activeTab === 'all' ||
        (activeTab === 'learned' && learnedWords.has(w.id)) ||
        (activeTab === 'unlearned' && !learnedWords.has(w.id))
      return matchUnit && matchSearch && matchTab
    })
  }, [wordsData, search, filterUnit, activeTab, learnedWords])

  const learnedCount = useMemo(
    () => wordsData.filter(w => learnedWords.has(w.id)).length,
    [wordsData, learnedWords]
  )

  function handleWordClick(wordText) {
    const found = wordsData.find(w => w.word === wordText || w.kana === wordText)
    if (found) {
      setHighlightedWord(found.id)
      setTimeout(() => setHighlightedWord(null), 2000)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Progress summary */}
      <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">学習進捗</span>
            <span className="text-xs font-semibold text-gray-700">
              {learnedCount} / {wordsData.length} 語
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: wordsData.length > 0 ? `${(learnedCount / wordsData.length) * 100}%` : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all duration-150 ${
              activeTab === tab.id
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.id === 'learned' && learnedCount > 0 && (
              <span className="ml-1 bg-green-100 text-green-700 px-1.5 rounded-full">{learnedCount}</span>
            )}
            {tab.id === 'unlearned' && (
              <span className="ml-1 bg-gray-200 text-gray-600 px-1.5 rounded-full">
                {wordsData.length - learnedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="単語・かな・意味で検索..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => setFilterUnit('all')}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors whitespace-nowrap ${
              filterUnit === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            すべて
          </button>
          {units.map(u => (
            <button
              key={u}
              onClick={() => setFilterUnit(String(u))}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors whitespace-nowrap ${
                String(filterUnit) === String(u)
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Unit {u}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400">{filtered.length} 件の単語</p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">{activeTab === 'learned' ? '📚' : '🔍'}</p>
          <p className="text-sm">
            {activeTab === 'learned'
              ? 'まだ学習済みの単語がありません。単語カードの裏面から登録できます。'
              : '一致する単語が見つかりません'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(word => (
            <WordCard
              key={word.id}
              word={word}
              onKanjiRootClick={root => setSelectedRoot(root)}
              onWordClick={handleWordClick}
              isHighlighted={highlightedWord === word.id}
            />
          ))}
        </div>
      )}

      {selectedRoot && (
        <KanjiModal
          root={selectedRoot}
          onClose={() => setSelectedRoot(null)}
          allWords={wordsData}
        />
      )}
    </div>
  )
}
