import { useEffect, useRef } from 'react'
import { useTTS } from '../../hooks/useTTS'

export default function WordPopup({ word, onClose, anchorRect }) {
  const { speak } = useTTS()
  const popupRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose()
      }
    }
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    window.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      window.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  // Position near anchor if provided
  const style = anchorRect
    ? {
        position: 'fixed',
        top: Math.min(anchorRect.bottom + 8, window.innerHeight - 160),
        left: Math.min(anchorRect.left, window.innerWidth - 240),
        zIndex: 60,
      }
    : { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 60 }

  return (
    <div ref={popupRef} style={style} className="bg-white rounded-xl border border-gray-200 shadow-xl p-4 w-56">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-lg font-bold text-gray-800">{word.word}</span>
          <span className="ml-2 text-sm text-gray-500">{word.kana}</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 ml-2 text-sm"
        >
          ✕
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-3">{word.meaning}</p>
      <button
        onClick={() => speak(word.kana || word.word)}
        className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700"
      >
        🔊 読み上げ
      </button>
    </div>
  )
}
