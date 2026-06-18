import { useState, useContext, useMemo } from 'react'
import { AppContext } from '../../context/AppContext'
import QuestionCard from './QuestionCard'
import MockExam from './MockExam'

const SUB_TABS = [
  { id: 'practice', label: '碎片練習' },
  { id: 'mock', label: '全真模試' },
]

const TYPE_FILTERS = [
  { value: 'all', label: 'すべて' },
  { value: 'vocabulary', label: '文字語彙' },
  { value: 'grammar', label: '文法弁別' },
  { value: 'reading', label: '読解' },
]

export default function ExamEngine() {
  const { questionsData, loading } = useContext(AppContext)
  const [activeTab, setActiveTab] = useState('practice')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return questionsData
    return questionsData.filter(q => q.type === typeFilter)
  }, [questionsData, typeFilter])

  const current = filtered[currentIndex]

  function handleAnswer(isCorrect) {
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }))
  }

  function handleNext() {
    setCurrentIndex(i => (i + 1) % Math.max(filtered.length, 1))
  }

  function handlePrev() {
    setCurrentIndex(i => (i - 1 + filtered.length) % Math.max(filtered.length, 1))
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-800">JLPT 試験練習</h2>
        <p className="text-sm text-gray-500">問題を解いて実力を確認しましょう</p>
      </div>

      {/* Sub tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'mock' ? (
        <MockExam />
      ) : (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-1">
              {TYPE_FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => { setTypeFilter(f.value); setCurrentIndex(0) }}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                    typeFilter === f.value
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {score.total > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600 font-semibold">{score.correct}</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">{score.total}</span>
                <span className="text-gray-500">正解</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">📝</p>
              <p className="text-sm">問題がありません</p>
            </div>
          ) : (
            <>
              <QuestionCard
                key={current?.id}
                question={current}
                onAnswer={handleAnswer}
              />
              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                >
                  ← 前へ
                </button>
                <span className="text-xs text-gray-400">
                  {currentIndex + 1} / {filtered.length}
                </span>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
                >
                  次へ →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
