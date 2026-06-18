import { useContext, useState, useMemo, useRef } from 'react'
import { AppContext } from '../../context/AppContext'
import { useTTS } from '../../hooks/useTTS'
import { useRecorder } from '../../hooks/useRecorder'
import { Furigana } from '../../utils/furigana'

export default function ShadowMode() {
  const { grammarData } = useContext(AppContext)
  const { speak } = useTTS()
  const { isRecording, audioURL, startRecording, stopRecording, clearRecording } = useRecorder()
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [rating, setRating] = useState(null)
  const myAudioRef = useRef(null)

  const sentences = useMemo(() => {
    const all = []
    grammarData.forEach(g => {
      if (g.examples) {
        g.examples.forEach(ex => {
          all.push({ jp: ex.jp, zh: ex.zh, breakdown: null })
        })
      }
    })
    return all
  }, [grammarData])

  const current = sentences[sentenceIndex] || null

  function handlePlayOriginal() {
    if (current) speak(current.jp)
  }

  function handlePlayRecording() {
    if (audioURL && myAudioRef.current) {
      myAudioRef.current.play()
    }
  }

  function handleNext() {
    clearRecording()
    setRating(null)
    setSentenceIndex(i => (i + 1) % Math.max(sentences.length, 1))
  }

  function handleRate(val) {
    setRating(val)
    try {
      const key = `nihongo-shadow-rating-${sentenceIndex}`
      localStorage.setItem(key, val)
    } catch {}
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
        <h3 className="font-semibold text-gray-700">影読み・録音</h3>
        <span className="text-xs text-gray-400">{sentenceIndex + 1} / {sentences.length}</span>
      </div>

      {/* Sentence */}
      <div className="text-xl leading-loose bg-gray-50 rounded-lg p-4 text-center">
        {current.breakdown ? (
          <Furigana breakdown={current.breakdown} />
        ) : (
          <span className="text-gray-800">{current.jp}</span>
        )}
      </div>
      <p className="text-sm text-gray-400 text-center">{current.zh}</p>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={handlePlayOriginal}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          🔊 お手本を再生
        </button>

        {!isRecording ? (
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors select-none"
          >
            🎙️ 長押しで録音
          </button>
        ) : (
          <button
            onMouseUp={stopRecording}
            onTouchEnd={stopRecording}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium animate-pulse select-none"
          >
            ● 録音中...
          </button>
        )}
      </div>

      {/* Playback comparison */}
      {audioURL && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={handlePlayOriginal}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              🔊 お手本
            </button>
            <button
              onClick={handlePlayRecording}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
            >
              🎧 自分の録音
            </button>
          </div>
          <audio ref={myAudioRef} src={audioURL} className="hidden" />

          {/* Rating */}
          <div className="flex items-center justify-center gap-4">
            <p className="text-sm text-gray-600">自己評価：</p>
            <button
              onClick={() => handleRate('good')}
              className={`text-2xl transition-transform hover:scale-125 ${rating === 'good' ? 'scale-125' : ''}`}
            >
              👍
            </button>
            <button
              onClick={() => handleRate('bad')}
              className={`text-2xl transition-transform hover:scale-125 ${rating === 'bad' ? 'scale-125' : ''}`}
            >
              👎
            </button>
          </div>
        </div>
      )}

      {/* Next */}
      <div className="text-center">
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          次の文章へ →
        </button>
      </div>
    </div>
  )
}
