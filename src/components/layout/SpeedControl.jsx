import { useContext } from 'react'
import { AppContext } from '../../context/AppContext'

const SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5]

export default function SpeedControl() {
  const { speechRate, setSpeechRate } = useContext(AppContext)

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 font-medium whitespace-nowrap">速度</span>
      <div className="flex gap-1">
        {SPEEDS.map(speed => {
          const isActive = Math.abs(speechRate - speed) < 0.01
          return (
            <button
              key={speed}
              onClick={() => setSpeechRate(speed)}
              className={`px-2 py-1 text-xs rounded font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {speed}x
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Hook-compatible utility to apply speech rate to an <audio> element
export function useAudioSpeedControl(audioRef) {
  const { speechRate } = useContext(AppContext)

  function applyRate() {
    if (audioRef && audioRef.current) {
      audioRef.current.playbackRate = speechRate
    }
  }

  return { applyRate, speechRate }
}
