import { getMajorScalePitchClasses, keyOptions } from './musicTheory'

export type ScaleQuizQuestion = {
  keyLabel: string
  tonic: string
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
  const degree = getRandomIndex(7, random) + 1
  const answer = getMajorScalePitchClasses(key.tonic).find(
    (scaleNote) => scaleNote.degree === degree,
  )

  if (!answer) {
    throw new Error(`Unable to create question for ${key.tonic} degree ${degree}`)
  }

  return {
    keyLabel: key.label,
    tonic: key.tonic,
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
