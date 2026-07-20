import { useMemo, useState } from 'react'
import { pitchClassOptions } from './musicTheory'
import {
  checkScaleQuizAnswer,
  createScaleQuizQuestion,
  type ScaleQuizResult,
} from './scaleQuizLogic'

export function ScaleQuiz() {
  const [question, setQuestion] = useState(() => createScaleQuizQuestion())
  const [selectedPitchClass, setSelectedPitchClass] = useState<number | null>(
    null,
  )
  const [result, setResult] = useState<ScaleQuizResult | null>(null)
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)

  const selectedAnswerLabel = useMemo(() => {
    if (selectedPitchClass === null) {
      return ''
    }

    return (
      pitchClassOptions.find((option) => option.pitchClass === selectedPitchClass)
        ?.label ?? ''
    )
  }, [selectedPitchClass])

  function handleAnswer(pitchClass: number) {
    if (result) {
      return
    }

    const nextResult = checkScaleQuizAnswer(question, pitchClass)
    setSelectedPitchClass(pitchClass)
    setResult(nextResult)
    setTotalQuestions((current) => current + 1)

    if (nextResult.isCorrect) {
      setScore((current) => current + 1)
    }
  }

  function handleNextQuestion() {
    setQuestion(createScaleQuizQuestion())
    setSelectedPitchClass(null)
    setResult(null)
  }

  return (
    <section className="scale-panel quiz-panel" aria-label="스케일 퀴즈">
      <div className="section-heading">
        <div>
          <h2>스케일 퀴즈</h2>
          <p>12개 Key와 1~7도를 랜덤으로 출제합니다.</p>
        </div>
        <div className="quiz-score" aria-label="현재 점수">
          {score} / {totalQuestions}
        </div>
      </div>

      <div className="quiz-question">
        <span className="quiz-label">문제</span>
        <strong>
          {question.keyLabel} Major의 {question.degree}도는?
        </strong>
      </div>

      <div className="answer-grid" aria-label="답 선택">
        {pitchClassOptions.map((option) => {
          const isSelected = selectedPitchClass === option.pitchClass
          const isCorrectAnswer =
            result && option.pitchClass === question.answerPitchClass
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
              key={option.pitchClass}
              type="button"
              className={answerClassName}
              disabled={Boolean(result)}
              onClick={() => handleAnswer(option.pitchClass)}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {result && (
        <div
          className={result.isCorrect ? 'quiz-feedback correct' : 'quiz-feedback incorrect'}
          role="status"
        >
          <strong>{result.isCorrect ? '정답입니다.' : '오답입니다.'}</strong>
          <span>
            선택한 답: {selectedAnswerLabel} / 정답: {result.correctAnswer}
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
  )
}
