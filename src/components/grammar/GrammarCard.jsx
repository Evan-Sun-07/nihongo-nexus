import { useState, useRef, useContext } from 'react'
import { useTTS } from '../../hooks/useTTS'
import { AppContext } from '../../context/AppContext'
import WordPopup from './WordPopup'

const LEVEL_BADGE = {
  N5: 'bg-green-100 text-green-700',
  N4: 'bg-teal-100 text-teal-700',
  N3: 'bg-blue-100 text-blue-700',
  N2: 'bg-indigo-100 text-indigo-700',
  N1: 'bg-violet-100 text-violet-700',
}

export default function GrammarCard({ grammar, wordsData = [], isHighlighted }) {
  const { speak } = useTTS()
  const { learnedGrammar, markGrammarLearned, unmarkGrammarLearned } = useContext(AppContext)
  const [collapsed, setCollapsed] = useState(true)
  const [popup, setPopup] = useState(null)
  const cardRef = useRef(null)

  const isLearned = learnedGrammar.has(grammar.id)

  function handleToggleLearned(e) {
    e.stopPropagation()
    if (isLearned) {
      unmarkGrammarLearned(grammar.id)
    } else {
      markGrammarLearned(grammar.id)
    }
  }

  function handleWordClick(word, e) {
    const rect = e.target.getBoundingClientRect()
    setPopup({ word, rect })
  }

  function renderSentenceWithLinks(text) {
    if (!wordsData || wordsData.length === 0) return <span>{text}</span>
    const parts = []
    let remaining = text
    let idx = 0

    while (remaining.length > 0) {
      let matched = false
      for (const word of wordsData) {
        if (word.word.length > 0 && remaining.startsWith(word.word)) {
          parts.push(
            <button
              key={`word-${idx}`}
              onClick={e => handleWordClick(word, e)}
              className="underline decoration-dotted text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              {word.word}
            </button>
          )
          remaining = remaining.slice(word.word.length)
          idx++
          matched = true
          break
        }
      }
      if (!matched) {
        parts.push(<span key={`char-${idx}`}>{remaining[0]}</span>)
        remaining = remaining.slice(1)
        idx++
      }
    }
    return parts
  }

  const badgeClass = LEVEL_BADGE[grammar.level] || LEVEL_BADGE.N5

  return (
    <div
      ref={cardRef}
      className={`rounded-xl border shadow-sm overflow-hidden transition-all duration-200 ${
        isHighlighted
          ? 'border-yellow-400 shadow-yellow-100 shadow-md'
          : isLearned
          ? 'border-green-300 bg-green-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        {/* Collapse toggle — takes up all available space */}
        <button
          className="flex-1 flex items-center gap-2 min-w-0 text-left"
          onClick={() => setCollapsed(c => !c)}
        >
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${badgeClass}`}>
            {grammar.level}
          </span>
          <span className="text-gray-400 text-xs font-mono shrink-0">#{grammar.order_index}</span>
          <h3 className={`text-base font-bold truncate ${isLearned ? 'text-green-800' : 'text-gray-800'}`}>
            {grammar.title}
          </h3>
          <span className="text-xs text-gray-400 shrink-0 hidden sm:inline">— {grammar.meaning}</span>
        </button>

        {/* Learned checkbox — independent from collapse */}
        <button
          onClick={handleToggleLearned}
          title={isLearned ? '学習済みを取り消す' : '学習済みにする'}
          className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            isLearned
              ? 'bg-green-500 border-green-500 text-white hover:bg-red-400 hover:border-red-400'
              : 'border-gray-300 text-transparent hover:border-green-400 hover:text-green-400'
          }`}
        >
          <svg viewBox="0 0 12 10" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1,5 4.5,8.5 11,1" />
          </svg>
        </button>

        {/* Expand/collapse arrow */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            viewBox="0 0 10 6"
            className={`w-3 h-3 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
            fill="currentColor"
          >
            <path d="M0 0l5 6 5-6H0z" />
          </svg>
        </button>
      </div>

      {/* Connection formula — always visible */}
      <div className="px-4 pb-3 border-b border-gray-100">
        <div className={`border rounded-lg px-3 py-2 text-sm font-mono ${
          isLearned ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-700'
        }`}>
          {grammar.connection}
        </div>
      </div>

      {/* Collapsible body */}
      {!collapsed && (
        <div className="p-4 space-y-3">
          <div>
            <p className="text-base font-semibold text-gray-800">{grammar.meaning}</p>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">{grammar.nuance}</p>
          </div>

          {grammar.examples && grammar.examples.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">例文</p>
              {grammar.examples.map((ex, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {renderSentenceWithLinks(ex.jp)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{ex.zh}</p>
                      {ex.scene && (
                        <span className="inline-block mt-1 text-xs bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded">
                          {ex.scene}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => speak(ex.jp)}
                      className="text-gray-400 hover:text-blue-500 transition-colors shrink-0"
                      title="読み上げ"
                    >
                      🔊
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mark learned button at bottom when expanded */}
          <button
            onClick={handleToggleLearned}
            className={`w-full py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              isLearned
                ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600'
                : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'
            }`}
          >
            {isLearned ? '✓ 学習済み（取り消す）' : '＋ 学習済みにする'}
          </button>
        </div>
      )}

      {popup && (
        <WordPopup
          word={popup.word}
          anchorRect={popup.rect}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  )
}
