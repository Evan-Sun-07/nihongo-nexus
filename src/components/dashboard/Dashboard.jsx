import { useContext, useMemo } from 'react'
import { AppContext } from '../../context/AppContext'
import Roadmap from './Roadmap'
import ErrorPool from './ErrorPool'

export default function Dashboard() {
  const { wordsData, grammarData, questionsData, learnedWords, learnedGrammar, errorPool, currentLevel, setModule } = useContext(AppContext)

  const stats = useMemo(() => {
    const learnedWordsCount = wordsData.filter(w => learnedWords.has(w.id)).length
    const learnedGrammarCount = grammarData.filter(g => learnedGrammar.has(g.id)).length
    const errorCount = errorPool.length
    const totalWords = wordsData.length
    const totalGrammar = grammarData.length
    const totalQuestions = questionsData.length
    return { learnedWordsCount, learnedGrammarCount, errorCount, totalWords, totalGrammar, totalQuestions }
  }, [wordsData, grammarData, questionsData, learnedWords, learnedGrammar, errorPool])

  const summaryCards = [
    {
      label: '学習済み単語',
      value: `${stats.learnedWordsCount} / ${stats.totalWords}`,
      sub: stats.totalWords > 0
        ? `進捗 ${Math.round((stats.learnedWordsCount / stats.totalWords) * 100)}%`
        : 'データなし',
      icon: '📚',
      color: 'bg-green-50 border-green-200 text-green-700',
      onClick: () => setModule('vocabulary'),
    },
    {
      label: '習得済み文法',
      value: `${stats.learnedGrammarCount} / ${stats.totalGrammar}`,
      sub: stats.totalGrammar > 0
        ? `進捗 ${Math.round((stats.learnedGrammarCount / stats.totalGrammar) * 100)}%`
        : `${currentLevel} レベル`,
      icon: '⛩️',
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      onClick: () => setModule('grammar'),
    },
    {
      label: '練習問題',
      value: stats.totalQuestions,
      sub: '利用可能',
      icon: '✍️',
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      onClick: () => setModule('exam'),
    },
    {
      label: '復習プール',
      value: stats.errorCount,
      sub: stats.errorCount > 0 ? '要復習' : '問題なし！',
      icon: stats.errorCount > 0 ? '⚠️' : '🎉',
      color: stats.errorCount > 0
        ? 'bg-red-50 border-red-200 text-red-700'
        : 'bg-gray-50 border-gray-200 text-gray-600',
      onClick: () => {},
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">今日の看板</h2>
        <p className="text-sm text-gray-500">
          {currentLevel} レベルの学習状況を確認しましょう
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map(card => (
          <button
            key={card.label}
            onClick={card.onClick}
            className={`text-left p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${card.color}`}
          >
            <div className="text-2xl mb-1">{card.icon}</div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-xs font-medium mt-0.5 opacity-80">{card.label}</div>
            <div className="text-xs opacity-60 mt-0.5">{card.sub}</div>
          </button>
        ))}
      </div>

      <Roadmap />
      <ErrorPool />
    </div>
  )
}
