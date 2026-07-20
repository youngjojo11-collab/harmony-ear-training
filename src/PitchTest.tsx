import { useMemo, useState } from 'react'
import { playSineTone } from './audioEngine'
import {
  checkPitchAnswer,
  createPitchQuestion,
  pitchAnswerOptions,
  type PitchTestResult,
} from './pitchTestLogic'

export function PitchTest() {
  const [question, setQuestion] = useState(() => createPitchQuestion())
  const [selectedNoteName, setSelectedNoteName] = useState('')
  const [result, setResult] = useState<PitchTestResult | null>(null)
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)

  const accuracy = useMemo(() => {
    if (totalQuestions === 0) {
      return 0
    }

    return Math.round((score / totalQuestions) * 100)
  }, [score, totalQuestions])

  function handleAnswer(noteName: string) {
    if (result) {
      return
    }

    const nextResult = checkPitchAnswer(question, noteName)
    setSelectedNoteName(noteName)
    setResult(nextResult)
    setTotalQuestions((current) => current + 1)

    if (nextResult.isCorrect) {
      setScore((current) => current + 1)
    }
  }

  function handleNextQuestion() {
    setQuestion(createPitchQuestion())
    setSelectedNoteName('')
    setResult(null)
  }

  return (
    <main className="app-shell scale-shell">
      <section className="scale-header" aria-labelledby="pitch-title">
        <p className="eyebrow">Absolute Pitch</p>
        <h1 id="pitch-title">절대음감 테스트</h1>
        <p className="hero-copy">
          C4부터 B5까지의 단음이 랜덤으로 출제됩니다. 기준음 없이 들리는
          음이름을 선택합니다.
        </p>
      </section>

      <section className="scale-panel quiz-panel" aria-label="단음 테스트">
        <div className="section-heading">
          <div>
            <h2>단음 테스트</h2>
            <p>기준음 없음 / C4~B5 범위</p>
          </div>
          <div className="quiz-score" aria-label="정답률과 총 문제 수">
            {accuracy}% / {totalQuestions}
          </div>
        </div>

        <div className="quiz-question">
          <span className="quiz-label">문제</span>
          <strong>재생된 음은 무엇인가요?</strong>
        </div>

        <button
          type="button"
          className="play-note-button"
          onClick={() => void playSineTone(question.frequency)}
        >
          음 재생
        </button>

        <div className="answer-grid" aria-label="음 이름 선택">
          {pitchAnswerOptions.map((noteName) => {
            const isSelected = selectedNoteName === noteName
            const isCorrectAnswer = result && noteName === question.noteName
            const answerClassName = [
              'answer-button',
              isSelected ? 'selected' : '',
              isCorrectAnswer ? 'correct' : '',
              result && isSelected && !result.isCorrect ? 'incorrect' : '',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <button
                key={noteName}
                type="button"
                className={answerClassName}
                disabled={Boolean(result)}
                onClick={() => handleAnswer(noteName)}
              >
                {noteName}
              </button>
            )
          })}
        </div>

        {result && (
          <div
            className={
              result.isCorrect
                ? 'quiz-feedback correct'
                : 'quiz-feedback incorrect'
            }
            role="status"
          >
            <strong>{result.isCorrect ? '정답입니다.' : '오답입니다.'}</strong>
            <span>
              선택한 답: {selectedNoteName} / 정답: {result.correctAnswer}
            </span>
          </div>
        )}

        <button
          type="button"
          className="next-question-button"
          disabled={!result}
          onClick={handleNextQuestion}
        >
          다음 문제
        </button>
      </section>
    </main>
  )
}
