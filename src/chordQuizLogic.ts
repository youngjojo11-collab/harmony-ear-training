import {
  chordTypes,
  getChord,
  getPitchClassLabel,
  pitchClassOptions,
} from './musicTheory'

export type ChordQuizQuestionType =
  | 'chord-to-notes'
  | 'notes-to-chord'
  | 'chord-to-degree'

export type ChordQuizQuestion = {
  questionType: ChordQuizQuestionType
  rootPitchClass: number
  rootLabel: string
  chordTypeId: string
  chordLabel: string
  chordSymbol: string
  answerPitchClasses: number[]
  answerNotes: string[]
  displayedNotes: string[]
  degreeLabel?: string
  degreeAnswerPitchClass?: number
  degreeAnswerNote?: string
}

export type ChordAnswerOption = {
  id: string
  label: string
}

export type ChordQuizAnswer = {
  selectedPitchClasses?: number[]
  selectedChordId?: string
  selectedPitchClass?: number
}

export type ChordQuizResult = {
  isCorrect: boolean
  correctAnswer: string
}

export type ChordQuizRange = {
  rootPitchClasses: number[]
  chordTypeIds: string[]
  questionTypes: ChordQuizQuestionType[]
}

export const chordQuizQuestionTypeOptions: Array<{
  id: ChordQuizQuestionType
  label: string
}> = [
  { id: 'chord-to-notes', label: '코드 → 구성음' },
  { id: 'notes-to-chord', label: '구성음 → 코드' },
  { id: 'chord-to-degree', label: '코드 → 도수음' },
]

export function getDefaultChordQuizRange(): ChordQuizRange {
  return {
    rootPitchClasses: pitchClassOptions.map((option) => option.pitchClass),
    chordTypeIds: chordTypes.map((chordType) => chordType.id),
    questionTypes: chordQuizQuestionTypeOptions.map((option) => option.id),
  }
}

export function canCreateChordQuizQuestion(range: ChordQuizRange) {
  return (
    range.rootPitchClasses.length > 0 &&
    range.chordTypeIds.length > 0 &&
    range.questionTypes.length > 0
  )
}

export function createChordQuizQuestion(
  range: ChordQuizRange = getDefaultChordQuizRange(),
  random: () => number = Math.random,
): ChordQuizQuestion {
  const availableRoots = pitchClassOptions.filter((option) =>
    range.rootPitchClasses.includes(option.pitchClass),
  )
  const availableChordTypes = chordTypes.filter((chordType) =>
    range.chordTypeIds.includes(chordType.id),
  )
  const availableQuestionTypes = chordQuizQuestionTypeOptions.filter((option) =>
    range.questionTypes.includes(option.id),
  )

  if (
    availableRoots.length === 0 ||
    availableChordTypes.length === 0 ||
    availableQuestionTypes.length === 0
  ) {
    throw new Error(
      'Chord quiz requires at least one root, chord type, and question type',
    )
  }

  const root = availableRoots[getRandomIndex(availableRoots.length, random)]
  const chordType =
    availableChordTypes[getRandomIndex(availableChordTypes.length, random)]
  const questionType =
    availableQuestionTypes[getRandomIndex(availableQuestionTypes.length, random)]
      .id
  const chordTones = getChord(root.pitchClass, chordType.id)
  const degreeTone =
    questionType === 'chord-to-degree'
      ? chordTones[getRandomIndex(chordTones.length, random)]
      : undefined
  const answerNotes = chordTones.map((tone) => tone.note)

  return {
    questionType,
    rootPitchClass: root.pitchClass,
    rootLabel: root.label,
    chordTypeId: chordType.id,
    chordLabel: chordType.label,
    chordSymbol: formatChordSymbol(root.label, chordType.label),
    answerPitchClasses: chordTones.map((tone) => tone.pitchClass),
    answerNotes,
    displayedNotes:
      questionType === 'notes-to-chord' ? shuffleItems(answerNotes, random) : [],
    degreeLabel: degreeTone?.formula,
    degreeAnswerPitchClass: degreeTone?.pitchClass,
    degreeAnswerNote: degreeTone?.note,
  }
}

export function checkChordQuizAnswer(
  question: ChordQuizQuestion,
  answer: ChordQuizAnswer,
): ChordQuizResult {
  if (question.questionType === 'notes-to-chord') {
    return {
      isCorrect: answer.selectedChordId === getChordAnswerId(question),
      correctAnswer: question.chordSymbol,
    }
  }

  if (question.questionType === 'chord-to-degree') {
    return {
      isCorrect: answer.selectedPitchClass === question.degreeAnswerPitchClass,
      correctAnswer: question.degreeAnswerNote ?? '',
    }
  }

  const expected = normalizePitchClasses(question.answerPitchClasses)
  const selected = normalizePitchClasses(answer.selectedPitchClasses ?? [])

  return {
    isCorrect:
      expected.length === selected.length &&
      expected.every((pitchClass, index) => pitchClass === selected[index]),
    correctAnswer: question.answerNotes.join(' - '),
  }
}

export function getChordAnswerOptions(range: ChordQuizRange): ChordAnswerOption[] {
  const availableRoots = pitchClassOptions.filter((option) =>
    range.rootPitchClasses.includes(option.pitchClass),
  )
  const availableChordTypes = chordTypes.filter((chordType) =>
    range.chordTypeIds.includes(chordType.id),
  )

  return availableRoots.flatMap((root) =>
    availableChordTypes.map((chordType) => ({
      id: createChordAnswerId(root.pitchClass, chordType.id),
      label: formatChordSymbol(root.label, chordType.label),
    })),
  )
}

export function getChordAnswerId(question: ChordQuizQuestion) {
  return createChordAnswerId(question.rootPitchClass, question.chordTypeId)
}

export function getPitchClassLabels(pitchClasses: number[]) {
  return normalizePitchClasses(pitchClasses).map((pitchClass) =>
    getPitchClassLabel(pitchClass),
  )
}

function normalizePitchClasses(pitchClasses: number[]) {
  return [...new Set(pitchClasses)].sort((a, b) => a - b)
}

function createChordAnswerId(rootPitchClass: number, chordTypeId: string) {
  return `${rootPitchClass}:${chordTypeId}`
}

function formatChordSymbol(rootLabel: string, chordLabel: string) {
  if (chordLabel === 'Major') {
    return `${rootLabel} Major`
  }

  if (chordLabel === 'minor') {
    return `${rootLabel}m`
  }

  return `${rootLabel}${chordLabel}`
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
