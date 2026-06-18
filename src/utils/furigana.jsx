/**
 * Furigana: renders a kanji_breakdown array as <ruby><rt> tags.
 * Used for word titles where every character has a reading entry.
 * kanji_breakdown: [{ char: "学", reading: "がく" }, ...]
 */
export function Furigana({ breakdown, className = '' }) {
  if (!breakdown || breakdown.length === 0) return null
  return (
    <span className={className}>
      {breakdown.map((item, i) => (
        <ruby key={i}>
          {item.char}
          <rt>{item.reading}</rt>
        </ruby>
      ))}
    </span>
  )
}

/**
 * SentenceWithFurigana: renders a full sentence string with furigana only on
 * the characters that appear in the breakdown array (consumed in order).
 * Characters NOT in the breakdown (hiragana, katakana, particles, punctuation)
 * are rendered as plain text so the sentence is never truncated.
 *
 * breakdown: [{ char: "私", reading: "わたし" }, { char: "日", reading: "に" }, ...]
 * The breakdown must be in the same left-to-right order as they appear in sentence.
 */
export function SentenceWithFurigana({ sentence, breakdown, className = '' }) {
  if (!sentence) return null
  if (!breakdown || breakdown.length === 0) {
    return <span className={className}>{sentence}</span>
  }

  const parts = []
  let queueIdx = 0

  for (let i = 0; i < sentence.length; i++) {
    const char = sentence[i]
    if (
      queueIdx < breakdown.length &&
      breakdown[queueIdx].char === char
    ) {
      const reading = breakdown[queueIdx].reading
      parts.push(
        <ruby key={i}>
          {char}
          <rt>{reading}</rt>
        </ruby>
      )
      queueIdx++
    } else {
      parts.push(<span key={i}>{char}</span>)
    }
  }

  return <span className={className}>{parts}</span>
}
