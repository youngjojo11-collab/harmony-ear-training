import { useMemo, useState } from 'react'
import { chordTypes, pitchClassOptions } from './musicTheory'
import {
  canCreateChordQuizQuestion,
  checkChordQuizAnswer,
  createChordQuizQuestion,
  getDefaultChordQuizRange,
  getPitchClassLabels,
  type ChordQuizRange,
  type ChordQuizResult,
} from './chordQuizLogic'

export function ChordQuiz() {
  const [quizRange, setQuizRange] = useState<ChordQuizRange>(() =>
    getDefaultChordQuizRange(),
  )
  const [question, setQuestion] = useState(() =>
    createChordQuizQuestion(getDefaultChordQuizRange()),
  )
  const [selectedPitchClasses, setSelectedPitchClasses] = useState<number[]>([])
  const [result, setResult] = useState<ChordQuizResult | null>(null)
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)

  const canCreateQuestion = canCreateChordQuizQuestion(quizRange)

  const selectedNotes = useMemo(
    () => getPitchClassLabels(selectedPitchClasses),
    [selectedPitchClasses],
  )

  function applyQuizRange(nextRange: ChordQuizRange) {
    setQuizRange(nextRange)

    if (!canCreateChordQuizQuestion(nextRange)) {
      if (!result) {
        setSelectedPitchClasses([])
      }
      return
    }

    if (!result) {
      setQuestion(createChordQuizQuestion(nextRange))
      setSelectedPitchClasses([])
    }
  }

  function handleToggleRoot(pitchClass: number) {
    const nextRange = {
      ...quizRange,
      rootPitchClasses: quizRange.rootPitchClasses.includes(pitchClass)
        ? quizRange.rootPitchClasses.filter((item) => item !== pitchClass)
        : [...quizRange.rootPitchClasses, pitchClass],
    }

    applyQuizRange(nextRange)
  }

  function handleToggleChordType(chordTypeId: string) {
    const nextRange = {
      ...quizRange,
      chordTypeIds: quizRange.chordTypeIds.includes(chordTypeId)
        ? quizRange.chordTypeIds.filter((item) => item !== chordTypeId)
        : [...quizRange.chordTypeIds, chordTypeId],
    }

    applyQuizRange(nextRange)
  }

  function handleSelectAllRoots() {
    applyQuizRange({
      ...quizRange,
      rootPitchClasses: pitchClassOptions.map((option) => option.pitchClass),
    })
  }

  function handleClearAllRoots() {
    applyQuizRange({ ...quizRange, rootPitchClasses: [] })
  }

  function handleSelectAllChordTypes() {
    applyQuizRange({
      ...quizRange,
      chordTypeIds: chordTypes.map((chordType) => chordType.id),
    })
  }

  function handleClearAllChordTypes() {
    applyQuizRange({ ...quizRange, chordTypeIds: [] })
  }

  function handleToggleAnswer(pitchClass: number) {
    if (result || !canCreateQuestion) {
      return
    }

    setSelectedPitchClasses((current) =>
      current.includes(pitchClass)
        ? current.filter((item) => item !== pitchClass)
        : [...current, pitchClass],
    )
  }

  function handleSubmit() {
    if (result || !canCreateQuestion || selectedPitchClasses.length === 0) {
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
    if (!canCreateQuestion) {
      return
    }

    setQuestion(createChordQuizQuestion(quizRange))
    setSelectedPitchClasses([])
    setResult(null)
  }

  return (
    <section className="scale-panel quiz-panel" aria-label="코드 퀴즈">
      <div className="section-heading">
        <div>
          <h2>코드 퀴즈</h2>
          <p>선택한 루트음과 코드 타입 범위 안에서 문제를 출제합니다.</p>
        </div>
        <div className="quiz-score" aria-label="현재 점수">
          {score} / {totalQuestions}
        </div>
      </div>

      <div className="quiz-settings" aria-label="코드 퀴즈 출제 범위">
        <div className="setting-group">
          <div className="setting-toolbar">
            <strong>루트음</strong>
            <div className="bulk-actions">
              <button
                type="button"
                className="bulk-action-button"
                onClick={handleSelectAllRoots}
              >
                전체 선택
              </button>
              <button
                type="button"
                className="bulk-action-button"
                onClick={handleClearAllRoots}
              >
                전체 해제
              </button>
            </div>
          </div>
          <div className="multi-select-grid key-range-grid">
            {pitchClassOptions.map((option) => (
              <button
                key={option.pitchClass}
                type="button"
                className={`key-button ${
                  quizRange.rootPitchClasses.includes(option.pitchClass)
                    ? 'selected'
                    : ''
                }`}
                aria-pressed={quizRange.rootPitchClasses.includes(
                  option.pitchClass,
                )}
                onClick={() => handleToggleRoot(option.pitchClass)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-group">
          <div className="setting-toolbar">
            <strong>코드 타입</strong>
            <div className="bulk-actions">
              <button
                type="button"
                className="bulk-action-button"
                onClick={handleSelectAllChordTypes}
              >
                전체 선택
              </button>
              <button
                type="button"
                className="bulk-action-button"
                onClick={handleClearAllChordTypes}
              >
                전체 해제
              </button>
            </div>
          </div>
          <div className="multi-select-grid chord-range-grid">
            {chordTypes.map((chordType) => (
              <button
                key={chordType.id}
                type="button"
                className={`mode-button ${
                  quizRange.chordTypeIds.includes(chordType.id) ? 'selected' : ''
                }`}
                aria-pressed={quizRange.chordTypeIds.includes(chordType.id)}
                onClick={() => handleToggleChordType(chordType.id)}
              >
                {chordType.label}
              </button>
            ))}
          </div>
        </div>

        {!canCreateQuestion && (
          <p className="range-warning" role="status">
            새 문제를 만들려면 루트음과 코드 타입을 각각 1개 이상 선택해야 합니다.
          </p>
        )}
      </div>

      {canCreateQuestion && (
        <>
          <div className="quiz-question">
            <span className="quiz-label">문제</span>
            <strong>{question.chordSymbol}의 구성음은?</strong>
          </div>

          <div className="selected-notes" aria-label="선택한 음">
            선택한 음:{' '}
            {selectedNotes.length > 0 ? selectedNotes.join(' - ') : '없음'}
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
        </>
      )}

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
          disabled={
            Boolean(result) || !canCreateQuestion || selectedPitchClasses.length === 0
          }
          onClick={handleSubmit}
        >
          제출
        </button>
        <button
          type="button"
          className="next-question-button"
          disabled={!result || !canCreateQuestion}
          onClick={handleNextQuestion}
        >
          다음 문제
        </button>
      </div>
    </section>
  )
}
