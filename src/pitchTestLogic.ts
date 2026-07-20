export type PitchTestMode = 'white' | 'chromatic'
export type PitchRangeId = 'c2-b2' | 'c3-b3' | 'c4-b4' | 'c5-b5' | 'c2-b5'
export type PitchQuestionType = 'single' | 'dyad'

export type PitchQuestionNote = {
  noteName: string
  octave: number
  frequency: number
  midiNote: number
}

export type PitchQuestion = {
  type: PitchQuestionType
  notes: PitchQuestionNote[]
  startedAt: number
}

export type PitchTestSettings = {
  mode: PitchTestMode
  rangeId: PitchRangeId
  questionType: PitchQuestionType
}

export type PitchTestResult = {
  isCorrect: boolean
  correctAnswers: string[]
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

export const pitchQuestionTypeOptions: Array<{
  id: PitchQuestionType
  label: string
}> = [
  { id: 'single', label: '단음 테스트' },
  { id: 'dyad', label: '동시 2음 테스트' },
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
  const questionNotes =
    settings.questionType === 'dyad'
      ? pickDifferentNotes(candidates, random)
      : [pickQuestionNote(candidates, random)]

  return {
    type: settings.questionType,
    notes: questionNotes,
    startedAt: now(),
  }
}

export function checkPitchAnswer(
  question: PitchQuestion,
  selectedNoteNames: string[],
  answeredAt = performance.now(),
): PitchTestResult {
  const correctAnswers = getQuestionAnswerNames(question)
  const selectedAnswers = normalizeNoteNames(selectedNoteNames)

  return {
    isCorrect:
      correctAnswers.length === selectedAnswers.length &&
      correctAnswers.every((noteName, index) => noteName === selectedAnswers[index]),
    correctAnswers,
    responseTimeMs: Math.max(0, answeredAt - question.startedAt),
  }
}

export function updatePitchStatsByNote(
  stats: PitchStatsByNote,
  question: PitchQuestion,
  result: PitchTestResult,
): PitchStatsByNote {
  return getQuestionAnswerNames(question).reduce<PitchStatsByNote>(
    (nextStats, noteName) => ({
      ...nextStats,
      [noteName]: {
        attempts: nextStats[noteName].attempts + 1,
        correct: nextStats[noteName].correct + (result.isCorrect ? 1 : 0),
      },
    }),
    stats,
  )
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

export function getQuestionFrequencies(question: PitchQuestion) {
  return question.notes.map((note) => note.frequency)
}

export function getQuestionAnswerNames(question: PitchQuestion) {
  return normalizeNoteNames(question.notes.map((note) => note.noteName))
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

function pickDifferentNotes(candidates: number[], random: () => number) {
  const firstNote = pickQuestionNote(candidates, random)
  const differentCandidates = candidates.filter(
    (midiNote) => getNoteNameFromMidiNote(midiNote) !== firstNote.noteName,
  )
  const secondNote = pickQuestionNote(differentCandidates, random)

  return [firstNote, secondNote]
}

function pickQuestionNote(candidates: number[], random: () => number) {
  const midiNote = candidates[getRandomIndex(candidates.length, random)]
  const noteName = getNoteNameFromMidiNote(midiNote)
  const octave = Math.floor(midiNote / 12) - 1

  return {
    noteName,
    octave,
    midiNote,
    frequency: getFrequencyFromMidiNote(midiNote),
  }
}

function normalizeNoteNames(noteNames: string[]) {
  return [...new Set(noteNames)].sort(
    (a, b) => pitchAnswerOptions.indexOf(a) - pitchAnswerOptions.indexOf(b),
  )
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
