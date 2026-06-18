import { useState, useContext } from 'react'
import { Furigana, SentenceWithFurigana } from '../../utils/furigana'
import { useTTS } from '../../hooks/useTTS'
import { AppContext } from '../../context/AppContext'

const POS_COLORS = {
  '名詞': 'bg-blue-100 text-blue-700',
  '動詞（I類）': 'bg-green-100 text-green-700',
  '動詞（II類）': 'bg-teal-100 text-teal-700',
  '動詞（III類）': 'bg-cyan-100 text-cyan-700',
  '動詞（する）': 'bg-emerald-100 text-emerald-700',
  '名詞・動詞（する）': 'bg-purple-100 text-purple-700',
  '形容動詞': 'bg-orange-100 text-orange-700',
  '形容詞': 'bg-yellow-100 text-yellow-700',
}

function getPosColor(pos) {
  return POS_COLORS[pos] || 'bg-gray-100 text-gray-600'
}

export default function WordCard({ word, onKanjiRootClick, onWordClick, isHighlighted }) {
  const [flipped, setFlipped] = useState(false)
  const { speak } = useTTS()
  const { learnedWords, markWordLearned, unmarkWordLearned } = useContext(AppContext)

  const isLearned = learnedWords.has(word.id)

  function handleSpeak(e) {
    e.stopPropagation()
    speak(word.kana || word.word)
  }

  function handleSpeakExample(e) {
    e.stopPropagation()
    if (word.example_jp) speak(word.example_jp)
  }

  function handleFlip() {
    setFlipped(f => !f)
  }

  function handleToggleLearned(e) {
    e.stopPropagation()
    if (isLearned) {
      unmarkWordLearned(word.id)
    } else {
      markWordLearned(word.id)
    }
  }

  return (
    <div
      className={`flip-card h-64 cursor-pointer ${flipped ? 'flipped' : ''} ${
        isHighlighted ? 'ring-2 ring-yellow-400' : ''
      }`}
      onClick={handleFlip}
    >
      <div className="flip-card-inner">
        {/* Front */}
        <div className={`flip-card-front rounded-xl border shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow ${
          isLearned ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPosColor(word.part_of_speech)}`}>
                {word.part_of_speech}
              </span>
              {word.accent && word.accent !== '0' && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  {word.accent}型
                </span>
              )}
              {isLearned && (
                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                  ✓ 学習済
                </span>
              )}
            </div>
            <button
              onClick={handleSpeak}
              className="text-gray-400 hover:text-blue-500 transition-colors text-lg shrink-0"
              title="読み上げ"
            >
              🔊
            </button>
          </div>

          <div className="text-center flex-1 flex items-center justify-center py-2">
            {word.kanji_breakdown && word.kanji_breakdown.length > 0 ? (
              <Furigana breakdown={word.kanji_breakdown} className="text-4xl font-bold text-gray-800" />
            ) : (
              <span className="text-4xl font-bold text-gray-800">{word.word}</span>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400">{word.kana}</p>
            <p className="text-xs text-gray-300 mt-1">タップして裏面を見る</p>
          </div>
        </div>

        {/* Back */}
        <div className="flip-card-back bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-2 overflow-hidden hover:shadow-md transition-shadow">
          <div className="text-center">
            <p className="text-xl font-bold text-gray-800">{word.kana}</p>
            <p className="text-sm text-gray-600 mt-0.5">{word.meaning}</p>
          </div>

          {/* Example */}
          {word.example_jp && (
            <div className="bg-gray-50 rounded-lg p-2 text-xs flex-1">
              <div className="flex items-start gap-1">
                <div className="flex-1 min-w-0">
                  <SentenceWithFurigana
                    sentence={word.example_jp}
                    breakdown={word.example_breakdown}
                    className="text-gray-700 leading-loose text-xs"
                  />
                  <p className="text-gray-500 mt-0.5">{word.example_zh}</p>
                </div>
                <button
                  onClick={handleSpeakExample}
                  className="text-gray-400 hover:text-blue-500 transition-colors shrink-0 text-base"
                  title="例文を読み上げ"
                >
                  🔊
                </button>
              </div>
            </div>
          )}

          {/* Tags row */}
          <div className="flex flex-wrap gap-1">
            {word.synonyms && word.synonyms.length > 0 && word.synonyms.map(s => (
              <button
                key={s}
                onClick={e => { e.stopPropagation(); onWordClick && onWordClick(s) }}
                className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full hover:bg-green-100"
              >
                ≈ {s}
              </button>
            ))}
            {word.antonyms && word.antonyms.length > 0 && word.antonyms.map(a => (
              <button
                key={a}
                onClick={e => { e.stopPropagation(); onWordClick && onWordClick(a) }}
                className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full hover:bg-red-100"
              >
                ↔ {a}
              </button>
            ))}
            {word.kanji_root && (
              <button
                onClick={e => {
                  e.stopPropagation()
                  onKanjiRootClick && onKanjiRootClick(word.kanji_root)
                }}
                className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full hover:bg-purple-100"
              >
                漢字: {word.kanji_root}
              </button>
            )}
          </div>

          {/* Learned button */}
          <button
            onClick={handleToggleLearned}
            className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              isLearned
                ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600'
                : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'
            }`}
          >
            {isLearned ? '✓ 学習済み（取り消す）' : '＋ 学習済みにする'}
          </button>
        </div>
      </div>
    </div>
  )
}
