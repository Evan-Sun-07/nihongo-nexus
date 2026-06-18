import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

export function useTTS() {
  const { speechRate } = useContext(AppContext)

  function speak(text, options = {}) {
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = options.lang || 'ja-JP'
    utter.rate = options.rate ?? speechRate
    utter.pitch = options.pitch || 1
    window.speechSynthesis.speak(utter)
  }

  function stop() {
    window.speechSynthesis.cancel()
  }

  return { speak, stop }
}
