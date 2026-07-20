import { useMemo, useState } from 'react'
import { playSineTones } from './audioEngine'
import {
  checkPitchAnswer,
  createPitchQuestion,
  getAverageResponseTimeMs,
  getQuestionAnswerNames,
  getQuestionFrequencies,
  initialPitchStatsByNote,
  pitchAnswerOptions,
  pitchModeOptions,
  pitchQuestionTypeOptions,
  pitchRangeOptions,
  updatePitchStatsByNote,
  type PitchQuestionType,
  type PitchRangeId,
  type PitchTestMode,
  type PitchTestResult,
  type PitchTestSettings,
} from './pitchTestLogic'

export function PitchTest() {
  const [settings, setSettings] = useState<PitchTestSettings>({
    mode: 'white',
    rangeId: 'c4-b4',
    questionType: 'single',
  })
  const [question, setQuestion] = useState(() => createPitchQuestion(settings))
  const [selectedNoteNames, setSelectedNoteNames] = useState<string[]>([])
  const [result, setResult] = useState<PitchTestResult | null>(null)
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [responseTimesMs, setResponseTimesMs] = useState<number[]>([])
  const [statsByNote, setStatsByNote] = useState(initialPitchStatsByNote)

  const accuracy = useMemo(() => {
    if (totalQuestions === 0) {
      return 0
    }

    return Math.round((score / totalQuestions) * 100)
  }, [score, totalQuestions])

  const averageResponseTimeMs = useMemo(
    () => getAverageResponseTimeMs(responseTimesMs),
    [responseTimesMs],
  )
  const requiredAnswerCount = settings.questionType === 'dyad' ? 2 : 1
  const selectedAnswerText =
    selectedNoteNames.length > 0 ? selectedNoteNames.join(' - ') : '없음'

  function handleQuestionTypeChange(questionType: PitchQuestionType) {
    const nextSettings = { ...settings, questionType }
    setSettings(nextSettings)
    resetCurrentQuestion(nextSettings)
  }

  function handleModeChange(mode: PitchTestMode) {
    const nextSettings = { ...settings, mode }
    setSettings(nextSettings)
    resetCurrentQuestion(nextSettings)
  }

  function handleRangeChange(rangeId: PitchRangeId) {
    const nextSettings = { ...settings, rangeId }
    setSettings(nextSettings)
    resetCurrentQuestion(nextSettings)
  }

  function handleToggleAnswer(noteName: string) {
    if (result) {
      return
    }

    setSelectedNoteNames((current) => {
      if (current.includes(noteName)) {
        return current.filter((item) => item !== noteName)
      }

      if (current.length >= requiredAnswerCount) {
        return [...current.slice(1), noteName]
      }

      return [...current, noteName]
    })
  }

  function handleSubmitAnswer() {
    if (result || selectedNoteNames.length !== requiredAnswerCount) {
      return
    }

    const nextResult = checkPitchAnswer(question, selectedNoteNames)
    setResult(nextResult)
    setTotalQuestions((current) => current + 1)
    setResponseTimesMs((current) => [...current, nextResult.responseTimeMs])
    setStatsByNote((current) =>
      updatePitchStatsByNote(current, question, nextResult),
    )

    if (nextResult.isCorrect) {
      setScore((current) => current + 1)
    }
  }

  function handleNextQuestion() {
    resetCurrentQuestion(settings)
  }

  function resetCurrentQuestion(nextSettings: PitchTestSettings) {
    setQuestion(createPitchQuestion(nextSettings))
    setSelectedNoteNames([])
    setResult(null)
  }

  return (
    <main className="app-shell scale-shell">
      <section className="scale-header" aria-labelledby="pitch-title">
        <p className="eyebrow">Absolute Pitch</p>
        <h1 id="pitch-title">절대음감 테스트</h1>
        <p className="hero-copy">
          선택한 난이도와 음역 안에서 단음 또는 서로 다른 두 음이 랜덤으로
          출제됩니다. 기준음 없이 들리는 음이름을 선택합니다.
        </p>
      </section>

      <section className="scale-panel" aria-label="난이도 설정">
        <div className="section-heading">
          <h2>난이도 설정</h2>
          <p>테스트 유형, 모드, 음역</p>
        </div>

        <div className="settings-stack">
          <div>
            <span className="setting-label">테스트 유형</span>
            <div className="view-toggle compact-toggle" role="group" aria-label="테스트 유형">
              {pitchQuestionTypeOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={
                    settings.questionType === option.id
                      ? 'view-button selected'
                      : 'view-button'
                  }
                  onClick={() => handleQuestionTypeChange(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="setting-label">모드</span>
            <div className="view-toggle compact-toggle" role="group" aria-label="모드">
              {pitchModeOptions.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className={
                    settings.mode === mode.id
                      ? 'view-button selected'
                      : 'view-button'
                  }
                  onClick={() => handleModeChange(mode.id)}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="setting-label">음역</span>
            <div className="range-grid" role="group" aria-label="음역">
              {pitchRangeOptions.map((range) => (
                <button
                  key={range.id}
                  type="button"
                  className={
                    settings.rangeId === range.id
                      ? 'key-button selected'
                      : 'key-button'
                  }
                  onClick={() => handleRangeChange(range.id)}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="scale-panel quiz-panel" aria-label="절대음감 테스트">
        <div className="section-heading">
          <div>
            <h2>
              {settings.questionType === 'dyad' ? '동시 2음 테스트' : '단음 테스트'}
            </h2>
            <p>
              {settings.questionType === 'dyad'
                ? '서로 다른 두 음을 동시에 재생합니다.'
                : '같은 음이 연속으로 나올 수 있습니다.'}
            </p>
          </div>
          <div className="pitch-metrics">
            <div className="quiz-score" aria-label="정답률과 총 문제 수">
              {accuracy}% / {totalQuestions}
            </div>
            <div className="response-time">
              평균 {formatResponseTime(averageResponseTimeMs)}
            </div>
          </div>
        </div>

        <div className="quiz-question">
          <span className="quiz-label">문제</span>
          <strong>
            {settings.questionType === 'dyad'
              ? '동시에 재생된 두 음은 무엇인가요?'
              : '재생된 음은 무엇인가요?'}
          </strong>
        </div>

        <button
          type="button"
          className="play-note-button"
          onClick={() => void playSineTones(getQuestionFrequencies(question))}
        >
          음 재생
        </button>

        <div className="selected-notes" aria-label="선택한 음">
          선택한 음: {selectedAnswerText}
        </div>

        <div className="answer-grid" aria-label="음 이름 선택">
          {pitchAnswerOptions.map((noteName) => {
            const isSelected = selectedNoteNames.includes(noteName)
            const isCorrectAnswer =
              result && getQuestionAnswerNames(question).includes(noteName)
            const answerClassName = [
              'answer-button',
              isSelected ? 'selected' : '',
              isCorrectAnswer ? 'correct' : '',
              result && isSelected && !isCorrectAnswer ? 'incorrect' : '',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <button
                key={noteName}
                type="button"
                className={answerClassName}
                disabled={Boolean(result)}
                onClick={() => handleToggleAnswer(noteName)}
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
              선택한 답: {selectedAnswerText} / 정답:{' '}
              {result.correctAnswers.join(' - ')}
            </span>
            <span>응답시간: {formatResponseTime(result.responseTimeMs)}</span>
          </div>
        )}

        <div className="quiz-actions">
          <button
            type="button"
            className="submit-answer-button"
            disabled={Boolean(result) || selectedNoteNames.length !== requiredAnswerCount}
            onClick={handleSubmitAnswer}
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

      <section className="scale-panel" aria-label="음별 정답률">
        <div className="section-heading">
          <h2>음별 정답률</h2>
          <p>현재 세션 기준</p>
        </div>
        <div className="note-stats-grid">
          {pitchAnswerOptions.map((noteName) => {
            const stat = statsByNote[noteName]
            const noteAccuracy =
              stat.attempts === 0
                ? 0
                : Math.round((stat.correct / stat.attempts) * 100)

            return (
              <div key={noteName} className="note-stat-card">
                <strong>{noteName}</strong>
                <span>
                  {noteAccuracy}% ({stat.correct}/{stat.attempts})
                </span>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}

function formatResponseTime(responseTimeMs: number) {
  return `${(responseTimeMs / 1000).toFixed(1)}초`
}
