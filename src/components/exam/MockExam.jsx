import { useContext, useState, useEffect, useCallback } from 'react'
import { AppContext } from '../../context/AppContext'

const LEVEL_TIMES = { N5: 35, N4: 35, N3: 50, N2: 70, N1: 110 }

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function MockExam() {
  const { questionsData, currentLevel, addError, setModule } = useContext(AppContext)
  const [mode, setMode] = useState('start') // start | exam | result
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [timerActive, setTimerActive] = useState(false)

  const totalMinutes = LEVEL_TIMES[currentLevel] || 35

  useEffect(() => {
    if (!timerActive) return
    if (timeLeft <= 0) {
      setMode('result')
      setTimerActive(false)
      return
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timerActive, timeLeft])

  function startExam() {
    setCurrentIndex(0)
    setAnswers({})
    setTimeLeft(totalMinutes * 60)
    setTimerActive(true)
    setMode('exam')
  }

  function handleAnswer(index) {
    const q = questionsData[currentIndex]
    if (!q || answers[q.id] !== undefined) return
    setAnswers(prev => ({ ...prev, [q.id]: index }))
    const isCorrect = index === q.correct_answer
    if (!isCorrect) addError(q.id)
  }

  function handleNext() {
    if (currentIndex < questionsData.length - 1) {
      setCurrentIndex(i => i + 1)
    } else {
      setTimerActive(false)
      setMode('result')
    }
  }

  function handleExit() {
    setTimerActive(false)
    setMode('start')
  }

  const correctCount = questionsData.filter(q => answers[q.id] === q.correct_answer).length
  const answeredCount = Object.keys(answers).length
  const wrongQuestions = questionsData.filter(q => answers[q.id] !== undefined && answers[q.id] !== q.correct_answer)

  // Start screen
  if (mode === 'start') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-5">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">全真模試</h3>
          <p className="text-sm text-gray-500 mt-1">{currentLevel} レベル</p>
        </div>
        <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-2xl font-bold text-gray-800">{questionsData.length}</p>
            <p className="text-xs text-gray-500">問題数</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-2xl font-bold text-gray-800">{totalMinutes}</p>
            <p className="text-xs text-gray-500">分</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-2xl font-bold text-gray-800">60</p>
            <p className="text-xs text-gray-500">点合格</p>
          </div>
        </div>
        <button
          onClick={startExam}
          disabled={questionsData.length === 0}
          className="px-8 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 disabled:opacity-40 transition-colors"
        >
          試験開始
        </button>
      </div>
    )
  }

  // Result screen
  if (mode === 'result') {
    const score = questionsData.length > 0
      ? Math.round((correctCount / questionsData.length) * 100)
      : 0
    const passed = score >= 60
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="text-center">
          <div className="text-5xl mb-2">{passed ? '🎉' : '📚'}</div>
          <h3 className="text-2xl font-bold text-gray-800">
            {passed ? '合格！' : '不合格'}
          </h3>
          <p className="text-5xl font-bold mt-3" style={{ color: passed ? '#22c55e' : '#ef4444' }}>
            {score}点
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {correctCount} / {questionsData.length} 問正解
          </p>
        </div>

        {wrongQuestions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">間違えた問題</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {wrongQuestions.map(q => (
                <div key={q.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-sm text-gray-800">{q.question_text}</p>
                  <p className="text-xs text-green-700 mt-1">
                    正解: {q.options[q.correct_answer]}
                  </p>
                  <p className="text-xs text-red-600">
                    あなたの答え: {q.options[answers[q.id]]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={startExam}
            className="px-5 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            もう一度
          </button>
          <button
            onClick={handleExit}
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            終了
          </button>
        </div>
      </div>
    )
  }

  // Exam screen
  const current = questionsData[currentIndex]
  const currentAnswer = current ? answers[current.id] : undefined
  const isAnswered = currentAnswer !== undefined

  return (
    <div className="space-y-4">
      {/* Timer bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-mono font-bold ${
              timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-gray-800'
            }`}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs text-gray-500">
              {currentIndex + 1} / {questionsData.length}
            </span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-2 w-32">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${((currentIndex) / Math.max(questionsData.length, 1)) * 100}%` }}
              />
            </div>
            <button
              onClick={handleExit}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              終了
            </button>
          </div>
        </div>
      </div>

      {/* Question */}
      {current && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <p className="text-base text-gray-800 font-medium leading-relaxed">
            {current.question_text}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {current.options.map((option, i) => {
              let style = 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
              if (isAnswered) {
                if (i === current.correct_answer) style = 'border-green-400 bg-green-50'
                else if (i === currentAnswer) style = 'border-red-400 bg-red-50'
                else style = 'border-gray-100 text-gray-400'
              }
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={isAnswered}
                  className={`p-3 rounded-lg border-2 text-left text-sm transition-all duration-200 ${style}`}
                >
                  {option}
                </button>
              )
            })}
          </div>

          {isAnswered && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 font-semibold mb-1">解説</p>
              <p className="text-sm text-gray-700">{current.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* Next */}
      {isAnswered && (
        <div className="text-right">
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            {currentIndex < questionsData.length - 1 ? '次の問題 →' : '結果を見る'}
          </button>
        </div>
      )}
    </div>
  )
}
