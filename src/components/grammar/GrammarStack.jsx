import { useContext, useState, useMemo, useRef, useCallback } from 'react'
import { AppContext } from '../../context/AppContext'
import GrammarCard from './GrammarCard'

export default function GrammarStack() {
  const { grammarData, wordsData, learnedGrammar, loading } = useContext(AppContext)
  const [search, setSearch] = useState('')
  const [highlightedId, setHighlightedId] = useState(null)
  const cardRefs = useRef({})

  const filtered = useMemo(() => {
    if (!search) return [...grammarData].sort((a, b) => a.order_index - b.order_index)
    const q = search.toLowerCase()
    return grammarData
      .filter(g =>
        g.title.toLowerCase().includes(q) ||
        g.meaning.toLowerCase().includes(q) ||
        g.nuance.toLowerCase().includes(q)
      )
      .sort((a, b) => a.order_index - b.order_index)
  }, [grammarData, search])

  const allSorted = useMemo(
    () => [...grammarData].sort((a, b) => a.order_index - b.order_index),
    [grammarData]
  )

  const learnedCount = useMemo(
    () => grammarData.filter(g => learnedGrammar.has(g.id)).length,
    [grammarData, learnedGrammar]
  )

  const jumpTo = useCallback((id) => {
    const el = cardRefs.current[id]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setHighlightedId(id)
      setTimeout(() => setHighlightedId(null), 1500)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex gap-4">
        <div className="w-52 shrink-0 space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
        <div className="flex-1 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-6 items-start">
      {/* Left index panel */}
      <aside className="hidden md:flex flex-col w-52 shrink-0 sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          {/* Index header with progress */}
          <div className="mb-3 px-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              文法インデックス
            </p>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500">習得済み</span>
              <span className="font-semibold text-gray-700">
                {learnedCount}/{grammarData.length}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: grammarData.length > 0
                    ? `${(learnedCount / grammarData.length) * 100}%`
                    : '0%'
                }}
              />
            </div>
          </div>

          {/* Index list */}
          <div className="space-y-0.5">
            {allSorted.map(g => {
              const inFilter = filtered.some(f => f.id === g.id)
              const isLearned = learnedGrammar.has(g.id)
              return (
                <button
                  key={g.id}
                  onClick={() => inFilter && jumpTo(g.id)}
                  disabled={!inFilter}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors duration-150 leading-tight flex items-center gap-1.5 ${
                    inFilter
                      ? isLearned
                        ? 'text-green-700 hover:bg-green-50'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      : 'text-gray-300 cursor-default'
                  }`}
                >
                  {/* Checkmark icon */}
                  <span className={`shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-150 ${
                    isLearned
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 text-transparent'
                  }`}>
                    <svg viewBox="0 0 10 8" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1,4 3.5,7 9,1" />
                    </svg>
                  </span>

                  <span className="min-w-0 truncate">
                    <span className="text-gray-400 font-mono mr-0.5">{g.order_index}.</span>
                    {g.title}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Search + count */}
        <div className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="文法タイトル・意味で検索..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <p className="text-xs text-gray-400 whitespace-nowrap">{filtered.length}項目</p>
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">📚</p>
            <p className="text-sm">一致する文法が見つかりません</p>
          </div>
        ) : (
          filtered.map(grammar => (
            <div
              key={grammar.id}
              ref={el => { cardRefs.current[grammar.id] = el }}
              id={`grammar-${grammar.id}`}
              className="scroll-mt-28"
            >
              <GrammarCard
                grammar={grammar}
                wordsData={wordsData}
                isHighlighted={highlightedId === grammar.id}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
