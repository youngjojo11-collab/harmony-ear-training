import { useMemo, useState, type ReactNode } from 'react'
import { keyOptions, pitchClassOptions, scaleModeOptions } from './musicTheory'
import { KeySignatureStaff } from './KeySignatureStaff'
import {
  canCreateScaleQuizQuestion,
  checkScaleQuizAnswer,
  createScaleQuizQuestion,
  getDefaultScaleQuizRange,
  getScaleAnswerId,
  getScaleAnswerLabel,
  getScaleAnswerOptions,
  getSignatureAnswerId,
  getSignatureAnswerOptions,
  scaleQuizQuestionTypeOptions,
  type ScaleQuizQuestion,
  type ScaleQuizQuestionType,
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
  const [selectedPitchClasses, setSelectedPitchClasses] = useState<number[]>([])
  const [selectedPitchClass, setSelectedPitchClass] = useState<number | null>(
    null,
  )
  const [selectedScaleId, setSelectedScaleId] = useState<string | null>(null)
  const [selectedSignatureId, setSelectedSignatureId] = useState<string | null>(
    null,
  )
  const [result, setResult] = useState<ScaleQuizResult | null>(null)
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)

  const canCreateQuestion = canCreateScaleQuizQuestion(quizRange)
  const selectedNotes = useMemo(
    () => getPitchClassLabels(selectedPitchClasses),
    [selectedPitchClasses],
  )
  const scaleAnswerOptions = useMemo(
    () => getScaleAnswerOptions(quizRange),
    [quizRange],
  )
  const signatureAnswerOptions = useMemo(
    () => getSignatureAnswerOptions(quizRange),
    [quizRange],
  )
  const selectedScaleAnswerLabel =
    scaleAnswerOptions.find((option) => option.id === selectedScaleId)?.label ?? ''
  const selectedSignatureAnswerLabel =
    signatureAnswerOptions.find((option) => option.id === selectedSignatureId)
      ?.label ?? ''
  const selectedDegreeAnswerLabel = getPitchClassLabel(selectedPitchClass)

  function applyQuizRange(nextRange: ScaleQuizRange) {
    setQuizRange(nextRange)

    if (!canCreateScaleQuizQuestion(nextRange)) {
      if (!result) {
        clearCurrentAnswer()
      }
      return
    }

    if (!result) {
      setQuestion(createScaleQuizQuestion(nextRange))
      clearCurrentAnswer()
    }
  }

  function clearCurrentAnswer() {
    setSelectedPitchClasses([])
    setSelectedPitchClass(null)
    setSelectedScaleId(null)
    setSelectedSignatureId(null)
  }

  function handleToggleKey(tonic: string) {
    applyQuizRange({
      ...quizRange,
      tonics: quizRange.tonics.includes(tonic)
        ? quizRange.tonics.filter((item) => item !== tonic)
        : [...quizRange.tonics, tonic],
    })
  }

  function handleToggleMode(mode: ScaleQuizRange['modes'][number]) {
    applyQuizRange({
      ...quizRange,
      modes: quizRange.modes.includes(mode)
        ? quizRange.modes.filter((item) => item !== mode)
        : [...quizRange.modes, mode],
    })
  }

  function handleToggleQuestionType(questionType: ScaleQuizQuestionType) {
    applyQuizRange({
      ...quizRange,
      questionTypes: quizRange.questionTypes.includes(questionType)
        ? quizRange.questionTypes.filter((item) => item !== questionType)
        : [...quizRange.questionTypes, questionType],
    })
  }

  function handleToggleNoteAnswer(pitchClass: number) {
    if (result || !canCreateQuestion) {
      return
    }

    setSelectedPitchClasses((current) =>
      current.includes(pitchClass)
        ? current.filter((item) => item !== pitchClass)
        : [...current, pitchClass],
    )
  }

  function handleDegreeAnswer(pitchClass: number) {
    if (result || !canCreateQuestion) {
      return
    }

    setSelectedPitchClass(pitchClass)
  }

  function handleSubmit() {
    if (result || !canCreateQuestion || !hasAnswer()) {
      return
    }

    const nextResult = checkScaleQuizAnswer(question, {
      selectedPitchClasses,
      selectedPitchClass: selectedPitchClass ?? undefined,
      selectedScaleId: selectedScaleId ?? undefined,
      selectedSignatureId: selectedSignatureId ?? undefined,
    })
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
    clearCurrentAnswer()
    setResult(null)
  }

  function hasAnswer() {
    if (question.questionType === 'notes-to-scale') {
      return Boolean(selectedScaleId)
    }

    if (question.questionType === 'scale-to-degree') {
      return selectedPitchClass !== null
    }

    if (question.questionType === 'signature-to-key') {
      return Boolean(selectedScaleId)
    }

    if (question.questionType === 'key-to-signature') {
      return Boolean(selectedSignatureId)
    }

    return selectedPitchClasses.length > 0
  }

  return (
    <section className="scale-panel quiz-panel" aria-label="스케일 퀴즈">
      <div className="section-heading">
        <div>
          <h2>스케일 퀴즈</h2>
          <p>선택한 Key, 스케일 모드, 문제 유형 범위 안에서 출제합니다.</p>
        </div>
        <div className="quiz-score" aria-label="현재 점수">
          {score} / {totalQuestions}
        </div>
      </div>

      <div className="quiz-settings" aria-label="스케일 퀴즈 출제 범위">
        <SettingGroup title="Key" onSelectAll={handleSelectAllKeys} onClearAll={handleClearAllKeys}>
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
        </SettingGroup>

        <SettingGroup
          title="스케일 모드"
          onSelectAll={handleSelectAllModes}
          onClearAll={handleClearAllModes}
        >
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
        </SettingGroup>

        <SettingGroup
          title="문제 유형"
          onSelectAll={handleSelectAllQuestionTypes}
          onClearAll={handleClearAllQuestionTypes}
        >
          <div className="multi-select-grid scale-question-type-range-grid">
            {scaleQuizQuestionTypeOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`mode-button ${
                  quizRange.questionTypes.includes(option.id) ? 'selected' : ''
                }`}
                aria-pressed={quizRange.questionTypes.includes(option.id)}
                onClick={() => handleToggleQuestionType(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </SettingGroup>

        {!canCreateQuestion && (
          <p className="range-warning" role="status">
            새 문제를 만들려면 Key, 스케일 모드, 문제 유형을 각각 1개 이상
            선택해야 합니다.
          </p>
        )}
      </div>

      {canCreateQuestion && (
        <>
          <div className="quiz-question">
            <span className="quiz-label">문제</span>
            <strong>{getQuestionText(question, quizRange)}</strong>
            {question.questionType === 'signature-to-key' && (
              <KeySignatureStaff signature={question.keySignature} />
            )}
          </div>

          {question.questionType === 'scale-to-notes' && (
            <>
              <div className="selected-notes" aria-label="선택한 음">
                선택한 음:{' '}
                {selectedNotes.length > 0 ? selectedNotes.join(' - ') : '없음'}
              </div>
              <NoteAnswerGrid
                result={result}
                selectedPitchClasses={selectedPitchClasses}
                correctPitchClasses={question.scalePitchClasses}
                onSelect={handleToggleNoteAnswer}
              />
            </>
          )}

          {question.questionType === 'notes-to-scale' && (
            <>
              <div className="selected-notes" aria-label="선택한 스케일">
                선택한 스케일: {selectedScaleAnswerLabel || '없음'}
              </div>
              <ScaleAnswerGrid
                question={question}
                result={result}
                options={scaleAnswerOptions}
                selectedScaleId={selectedScaleId}
                onSelect={setSelectedScaleId}
              />
            </>
          )}

          {question.questionType === 'scale-to-degree' && (
            <>
              <div className="selected-notes" aria-label="선택한 음">
                선택한 음: {selectedDegreeAnswerLabel || '없음'}
              </div>
              <NoteAnswerGrid
                result={result}
                selectedPitchClass={selectedPitchClass}
                correctPitchClasses={
                  question.answerPitchClass === undefined
                    ? []
                    : [question.answerPitchClass]
                }
                onSelect={handleDegreeAnswer}
              />
            </>
          )}

          {question.questionType === 'signature-to-key' && (
            <>
              <div className="selected-notes" aria-label="선택한 Key">
                선택한 Key: {selectedScaleAnswerLabel || '없음'}
              </div>
              <ScaleAnswerGrid
                question={question}
                result={result}
                options={scaleAnswerOptions}
                selectedScaleId={selectedScaleId}
                onSelect={setSelectedScaleId}
              />
            </>
          )}

          {question.questionType === 'key-to-signature' && (
            <>
              <div className="selected-notes" aria-label="선택한 조표">
                선택한 조표: {selectedSignatureAnswerLabel || '없음'}
              </div>
              <div
                className="answer-grid signature-answer-grid"
                aria-label="조표 선택"
              >
                {signatureAnswerOptions.map((option) => {
                  if (!option.keySignature) {
                    return null
                  }

                  const isSelected = selectedSignatureId === option.id
                  const isCorrectAnswer =
                    result && option.id === getSignatureAnswerId(question)
                  const answerClassName = [
                    'answer-button',
                    'signature-answer-button',
                    isSelected ? 'selected' : '',
                    isCorrectAnswer ? 'correct' : '',
                    result && isSelected && !result.isCorrect ? 'incorrect' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')

                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={answerClassName}
                      disabled={Boolean(result)}
                      onClick={() => setSelectedSignatureId(option.id)}
                    >
                      <KeySignatureStaff signature={option.keySignature} compact />
                      <span>{option.label}</span>
                    </button>
                  )
                })}
              </div>
            </>
          )}
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
          <span>정답: {result.correctAnswer}</span>
        </div>
      )}

      <div className="quiz-actions">
        <button
          type="button"
          className="submit-answer-button"
          disabled={Boolean(result) || !canCreateQuestion || !hasAnswer()}
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

  function handleSelectAllQuestionTypes() {
    applyQuizRange({
      ...quizRange,
      questionTypes: scaleQuizQuestionTypeOptions.map((option) => option.id),
    })
  }

  function handleClearAllQuestionTypes() {
    applyQuizRange({ ...quizRange, questionTypes: [] })
  }
}

type SettingGroupProps = {
  title: string
  children: ReactNode
  onSelectAll: () => void
  onClearAll: () => void
}

function SettingGroup({
  title,
  children,
  onSelectAll,
  onClearAll,
}: SettingGroupProps) {
  return (
    <div className="setting-group">
      <div className="setting-toolbar">
        <strong>{title}</strong>
        <div className="bulk-actions">
          <button
            type="button"
            className="bulk-action-button"
            onClick={onSelectAll}
          >
            전체 선택
          </button>
          <button
            type="button"
            className="bulk-action-button"
            onClick={onClearAll}
          >
            전체 해제
          </button>
        </div>
      </div>
      {children}
    </div>
  )
}

type NoteAnswerGridProps = {
  result: ScaleQuizResult | null
  selectedPitchClasses?: number[]
  selectedPitchClass?: number | null
  correctPitchClasses: number[]
  onSelect: (pitchClass: number) => void
}

function NoteAnswerGrid({
  result,
  selectedPitchClasses,
  selectedPitchClass,
  correctPitchClasses,
  onSelect,
}: NoteAnswerGridProps) {
  return (
    <div className="answer-grid" aria-label="음 선택">
      {pitchClassOptions.map((option) => {
        const isSelected =
          selectedPitchClasses?.includes(option.pitchClass) ||
          selectedPitchClass === option.pitchClass
        const isCorrectAnswer =
          result && correctPitchClasses.includes(option.pitchClass)
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
            key={option.pitchClass}
            type="button"
            className={answerClassName}
            disabled={Boolean(result)}
            onClick={() => onSelect(option.pitchClass)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

type ScaleAnswerGridProps = {
  question: ScaleQuizQuestion
  result: ScaleQuizResult | null
  options: Array<{ id: string; label: string }>
  selectedScaleId: string | null
  onSelect: (scaleId: string) => void
}

function ScaleAnswerGrid({
  question,
  result,
  options,
  selectedScaleId,
  onSelect,
}: ScaleAnswerGridProps) {
  return (
    <div className="answer-grid scale-answer-grid" aria-label="스케일 선택">
      {options.map((option) => {
        const isSelected = selectedScaleId === option.id
        const isCorrectAnswer = result && option.id === getScaleAnswerId(question)
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
            key={option.id}
            type="button"
            className={answerClassName}
            disabled={Boolean(result)}
            onClick={() => onSelect(option.id)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function getQuestionText(
  question: ScaleQuizQuestion,
  range: ScaleQuizRange,
) {
  if (question.questionType === 'notes-to-scale') {
    return `${question.displayedNotes.join(', ')} → 스케일 이름은?`
  }

  if (question.questionType === 'scale-to-degree') {
    return `${question.keyLabel} ${question.modeLabel}의 ${question.degree}도는?`
  }

  if (question.questionType === 'signature-to-key') {
    const selectedModes = range.modes.length
    const modePrompt =
      selectedModes > 1
        ? question.mode === 'major'
          ? 'Major Key는?'
          : 'Natural Minor Key는?'
        : 'Key는?'

    return `다음 조표의 ${modePrompt}`
  }

  if (question.questionType === 'key-to-signature') {
    return `${getScaleAnswerLabel(question)}의 조표는?`
  }

  return `${question.keyLabel} ${question.modeLabel}의 구성음은?`
}

function getPitchClassLabels(pitchClasses: number[]) {
  return [...new Set(pitchClasses)]
    .sort((a, b) => a - b)
    .map((pitchClass) => getPitchClassLabel(pitchClass))
}

function getPitchClassLabel(pitchClass: number | null) {
  if (pitchClass === null) {
    return ''
  }

  return (
    pitchClassOptions.find((option) => option.pitchClass === pitchClass)?.label ?? ''
  )
}
