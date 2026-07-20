import {
  chordTypes,
  getChord,
  getPitchClassLabel,
  pitchClassOptions,
} from './musicTheory'

export type ChordQuizQuestion = {
  rootPitchClass: number
  rootLabel: string
  chordTypeId: string
  chordLabel: string
  chordSymbol: string
  answerPitchClasses: number[]
  answerNotes: string[]
}

export type ChordQuizResult = {
  isCorrect: boolean
  correctAnswer: string
}

export type ChordQuizRange = {
  rootPitchClasses: number[]
  chordTypeIds: string[]
}

export function getDefaultChordQuizRange(): ChordQuizRange {
  return {
    rootPitchClasses: pitchClassOptions.map((option) => option.pitchClass),
    chordTypeIds: chordTypes.map((chordType) => chordType.id),
  }
}

export function canCreateChordQuizQuestion(range: ChordQuizRange) {
  return range.rootPitchClasses.length > 0 && range.chordTypeIds.length > 0
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

  if (availableRoots.length === 0 || availableChordTypes.length === 0) {
    throw new Error('Chord quiz requires at least one root and one chord type')
  }

  const root = availableRoots[getRandomIndex(availableRoots.length, random)]
  const chordType =
    availableChordTypes[getRandomIndex(availableChordTypes.length, random)]
  const chordTones = getChord(root.pitchClass, chordType.id)

  return {
    rootPitchClass: root.pitchClass,
    rootLabel: root.label,
    chordTypeId: chordType.id,
    chordLabel: chordType.label,
    chordSymbol: formatChordSymbol(root.label, chordType.label),
    answerPitchClasses: chordTones.map((tone) => tone.pitchClass),
    answerNotes: chordTones.map((tone) => tone.note),
  }
}

export function checkChordQuizAnswer(
  question: ChordQuizQuestion,
  selectedPitchClasses: number[],
): ChordQuizResult {
  const expected = normalizePitchClasses(question.answerPitchClasses)
  const selected = normalizePitchClasses(selectedPitchClasses)

  return {
    isCorrect:
      expected.length === selected.length &&
      expected.every((pitchClass, index) => pitchClass === selected[index]),
    correctAnswer: question.answerNotes.join(' - '),
  }
}

export function getPitchClassLabels(pitchClasses: number[]) {
  return normalizePitchClasses(pitchClasses).map((pitchClass) =>
    getPitchClassLabel(pitchClass),
  )
}

function normalizePitchClasses(pitchClasses: number[]) {
  return [...new Set(pitchClasses)].sort((a, b) => a - b)
}

function formatChordSymbol(rootLabel: string, chordLabel: string) {
  if (chordLabel === 'Major') {
    return rootLabel
  }

  if (chordLabel === 'minor') {
    return `${rootLabel}m`
  }

  return `${rootLabel}${chordLabel}`
}

function getRandomIndex(length: number, random: () => number) {
  return Math.floor(random() * length)
}
