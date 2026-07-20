import {
  getScaleModeFullLabel,
  getScalePitchClasses,
  keyOptions,
  scaleModeOptions,
  type ScaleMode,
} from './musicTheory'

export type ScaleQuizQuestionType =
  | 'scale-to-notes'
  | 'notes-to-scale'
  | 'scale-to-degree'
  | 'signature-to-key'
  | 'key-to-signature'

export type KeySignature = {
  accidental: 'sharp' | 'flat' | 'none'
  count: number
  notes: string[]
}

export type ScaleQuizQuestion = {
  questionType: ScaleQuizQuestionType
  keyLabel: string
  tonic: string
  mode: ScaleMode
  modeLabel: string
  scaleNotes: string[]
  scalePitchClasses: number[]
  displayedNotes: string[]
  degree?: number
  answerNote?: string
  answerPitchClass?: number
  keySignature: KeySignature
}

export type ScaleAnswerOption = {
  id: string
  label: string
  keySignature?: KeySignature
}

export type ScaleQuizAnswer = {
  selectedPitchClasses?: number[]
  selectedPitchClass?: number
  selectedScaleId?: string
  selectedSignatureId?: string
}

export type ScaleQuizResult = {
  isCorrect: boolean
  correctAnswer: string
}

export type ScaleQuizRange = {
  tonics: string[]
  modes: ScaleMode[]
  questionTypes: ScaleQuizQuestionType[]
}

export const scaleQuizQuestionTypeOptions: Array<{
  id: ScaleQuizQuestionType
  label: string
}> = [
  { id: 'scale-to-notes', label: '스케일 → 구성음' },
  { id: 'notes-to-scale', label: '구성음 → 스케일' },
  { id: 'scale-to-degree', label: '스케일 → 도수음' },
  { id: 'signature-to-key', label: '조표 → Key' },
  { id: 'key-to-signature', label: 'Key → 조표' },
]

const sharpOrder = ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#']
const flatOrder = ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb']

const majorSignatureByTonic: Record<string, number> = {
  C: 0,
  Db: -5,
  D: 2,
  Eb: -3,
  E: 4,
  F: -1,
  Gb: -6,
  G: 1,
  Ab: -4,
  A: 3,
  Bb: -2,
  B: 5,
}

const minorSignatureByTonic: Record<string, number> = {
  C: -3,
  Db: 4,
  D: -1,
  Eb: -6,
  E: 1,
  F: -4,
  Gb: 3,
  G: -2,
  Ab: 5,
  A: 0,
  Bb: -5,
  B: 2,
}

export function getDefaultScaleQuizRange(): ScaleQuizRange {
  return {
    tonics: keyOptions.map((key) => key.tonic),
    modes: scaleModeOptions.map((modeOption) => modeOption.mode),
    questionTypes: scaleQuizQuestionTypeOptions.map((option) => option.id),
  }
}

export function canCreateScaleQuizQuestion(range: ScaleQuizRange) {
  return (
    range.tonics.length > 0 &&
    range.modes.length > 0 &&
    range.questionTypes.length > 0
  )
}

export function createScaleQuizQuestion(
  range: ScaleQuizRange = getDefaultScaleQuizRange(),
  random: () => number = Math.random,
): ScaleQuizQuestion {
  const availableKeys = keyOptions.filter((key) => range.tonics.includes(key.tonic))
  const availableModes = scaleModeOptions.filter((modeOption) =>
    range.modes.includes(modeOption.mode),
  )
  const availableQuestionTypes = scaleQuizQuestionTypeOptions.filter((option) =>
    range.questionTypes.includes(option.id),
  )

  if (
    availableKeys.length === 0 ||
    availableModes.length === 0 ||
    availableQuestionTypes.length === 0
  ) {
    throw new Error(
      'Scale quiz requires at least one key, scale mode, and question type',
    )
  }

  const key = availableKeys[getRandomIndex(availableKeys.length, random)]
  const modeOption = availableModes[getRandomIndex(availableModes.length, random)]
  const questionType =
    availableQuestionTypes[getRandomIndex(availableQuestionTypes.length, random)]
      .id
  const scale = getScalePitchClasses(key.tonic, modeOption.mode)
  const degree =
    questionType === 'scale-to-degree' ? getRandomIndex(7, random) + 1 : undefined
  const degreeAnswer = scale.find((scaleNote) => scaleNote.degree === degree)
  const scaleNotes = scale.map((scaleNote) => scaleNote.note)

  return {
    questionType,
    keyLabel: key.label,
    tonic: key.tonic,
    mode: modeOption.mode,
    modeLabel: getScaleModeFullLabel(modeOption.mode),
    scaleNotes,
    scalePitchClasses: scale.map((scaleNote) => scaleNote.pitchClass),
    displayedNotes:
      questionType === 'notes-to-scale' ? shuffleItems(scaleNotes, random) : [],
    degree,
    answerNote: degreeAnswer?.note,
    answerPitchClass: degreeAnswer?.pitchClass,
    keySignature: getKeySignature(key.tonic, modeOption.mode),
  }
}

