import {
  getScaleModeFullLabel,
  getScalePitchClasses,
  keyOptions,
  scaleModeOptions,
  type ScaleMode,
} from './musicTheory'

export type ScaleQuizQuestion = {
  keyLabel: string
  tonic: string
  mode: ScaleMode
  modeLabel: string
  degree: number
  answerNote: string
  answerPitchClass: number
}

export type ScaleQuizResult = {
  isCorrect: boolean
  correctAnswer: string
}

export type ScaleQuizRange = {
  tonics: string[]
  modes: ScaleMode[]
}

export function getDefaultScaleQuizRange(): ScaleQuizRange {
  return {
    tonics: keyOptions.map((key) => key.tonic),
    modes: scaleModeOptions.map((modeOption) => modeOption.mode),
  }
}

export function canCreateScaleQuizQuestion(range: ScaleQuizRange) {
  return range.tonics.length > 0 && range.modes.length > 0
}

export function createScaleQuizQuestion(
  range: ScaleQuizRange = getDefaultScaleQuizRange(),
  random: () => number = Math.random,
): ScaleQuizQuestion {
  const availableKeys = keyOptions.filter((key) => range.tonics.includes(key.tonic))
  const availableModes = scaleModeOptions.filter((modeOption) =>
    range.modes.includes(modeOption.mode),
  )

  if (availableKeys.length === 0 || availableModes.length === 0) {
    throw new Error('Scale quiz requires at least one key and one scale mode')
  }

  const key = availableKeys[getRandomIndex(availableKeys.length, random)]
  const modeOption = availableModes[getRandomIndex(availableModes.length, random)]
  const degree = getRandomIndex(7, random) + 1
  const answer = getScalePitchClasses(key.tonic, modeOption.mode).find(
    (scaleNote) => scaleNote.degree === degree,
  )

  if (!answer) {
    throw new Error(
      `Unable to create question for ${key.tonic} ${modeOption.mode} degree ${degree}`,
    )
  }

  return {
    keyLabel: key.label,
    tonic: key.tonic,
    mode: modeOption.mode,
    modeLabel: getScaleModeFullLabel(modeOption.mode),
    degree,
    answerNote: answer.note,
    answerPitchClass: answer.pitchClass,
  }
}

export function checkScaleQuizAnswer(
  question: ScaleQuizQuestion,
  selectedPitchClass: number,
): ScaleQuizResult {
  return {
    isCorrect: selectedPitchClass === question.answerPitchClass,
    correctAnswer: question.answerNote,
  }
}

function getRandomIndex(length: number, random: () => number) {
  return Math.floor(random() * length)
}
