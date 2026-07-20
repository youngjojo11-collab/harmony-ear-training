import { useEffect, useMemo, useState } from 'react'
import {
  playPianoNoteSequence,
  playPianoNotes,
  preloadPianoSamples,
} from './audioEngine'
import {
  checkPitchAnswer,
  createPitchQuestion,
  getAverageResponseTimeMs,
  getQuestionAnswerNames,
  getQuestionMidiNotes,
  initialPitchStatsByNote,
  pitchAnswerOptions,
  pitchModeOptions,
  pitchQuestionTypeOptions,
  pitchRangeOptions,
  pitchSequenceLengthOptions,
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
    sequenceLength: 2,
  })
  const [question, setQuestion] = useState(() => createPitchQuestion(settings))
  const [selectedNoteNames, setSelectedNoteNames] = useState<string[]>([])
  const [result, setResult] = useState<PitchTestResult | null>(null)
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [responseTimesMs, setResponseTimesMs] = useState<number[]>([])
  const [statsByNote, setStatsByNote] = useState(initialPitchStatsByNote)
  const [sampleStatus, setSampleStatus] = useState<'loading' | 'ready'>(
    'loading',
  )

  useEffect(() => {
    let isMounted = true

    preloadPianoSamples()
      .then(() => {
        if (isMounted) {
          setSampleStatus('ready')
        }
      })
      .catch(() => {
        if (isMounted) {
          setSampleStatus('ready')
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

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
  const requiredAnswerCount = getRequiredAnswerCount(settings)
  const selectedAnswerText =
    selectedNoteNames.length > 0 ? selectedNoteNames.join(' - ') : '없음'
  const isSequence = settings.questionType === 'sequence'

  function handleQuestionTypeChange(questionType: PitchQuestionType) {
    const nextSettings = { ...settings, questionType }
    setSettings(nextSettings)
    resetCurrentQuestion(nextSettings)
  }

  function handleSequenceLengthChange(sequenceLength: number) {
    const nextSettings = { ...settings, sequenceLength }
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

  function handleAnswer(noteName: string) {
    if (result) {
      return
    }

    setSelectedNoteNames((current) => {
      if (isSequence) {
        return current.length >= requiredAnswerCount
          ? current
          : [...current, noteName]
      }

      if (current.includes(noteName)) {
        return current.filter((item) => item !== noteName)
      }

      if (current.length >= requiredAnswerCount) {
        return [...current.slice(1), noteName]
      }

      return [...current, noteName]
    })
  }

  function handleUndoAnswer() {
    if (result) {
      return
    }

    setSelectedNoteNames((current) => current.slice(0, -1))
  }

  function handleClearAnswer() {
    if (result) {
      return
    }

    setSelectedNoteNames([])
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

  function handlePlayQuestion() {
    const midiNotes = getQuestionMidiNotes(question)

    if (isSequence) {
      void playPianoNoteSequence(midiNotes, 0.85, 1.45)
      return
    }

    void playPianoNotes(midiNotes, 2)
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
          선택한 난이도와 음역 안에서 단음, 동시 2음, 연속음이 랜덤으로
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
            <div className="type-toggle" role="group" aria-label="테스트 유형">
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

          {isSequence && (
            <div>
              <span className="setting-label">연속음 개수</span>
              <div className="sequence-length-grid" role="group" aria-label="연속음 개수">
                {pitchSequenceLengthOptions.map((length) => (
                  <button
                    key={length}
                    type="button"
                    className={
                      settings.sequenceLength === length
                        ? 'key-button selected'
                        : 'key-button'
                    }
                    onClick={() => handleSequenceLengthChange(length)}
                  >
                    {length}개
                  </button>
                ))}
              </div>
            </div>
          )}

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
            <h2>{getQuestionTypeLabel(settings.questionType)}</h2>
            <p>{getQuestionDescription(settings)}</p>
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
          <strong>{getQuestionPrompt(settings.questionType)}</strong>
        </div>

        <button
          type="button"
          className="play-note-button"
          disabled={sampleStatus !== 'ready'}
          onClick={handlePlayQuestion}
        >
          {sampleStatus === 'loading' ? '피아노 샘플 로딩 중' : '음 재생'}
        </button>
        <div className="selected-notes" aria-label="현재 입력된 음 순서">
          입력한 음: {selectedAnswerText}
        </div>

        {isSequence && (
          <div className="answer-edit-actions">
            <button
              type="button"
              className="secondary-action-button"
              disabled={Boolean(result) || selectedNoteNames.length === 0}
              onClick={handleUndoAnswer}
            >
              하나씩 되돌리기
            </button>
            <button
              type="button"
              className="secondary-action-button"
              disabled={Boolean(result) || selectedNoteNames.length === 0}
              onClick={handleClearAnswer}
            >
              전체 초기화
            </button>
          </div>
        )}

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
              입력한 답: {selectedAnswerText} / 정답 순서:{' '}
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

function getRequiredAnswerCount(settings: PitchTestSettings) {
  if (settings.questionType === 'dyad') {
    return 2
  }

  if (settings.questionType === 'sequence') {
    return settings.sequenceLength
  }

  return 1
}

function getQuestionTypeLabel(questionType: PitchQuestionType) {
  if (questionType === 'dyad') {
    return '동시 2음 테스트'
  }

  if (questionType === 'sequence') {
    return '연속음 테스트'
  }

  return '단음 테스트'
}

function getQuestionDescription(settings: PitchTestSettings) {
  if (settings.questionType === 'dyad') {
    return '서로 다른 두 음을 동시에 재생합니다.'
  }

  if (settings.questionType === 'sequence') {
    return `${settings.sequenceLength}개 음을 0.6초 간격으로 순서대로 재생합니다.`
  }

  return '같은 음이 연속으로 나올 수 있습니다.'
}

function getQuestionPrompt(questionType: PitchQuestionType) {
  if (questionType === 'dyad') {
    return '동시에 재생된 두 음은 무엇인가요?'
  }

  if (questionType === 'sequence') {
    return '순서대로 재생된 음은 무엇인가요?'
  }

  return '재생된 음은 무엇인가요?'
}

function formatResponseTime(responseTimeMs: number) {
  return `${(responseTimeMs / 1000).toFixed(1)}초`
}
