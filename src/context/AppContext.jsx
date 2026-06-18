import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [currentLevel, setCurrentLevelState] = useState('N5')
  const [currentModule, setCurrentModule] = useState('dashboard')
  const [speechRate, setSpeechRateState] = useState(() => {
    const stored = localStorage.getItem('nihongo-speech-rate')
    return stored ? parseFloat(stored) : 1.0
  })
  const [errorPool, setErrorPool] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nihongo-error-pool') || '[]')
    } catch {
      return []
    }
  })
  const [learnedWords, setLearnedWords] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('nihongo-learned-words') || '[]'))
    } catch {
      return new Set()
    }
  })
  const [learnedGrammar, setLearnedGrammar] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('nihongo-learned-grammar') || '[]'))
    } catch {
      return new Set()
    }
  })

  const [wordsData, setWordsData] = useState([])
  const [grammarData, setGrammarData] = useState([])
  const [questionsData, setQuestionsData] = useState([])
  const [loading, setLoading] = useState(false)
  const [dataError, setDataError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setDataError(null)
    Promise.all([
      fetch(`/data/${currentLevel}/words.json`).then(r => r.json()),
      fetch(`/data/${currentLevel}/grammar.json`).then(r => r.json()),
      fetch(`/data/${currentLevel}/questions.json`).then(r => r.json()),
    ])
      .then(([words, grammar, questions]) => {
        setWordsData(words)
        setGrammarData(grammar)
        setQuestionsData(questions)
        setLoading(false)
      })
      .catch(err => {
        console.error('Data load error:', err)
        setDataError(err.message)
        setLoading(false)
      })
  }, [currentLevel])

  const setLevel = useCallback((level) => {
    setCurrentLevelState(level)
  }, [])

  const setModule = useCallback((module) => {
    setCurrentModule(module)
  }, [])

  const setSpeechRate = useCallback((rate) => {
    setSpeechRateState(rate)
    localStorage.setItem('nihongo-speech-rate', String(rate))
  }, [])

  const addError = useCallback((questionId) => {
    setErrorPool(prev => {
      if (prev.includes(questionId)) return prev
      const next = [...prev, questionId]
      localStorage.setItem('nihongo-error-pool', JSON.stringify(next))
      return next
    })
  }, [])

  const clearErrors = useCallback(() => {
    setErrorPool([])
    localStorage.setItem('nihongo-error-pool', '[]')
  }, [])

  const markWordLearned = useCallback((wordId) => {
    setLearnedWords(prev => {
      const next = new Set(prev)
      next.add(wordId)
      localStorage.setItem('nihongo-learned-words', JSON.stringify([...next]))
      return next
    })
  }, [])

  const unmarkWordLearned = useCallback((wordId) => {
    setLearnedWords(prev => {
      const next = new Set(prev)
      next.delete(wordId)
      localStorage.setItem('nihongo-learned-words', JSON.stringify([...next]))
      return next
    })
  }, [])

  const markGrammarLearned = useCallback((grammarId) => {
    setLearnedGrammar(prev => {
      const next = new Set(prev)
      next.add(grammarId)
      localStorage.setItem('nihongo-learned-grammar', JSON.stringify([...next]))
      return next
    })
  }, [])

  const unmarkGrammarLearned = useCallback((grammarId) => {
    setLearnedGrammar(prev => {
      const next = new Set(prev)
      next.delete(grammarId)
      localStorage.setItem('nihongo-learned-grammar', JSON.stringify([...next]))
      return next
    })
  }, [])

  const value = {
    currentLevel,
    currentModule,
    speechRate,
    errorPool,
    learnedWords,
    learnedGrammar,
    wordsData,
    grammarData,
    questionsData,
    loading,
    dataError,
    setLevel,
    setModule,
    setSpeechRate,
    addError,
    clearErrors,
    markWordLearned,
    unmarkWordLearned,
    markGrammarLearned,
    unmarkGrammarLearned,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  return useContext(AppContext)
}
