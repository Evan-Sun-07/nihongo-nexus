import { useContext, useState, useMemo, useCallback } from 'react'
import { AppContext } from '../../context/AppContext'
import { useTTS } from '../../hooks/useTTS'

function blankWords(sentence, wordsData) {
  // Find words in sentence that match wordsData, blank at most 2
  const found = []
  for (const word of wordsData) {
    if (word.word && word.word.length > 1 && sentence.includes(word.word)) {
      found.push(word.word)
      if (found.length >= 2) break
    }
  }
  return found
}

function buildParts(sentence, blanks) {
  if (blanks.length === 0) return [{ type: 'text', value: sentence }]
  const parts = []
  let remaining = sentence
  const blankSet = [...blanks]

  while (remaining.length > 0) {
    let matched = false
    for (let i = 0; i < blankSet.length; i++) {
      const blank = blankSet[i]
      const pos = remaining.indexOf(blank)
      if (pos === 0) {
        parts.push({ type: 'blank', value: blank, index: i })
        remaining = remaining.slice(blank.length)
        matched = true
        break
      }
    }
    if (!matched) {
      const pos = blankSet.map(b => ({ b, idx: remaining.indexOf(b) }))
        .filter(x => x.idx > 0)
        .sort((a, b) => a.idx - b.idx)
      if (pos.length > 0) {
        parts.push({ type: 'text', value: remaining.slice(0, pos[0].idx) })
        remaining = remaining.slice(pos[0].idx)
      } else {
        parts.push({ type: 'text', value: remaining })
        remaining = ''
      }
    }
  }
  return parts
}

export default function ListeningMode() {
  const { grammarData, wordsData } = useContext(AppContext)
  const { speak } = useTTS()
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [inputs, setInputs] = useState({})
  const [checked, setChecked] = useState(false)
  const [revealed, setRevealed] = useState(false)

  // Gather all example sentences from grammar
  const sentences = useMemo(() => {
    const all = []
    grammarData.forEach(g => {
      if (g.examples) {
        g.examples.forEach(ex => {
          if (ex.jp) all.push({ jp: ex.jp, zh: ex.zh })
        })
      }
    })
    return all
  }, [grammarData])

  const current = sentences[sentenceIndex] || null
  const blanks = useMemo(
    () => (current ? blankWords(current.jp, wordsData) : []),
    [current, wordsData]
  )
  const parts = useMemo(
    () => (current ? buildParts(current.jp, blanks) : []),
    [current, blanks]
  )

  function handlePlay() {
    if (current) speak(current.jp)
  }

  function handleCheck() {
    setChecked(true)
  }

  function handleReveal() {
    setRevealed(true)
    setChecked(true)
  }

  function handleNext() {
    setSentenceIndex(i => (i + 1) % Math.max(sentences.length, 1))
    setInputs({})
    setChecked(false)
    setRevealed(false)
  }

  function isCorrect(blank, index) {
    const val = (inputs[index] || '').trim()
    return val === blank
  }

  if (!current) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>文法データがありません</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-700">挖空精聴</h3>
        <span className="text-xs text-gray-400">{sentenceIndex + 1} / {sentences.length}</span>
      </div>

      {/* Sentence with blanks */}
      <div className="text-lg leading-loose bg-gray-50 rounded-lg p-4">
        {blanks.length === 0 ? (
          <span className="text-gray-700">{current.jp}</span>
        ) : (
          parts.map((part, i) => {
            if (part.type === 'text') {
              return <span key={i} className="text-gray-700">{part.value}</span>
            }
            const correct = checked && isCorrect(part.value, part.index)
            const wrong = checked && !isCorrect(part.value, part.index)
            return (
              <span key={i} className="inline-flex items-center mx-1">
                <input
                  type="text"
                  value={revealed ? part.value : (inputs[part.index] || '')}
                  onChange={e => setInputs(prev => ({ ...prev, [part.index]: e.target.value }))}
                  disabled={checked}
                  placeholder="　　"
                  className={`border-b-2 text-center w-20 bg-transparent outline-none text-base transition-colors ${
                    correct
                      ? 'border-green-500 text-green-700'
                      : wrong
                      ? 'border-red-400 text-red-600'
                      : 'border-gray-400 text-gray-800'
                  }`}
                />
              </span>
            )
          })
        )}
      </div>

      {/* Answer feedback */}
      {checked && (
        <div className="text-sm text-gray-500">
          <span className="font-medium text-gray-700">正解：</span>
          {blanks.length > 0 ? blanks.join('、') : current.jp}
        </div>
      )}
      <div className="text-sm text-gray-400 italic">{current.zh}</div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handlePlay}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          🔊 音声再生
        </button>
        {!checked && (
          <>
            <button
              onClick={handleCheck}
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
            >
              ✓ 答え合わせ
            </button>
            <button
              onClick={handleReveal}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              答えを見る
            </button>
          </>
        )}
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          次へ →
        </button>
      </div>
    </div>
  )
}