export function checkScaleQuizAnswer(
  question: ScaleQuizQuestion,
  answer: ScaleQuizAnswer,
): ScaleQuizResult {
  if (question.questionType === 'notes-to-scale') {
    return {
      isCorrect: answer.selectedScaleId === getScaleAnswerId(question),
      correctAnswer: getScaleAnswerLabel(question),
    }
  }

  if (question.questionType === 'scale-to-degree') {
    return {
      isCorrect: answer.selectedPitchClass === question.answerPitchClass,
      correctAnswer: question.answerNote ?? '',
    }
  }

  if (question.questionType === 'signature-to-key') {
    return {
      isCorrect: answer.selectedScaleId === getScaleAnswerId(question),
      correctAnswer: getScaleAnswerLabel(question),
    }
  }

  if (question.questionType === 'key-to-signature') {
    return {
      isCorrect: answer.selectedSignatureId === getSignatureAnswerId(question),
      correctAnswer: getKeySignatureLabel(question.keySignature),
    }
  }

  const expected = normalizePitchClasses(question.scalePitchClasses)
  const selected = normalizePitchClasses(answer.selectedPitchClasses ?? [])

  return {
    isCorrect:
      expected.length === selected.length &&
      expected.every((pitchClass, index) => pitchClass === selected[index]),
    correctAnswer: question.scaleNotes.join(' - '),
  }
}

export function getScaleAnswerOptions(range: ScaleQuizRange): ScaleAnswerOption[] {
  const availableKeys = keyOptions.filter((key) => range.tonics.includes(key.tonic))
  const availableModes = scaleModeOptions.filter((modeOption) =>
    range.modes.includes(modeOption.mode),
  )

  return availableKeys.flatMap((key) =>
    availableModes.map((modeOption) => ({
      id: createScaleAnswerId(key.tonic, modeOption.mode),
      label: `${key.label} ${getScaleModeFullLabel(modeOption.mode)}`,
    })),
  )
}

export function getSignatureAnswerOptions(
  range: ScaleQuizRange,
): ScaleAnswerOption[] {
  const signatureMap = new Map<string, ScaleAnswerOption>()

  keyOptions
    .filter((key) => range.tonics.includes(key.tonic))
    .forEach((key) => {
      range.modes.forEach((mode) => {
        const keySignature = getKeySignature(key.tonic, mode)
        const id = getSignatureId(keySignature)

        if (!signatureMap.has(id)) {
          signatureMap.set(id, {
            id,
            label: getKeySignatureLabel(keySignature),
            keySignature,
          })
        }
      })
    })

  return [...signatureMap.values()].sort(
    (a, b) =>
      getSignatureSortValue(a.keySignature) - getSignatureSortValue(b.keySignature),
  )
}

export function getScaleAnswerId(question: ScaleQuizQuestion) {
  return createScaleAnswerId(question.tonic, question.mode)
}

export function getSignatureAnswerId(question: ScaleQuizQuestion) {
  return getSignatureId(question.keySignature)
}

export function getScaleAnswerLabel(question: ScaleQuizQuestion) {
  return `${question.keyLabel} ${question.modeLabel}`
}

export function getKeySignature(tonic: string, mode: ScaleMode): KeySignature {
  const signatureValue =
    mode === 'major' ? majorSignatureByTonic[tonic] : minorSignatureByTonic[tonic]

  if (signatureValue === undefined) {
    throw new Error(`Invalid key signature target: ${tonic} ${mode}`)
  }

  if (signatureValue > 0) {
    return {
      accidental: 'sharp',
      count: signatureValue,
      notes: sharpOrder.slice(0, signatureValue),
    }
  }

  if (signatureValue < 0) {
    return {
      accidental: 'flat',
      count: Math.abs(signatureValue),
      notes: flatOrder.slice(0, Math.abs(signatureValue)),
    }
  }

  return {
    accidental: 'none',
    count: 0,
    notes: [],
  }
}

export function getKeySignatureLabel(keySignature: KeySignature) {
  if (keySignature.count === 0) {
    return '조표 없음'
  }

  const accidentalLabel = keySignature.accidental === 'sharp' ? '#' : 'b'

  return `${accidentalLabel} ${keySignature.count}개 (${keySignature.notes.join(
    ', ',
  )})`
}

function getSignatureId(keySignature: KeySignature) {
  return `${keySignature.accidental}:${keySignature.count}`
}

function getSignatureSortValue(keySignature?: KeySignature) {
  if (!keySignature || keySignature.accidental === 'none') {
    return 0
  }

  return keySignature.accidental === 'sharp'
    ? keySignature.count
    : -keySignature.count
}

function createScaleAnswerId(tonic: string, mode: ScaleMode) {
  return `${tonic}:${mode}`
}

function normalizePitchClasses(pitchClasses: number[]) {
  return [...new Set(pitchClasses)].sort((a, b) => a - b)
}

function shuffleItems<T>(items: T[], random: () => number) {
  return [...items]
    .map((item) => ({ item, sort: random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item)
}

function getRandomIndex(length: number, random: () => number) {
  return Math.floor(random() * length)
}
