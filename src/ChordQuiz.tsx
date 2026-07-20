import { useMemo, useState } from 'react'
import { pitchClassOptions } from './musicTheory'
import {
  checkChordQuizAnswer,
  createChordQuizQuestion,
  getPitchClassLabels,
  type ChordQuizResult,
} from './chordQuizLogic'

export function ChordQuiz() {
  const [question, setQuestion] = useState(() => createChordQuizQuestion())
  const [selectedPitchClasses, setSelectedPitchClasses] = useState<number[]>([])
  const [result, setResult] = useState<ChordQuizResult | null>(null)
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)

  const selectedNotes = useMemo(
    () => getPitchClassLabels(selectedPitchClasses),
    [selectedPitchClasses],
  )

  function handleToggleAnswer(pitchClass: number) {
    if (result) {
      return
    }

    setSelectedPitchClasses((current) =>
      current.includes(pitchClass)
        ? current.filter((item) => item !== pitchClass)
        : [...current, pitchClass],
    )
  }

  function handleSubmit() {
    if (result || selectedPitchClasses.length === 0) {
      return
    }

    const nextResult = checkChordQuizAnswer(question, selectedPitchClasses)
    setResult(nextResult)
    setTotalQuestions((current) => current + 1)

    if (nextResult.isCorrect) {
      setScore((current) => current + 1)
    }
  }

  function handleNextQuestion() {
    setQuestion(createChordQuizQuestion())
    setSelectedPitchClasses([])
    setResult(null)
  }

  return (
    <section className="scale-panel quiz-panel" aria-label="코드 퀴즈">
      <div className="section-heading">
        <div>
          <h2>코드 퀴즈</h2>
          <p>지원 중인 모든 코드 타입에서 랜덤으로 출제합니다.</p>
        </div>
        <div className="quiz-score" aria-label="현재 점수">
          {score} / {totalQuestions}
        </div>
      </div>

      <div className="quiz-question">
        <span className="quiz-label">문제</span>
        <strong>{question.chordSymbol}의 구성음은?</strong>
      </div>

      <div className="selected-notes" aria-label="선택한 음">
        선택한 음: {selectedNotes.length > 0 ? selectedNotes.join(' - ') : '없음'}
      </div>

      <div className="answer-grid" aria-label="구성음 선택">
        {pitchClassOptions.map((option) => {
          const isSelected = selectedPitchClasses.includes(option.pitchClass)
          const isCorrectAnswer = question.answerPitchClasses.includes(
            option.pitchClass,
          )
          const answerClassName = [
            'answer-button',
            isSelected ? 'selected' : '',
            result && isCorrectAnswer ? 'correct' : '',
            result && isSelected && !isCorrectAnswer ? 'incorrect' : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              key={option.pitchClass}
              type="button"
              className={answerClassName}
              disabled={Boolean(result)}
              onClick={() => handleToggleAnswer(option.pitchClass)}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {result && (
        <div
          className={
            result.isCorrect ? 'quiz-feedback correct' : 'quiz-feedback incorrect'
          }
          role="status"
        >
          <strong>{result.isCorrect ? '정답입니다.' : '오답입니다.'}</strong>
          <span>정답 구성음: {result.correctAnswer}</span>
        </div>
      )}

      <div className="quiz-actions">
        <button
          type="button"
          className="submit-answer-button"
          disabled={Boolean(result) || selectedPitchClasses.length === 0}
          onClick={handleSubmit}
        >
          제출
        </button>
        <button
          type="button"
          className="next-question-button"
          disabled={!result}
          onClick={handleNextQuestion}
        >
          다음 문제
        </button>
      </div>
    </section>
  )
}
