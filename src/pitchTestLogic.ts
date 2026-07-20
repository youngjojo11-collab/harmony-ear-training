export type PitchTestMode = 'white' | 'chromatic'
export type PitchRangeId = 'c2-b2' | 'c3-b3' | 'c4-b4' | 'c5-b5' | 'c2-b5'

export type PitchQuestion = {
  noteName: string
  octave: number
  frequency: number
  midiNote: number
  startedAt: number
}

export type PitchTestSettings = {
  mode: PitchTestMode
  rangeId: PitchRangeId
}

export type PitchTestResult = {
  isCorrect: boolean
  correctAnswer: string
  responseTimeMs: number
}

export type PitchNoteStat = {
  attempts: number
  correct: number
}

export type PitchStatsByNote = Record<string, PitchNoteStat>

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

export const pitchModeOptions: Array<{
  id: PitchTestMode
  label: string
}> = [
  { id: 'white', label: '흰건반만' },
  { id: 'chromatic', label: '12음 전체' },
]

export const pitchRangeOptions: Array<{
  id: PitchRangeId
  label: string
  minMidi: number
  maxMidi: number
}> = [
  { id: 'c2-b2', label: 'C2~B2', minMidi: 36, maxMidi: 47 },
  { id: 'c3-b3', label: 'C3~B3', minMidi: 48, maxMidi: 59 },
  { id: 'c4-b4', label: 'C4~B4', minMidi: 60, maxMidi: 71 },
  { id: 'c5-b5', label: 'C5~B5', minMidi: 72, maxMidi: 83 },
  { id: 'c2-b5', label: '전체 C2~B5', minMidi: 36, maxMidi: 83 },
]

const whiteKeyNoteNames = new Set(['C', 'D', 'E', 'F', 'G', 'A', 'B'])

export const initialPitchStatsByNote: PitchStatsByNote =
  pitchAnswerOptions.reduce<PitchStatsByNote>((stats, noteName) => {
    stats[noteName] = { attempts: 0, correct: 0 }
    return stats
  }, {})

export function createPitchQuestion(
  settings: PitchTestSettings,
  random: () => number = Math.random,
  now: () => number = performance.now.bind(performance),
): PitchQuestion {
  const candidates = getQuestionCandidates(settings)
  const midiNote = candidates[getRandomIndex(candidates.length, random)]
  const noteName = getNoteNameFromMidiNote(midiNote)
  const octave = Math.floor(midiNote / 12) - 1

  return {
    noteName,
    octave,
    midiNote,
    frequency: getFrequencyFromMidiNote(midiNote),
    startedAt: now(),
  }
}

export function checkPitchAnswer(
  question: PitchQuestion,
  selectedNoteName: string,
  answeredAt = performance.now(),
): PitchTestResult {
  return {
    isCorrect: selectedNoteName === question.noteName,
    correctAnswer: question.noteName,
    responseTimeMs: Math.max(0, answeredAt - question.startedAt),
  }
}

export function updatePitchStatsByNote(
  stats: PitchStatsByNote,
  question: PitchQuestion,
  result: PitchTestResult,
): PitchStatsByNote {
  return {
    ...stats,
    [question.noteName]: {
      attempts: stats[question.noteName].attempts + 1,
      correct: stats[question.noteName].correct + (result.isCorrect ? 1 : 0),
    },
  }
}

export function getAverageResponseTimeMs(responseTimesMs: number[]) {
  if (responseTimesMs.length === 0) {
    return 0
  }

  const totalResponseTime = responseTimesMs.reduce(
    (sum, responseTime) => sum + responseTime,
    0,
  )

  return Math.round(totalResponseTime / responseTimesMs.length)
}

function getQuestionCandidates(settings: PitchTestSettings) {
  const range = pitchRangeOptions.find((option) => option.id === settings.rangeId)

  if (!range) {
    throw new Error(`Invalid pitch range: ${settings.rangeId}`)
  }

  return Array.from(
    { length: range.maxMidi - range.minMidi + 1 },
    (_, index) => range.minMidi + index,
  ).filter((midiNote) => {
    if (settings.mode === 'chromatic') {
      return true
    }

    return whiteKeyNoteNames.has(getNoteNameFromMidiNote(midiNote))
  })
}

function getNoteNameFromMidiNote(midiNote: number) {
  return pitchAnswerOptions[midiNote % pitchAnswerOptions.length]
}

function getFrequencyFromMidiNote(midiNote: number) {
  return 440 * 2 ** ((midiNote - 69) / 12)
}

function getRandomIndex(length: number, random: () => number) {
  return Math.floor(random() * length)
}
