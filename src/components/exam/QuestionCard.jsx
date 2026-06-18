import { useState } from 'react'
import { useContext } from 'react'
import { AppContext } from '../../context/AppContext'

const OPTION_LABELS = ['A', 'B', 'C', 'D']

export default function QuestionCard({ question, onAnswer }) {
  const { addError, setModule } = useContext(AppContext)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)

  function handleSelect(index) {
    if (answered) return
    setSelected(index)
    setAnswered(true)
    const isCorrect = index === question.correct_answer
    if (!isCorrect) {
      addError(question.id)
    }
    if (onAnswer) onAnswer(isCorrect)
  }

  function getOptionStyle(index) {
    if (!answered) {
      return 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
    }
    if (index === question.correct_answer) {
      return 'border-green-400 bg-green-50 text-green-800'
    }
    if (index === selected && index !== question.correct_answer) {
      return 'border-red-400 bg-red-50 text-red-800'
    }
    return 'border-gray-100 text-gray-400'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      {/* Question */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {question.type === 'vocabulary' ? '文字語彙' :
             question.type === 'grammar' ? '文法弁別' : '読解'}
          </span>
          <span className="text-xs text-gray-400">{question.id}</span>
        </div>
        <p className="text-base text-gray-800 font-medium leading-relaxed">
          {question.question_text}
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {question.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all duration-200 ${getOptionStyle(i)}`}
          >
            <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
              answered && i === question.correct_answer
                ? 'bg-green-500 text-white'
                : answered && i === selected
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {OPTION_LABELS[i]}
            </span>
            <span className="text-sm">{option}</span>
          </button>
        ))}
      </div>

      {/* Explanation */}
      {answered && (
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-gray-500">解説</p>
          <p className="text-sm text-gray-700">{question.explanation}</p>
          {question.linked_grammar_id && (
            <button
              onClick={() => setModule('grammar')}
              className="text-xs text-blue-500 hover:text-blue-700 underline"
            >
              → 文法カードを見る ({question.linked_grammar_id})
            </button>
          )}
        </div>
      )}
    </div>
  )
}
