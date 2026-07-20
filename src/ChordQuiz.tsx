import { useMemo, useState } from 'react'
import { chordTypes, pitchClassOptions } from './musicTheory'
import {
  canCreateChordQuizQuestion,
  checkChordQuizAnswer,
  chordQuizQuestionTypeOptions,
  createChordQuizQuestion,
  getChordAnswerId,
  getChordAnswerOptions,
  getDefaultChordQuizRange,
  getPitchClassLabels,
  type ChordQuizQuestionType,
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
  const [selectedPitchClass, setSelectedPitchClass] = useState<number | null>(
    null,
  )
  const [selectedChordId, setSelectedChordId] = useState<string | null>(null)
  const [result, setResult] = useState<ChordQuizResult | null>(null)
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)

  const canCreateQuestion = canCreateChordQuizQuestion(quizRange)

  const selectedNotes = useMemo(
    () => getPitchClassLabels(selectedPitchClasses),
    [selectedPitchClasses],
  )
  const chordAnswerOptions = useMemo(
    () => getChordAnswerOptions(quizRange),
    [quizRange],
  )
  const selectedDegreeAnswerLabel = useMemo(() => {
    if (selectedPitchClass === null) {
      return ''
    }

    return (
      pitchClassOptions.find((option) => option.pitchClass === selectedPitchClass)
        ?.label ?? ''
    )
  }, [selectedPitchClass])
  const selectedChordAnswerLabel =
    chordAnswerOptions.find((option) => option.id === selectedChordId)?.label ?? ''

  function applyQuizRange(nextRange: ChordQuizRange) {
    setQuizRange(nextRange)

    if (!canCreateChordQuizQuestion(nextRange)) {
      if (!result) {
        clearCurrentAnswer()
      }
      return
    }

    if (!result) {
      setQuestion(createChordQuizQuestion(nextRange))
      clearCurrentAnswer()
    }
  }

  function clearCurrentAnswer() {
    setSelectedPitchClasses([])
    setSelectedPitchClass(null)
    setSelectedChordId(null)
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

  function handleToggleQuestionType(questionType: ChordQuizQuestionType) {
    const nextRange = {
      ...quizRange,
      questionTypes: quizRange.questionTypes.includes(questionType)
        ? quizRange.questionTypes.filter((item) => item !== questionType)
        : [...quizRange.questionTypes, questionType],
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

  function handleSelectAllQuestionTypes() {
    applyQuizRange({
      ...quizRange,
      questionTypes: chordQuizQuestionTypeOptions.map((option) => option.id),
    })
  }

  function handleClearAllQuestionTypes() {
    applyQuizRange({ ...quizRange, questionTypes: [] })
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

  function handleChordAnswer(chordId: string) {
    if (result || !canCreateQuestion) {
      return
    }

    setSelectedChordId(chordId)
  }

  function handleSubmit() {
    if (result || !canCreateQuestion || !hasAnswer()) {
      return
    }

    const nextResult = checkChordQuizAnswer(question, {
      selectedPitchClasses,
      selectedPitchClass: selectedPitchClass ?? undefined,
      selectedChordId: selectedChordId ?? undefined,
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

    setQuestion(createChordQuizQuestion(quizRange))
    clearCurrentAnswer()
    setResult(null)
  }

  function hasAnswer() {
    if (question.questionType === 'notes-to-chord') {
      return Boolean(selectedChordId)
    }

    if (question.questionType === 'chord-to-degree') {
      return selectedPitchClass !== null
    }

    return selectedPitchClasses.length > 0
  }

  return (
    <section className="scale-panel quiz-panel" aria-label="코드 퀴즈">
      <div className="section-heading">
        <div>
          <h2>코드 퀴즈</h2>
          <p>선택한 루트음, 코드 타입, 문제 유형 범위 안에서 출제합니다.</p>
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

        <div className="setting-group">
          <div className="setting-toolbar">
            <strong>문제 유형</strong>
            <div className="bulk-actions">
              <button
                type="button"
                className="bulk-action-button"
                onClick={handleSelectAllQuestionTypes}
              >
                전체 선택
              </button>
              <button
                type="button"
                className="bulk-action-button"
                onClick={handleClearAllQuestionTypes}
              >
                전체 해제
              </button>
            </div>
          </div>
          <div className="multi-select-grid question-type-range-grid">
            {chordQuizQuestionTypeOptions.map((option) => (
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
        </div>

        {!canCreateQuestion && (
          <p className="range-warning" role="status">
            새 문제를 만들려면 루트음, 코드 타입, 문제 유형을 각각 1개 이상
            선택해야 합니다.
          </p>
        )}
      </div>

      {canCreateQuestion && (
        <>
          <div className="quiz-question">
            <span className="quiz-label">문제</span>
            <strong>{getQuestionText(question)}</strong>
          </div>

          {question.questionType === 'chord-to-notes' && (
            <>
              <div className="selected-notes" aria-label="선택한 음">
                선택한 음:{' '}
                {selectedNotes.length > 0 ? selectedNotes.join(' - ') : '없음'}
              </div>
              <NoteAnswerGrid
                result={result}
                selectedPitchClasses={selectedPitchClasses}
                correctPitchClasses={question.answerPitchClasses}
                onSelect={handleToggleNoteAnswer}
              />
            </>
          )}

          {question.questionType === 'notes-to-chord' && (
            <>
              <div className="selected-notes" aria-label="선택한 코드">
                선택한 코드: {selectedChordAnswerLabel || '없음'}
              </div>
              <div className="answer-grid chord-answer-grid" aria-label="코드명 선택">
                {chordAnswerOptions.map((option) => {
                  const isSelected = selectedChordId === option.id
                  const isCorrectAnswer =
                    result && option.id === getChordAnswerId(question)
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
                      onClick={() => handleChordAnswer(option.id)}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {question.questionType === 'chord-to-degree' && (
            <>
              <div className="selected-notes" aria-label="선택한 음">
                선택한 음: {selectedDegreeAnswerLabel || '없음'}
              </div>
              <NoteAnswerGrid
                result={result}
                selectedPitchClass={selectedPitchClass}
                correctPitchClasses={
                  question.degreeAnswerPitchClass === undefined
                    ? []
                    : [question.degreeAnswerPitchClass]
                }
                onSelect={handleDegreeAnswer}
              />
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
}

type NoteAnswerGridProps = {
  result: ChordQuizResult | null
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

function getQuestionText(question: {
  questionType: ChordQuizQuestionType
  chordSymbol: string
  displayedNotes: string[]
  degreeLabel?: string
}) {
  if (question.questionType === 'notes-to-chord') {
    return `${question.displayedNotes.join(', ')} → 코드 이름은?`
  }

  if (question.questionType === 'chord-to-degree') {
    return `${question.chordSymbol}의 ${question.degreeLabel}음은?`
  }

  return `${question.chordSymbol}의 구성음은?`
}
