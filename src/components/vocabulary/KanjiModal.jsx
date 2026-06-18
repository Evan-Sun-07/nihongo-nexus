import { useEffect } from 'react'
import { useTTS } from '../../hooks/useTTS'

export default function KanjiModal({ root, onClose, allWords }) {
  const { speak } = useTTS()

  const matchingWords = (allWords || []).filter(w =>
    w.kanji_root === root ||
    (w.kanji_breakdown && w.kanji_breakdown.some(b => b.char === root))
  )

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">
            「{root}」を含む単語
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {matchingWords.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              一致する単語が見つかりません
            </p>
          ) : (
            matchingWords.map(word => (
              <div
                key={word.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-800">{word.word}</span>
                    <span className="text-sm text-gray-500">{word.kana}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{word.meaning}</p>
                </div>
                <button
                  onClick={() => speak(word.kana)}
                  className="text-gray-400 hover:text-blue-500 text-lg transition-colors ml-3"
                  title="読み上げ"
                >
                  🔊
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
