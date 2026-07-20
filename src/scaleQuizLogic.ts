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

export function createScaleQuizQuestion(
  random: () => number = Math.random,
): ScaleQuizQuestion {
  const key = keyOptions[getRandomIndex(keyOptions.length, random)]
  const modeOption = scaleModeOptions[getRandomIndex(scaleModeOptions.length, random)]
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
