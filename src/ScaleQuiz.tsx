import { useMemo, useState } from 'react'
import { keyOptions, pitchClassOptions, scaleModeOptions } from './musicTheory'
import {
  canCreateScaleQuizQuestion,
  checkScaleQuizAnswer,
  createScaleQuizQuestion,
  getDefaultScaleQuizRange,
  type ScaleQuizRange,
  type ScaleQuizResult,
} from './scaleQuizLogic'

export function ScaleQuiz() {
  const [quizRange, setQuizRange] = useState<ScaleQuizRange>(() =>
    getDefaultScaleQuizRange(),
  )
  const [question, setQuestion] = useState(() =>
    createScaleQuizQuestion(getDefaultScaleQuizRange()),
  )
  const [selectedPitchClass, setSelectedPitchClass] = useState<number | null>(
    null,
  )
  const [result, setResult] = useState<ScaleQuizResult | null>(null)
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)

  const canCreateQuestion = canCreateScaleQuizQuestion(quizRange)

  const selectedAnswerLabel = useMemo(() => {
    if (selectedPitchClass === null) {
      return ''
    }

    return (
      pitchClassOptions.find((option) => option.pitchClass === selectedPitchClass)
        ?.label ?? ''
    )
  }, [selectedPitchClass])

  function applyQuizRange(nextRange: ScaleQuizRange) {
    setQuizRange(nextRange)

    if (!canCreateScaleQuizQuestion(nextRange)) {
      if (!result) {
        setSelectedPitchClass(null)
      }
      return
    }

    if (!result) {
      setQuestion(createScaleQuizQuestion(nextRange))
      setSelectedPitchClass(null)
    }
  }

  function handleToggleKey(tonic: string) {
    const nextRange = {
      ...quizRange,
      tonics: quizRange.tonics.includes(tonic)
        ? quizRange.tonics.filter((item) => item !== tonic)
        : [...quizRange.tonics, tonic],
    }

    applyQuizRange(nextRange)
  }

  function handleToggleMode(mode: ScaleQuizRange['modes'][number]) {
    const nextRange = {
      ...quizRange,
      modes: quizRange.modes.includes(mode)
        ? quizRange.modes.filter((item) => item !== mode)
        : [...quizRange.modes, mode],
    }

    applyQuizRange(nextRange)
  }

  function handleSelectAllKeys() {
    applyQuizRange({
      ...quizRange,
      tonics: keyOptions.map((key) => key.tonic),
    })
  }

  function handleClearAllKeys() {
    applyQuizRange({ ...quizRange, tonics: [] })
  }

  function handleSelectAllModes() {
    applyQuizRange({
      ...quizRange,
      modes: scaleModeOptions.map((modeOption) => modeOption.mode),
    })
  }

  function handleClearAllModes() {
    applyQuizRange({ ...quizRange, modes: [] })
  }

  function handleAnswer(pitchClass: number) {
    if (result || !canCreateQuestion) {
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
    if (!canCreateQuestion) {
      return
    }

    setQuestion(createScaleQuizQuestion(quizRange))
    setSelectedPitchClass(null)
    setResult(null)
  }

  return (
    <section className="scale-panel quiz-panel" aria-label="스케일 퀴즈">
      <div className="section-heading">
        <div>
          <h2>스케일 퀴즈</h2>
          <p>선택한 Key와 스케일 모드 범위 안에서 문제를 출제합니다.</p>
        </div>
        <div className="quiz-score" aria-label="현재 점수">
          {score} / {totalQuestions}
        </div>
      </div>

      <div className="quiz-settings" aria-label="스케일 퀴즈 출제 범위">
        <div className="setting-group">
          <div className="setting-toolbar">
            <strong>Key</strong>
            <div className="bulk-actions">
              <button
                type="button"
                className="bulk-action-button"
                onClick={handleSelectAllKeys}
              >
                전체 선택
              </button>
              <button
                type="button"
                className="bulk-action-button"
                onClick={handleClearAllKeys}
              >
                전체 해제
              </button>
            </div>
          </div>
          <div className="multi-select-grid key-range-grid">
            {keyOptions.map((key) => (
              <button
                key={key.tonic}
                type="button"
                className={`key-button ${
                  quizRange.tonics.includes(key.tonic) ? 'selected' : ''
                }`}
                aria-pressed={quizRange.tonics.includes(key.tonic)}
                onClick={() => handleToggleKey(key.tonic)}
              >
                {key.label}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-group">
          <div className="setting-toolbar">
            <strong>스케일 모드</strong>
            <div className="bulk-actions">
              <button
                type="button"
                className="bulk-action-button"
                onClick={handleSelectAllModes}
              >
                전체 선택
              </button>
              <button
                type="button"
                className="bulk-action-button"
                onClick={handleClearAllModes}
              >
                전체 해제
              </button>
            </div>
          </div>
          <div className="multi-select-grid mode-range-grid">
            {scaleModeOptions.map((modeOption) => (
              <button
                key={modeOption.mode}
                type="button"
                className={`mode-button ${
                  quizRange.modes.includes(modeOption.mode) ? 'selected' : ''
                }`}
                aria-pressed={quizRange.modes.includes(modeOption.mode)}
                onClick={() => handleToggleMode(modeOption.mode)}
              >
                {modeOption.fullLabel}
              </button>
            ))}
          </div>
        </div>

        {!canCreateQuestion && (
          <p className="range-warning" role="status">
            새 문제를 만들려면 Key와 스케일 모드를 각각 1개 이상 선택해야 합니다.
          </p>
        )}
      </div>

      {canCreateQuestion && (
        <>
          <div className="quiz-question">
            <span className="quiz-label">문제</span>
            <strong>
              {question.keyLabel} {question.modeLabel}의 {question.degree}도는?
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
          <span>
            선택한 답: {selectedAnswerLabel} / 정답: {result.correctAnswer}
          </span>
        </div>
      )}

      <button
        type="button"
        className="next-question-button"
        disabled={!result || !canCreateQuestion}
        onClick={handleNextQuestion}
      >
        다음 문제
      </button>
    </section>
  )
}
