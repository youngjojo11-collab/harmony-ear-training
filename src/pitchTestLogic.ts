export type PitchQuestion = {
  noteName: string
  octave: number
  frequency: number
}

export type PitchTestResult = {
  isCorrect: boolean
  correctAnswer: string
}

export const pitchAnswerOptions = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
]

const lowestMidiNote = 60
const pitchQuestionCount = 24

export function createPitchQuestion(
  random: () => number = Math.random,
): PitchQuestion {
  const midiNote = lowestMidiNote + getRandomIndex(pitchQuestionCount, random)
  const noteName = pitchAnswerOptions[midiNote % pitchAnswerOptions.length]
  const octave = Math.floor(midiNote / 12) - 1

  return {
    noteName,
    octave,
    frequency: getFrequencyFromMidiNote(midiNote),
  }
}

export function checkPitchAnswer(
  question: PitchQuestion,
  selectedNoteName: string,
): PitchTestResult {
  return {
    isCorrect: selectedNoteName === question.noteName,
    correctAnswer: question.noteName,
  }
}

function getFrequencyFromMidiNote(midiNote: number) {
  return 440 * 2 ** ((midiNote - 69) / 12)
}

function getRandomIndex(length: number, random: () => number) {
  return Math.floor(random() * length)
}
