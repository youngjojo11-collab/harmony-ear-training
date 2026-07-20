export type ScaleMode = 'major' | 'minor'

export type KeyOption = {
  label: string
  tonic: string
}

export type ScaleDegree = {
  degree: number
  note: string
}

export type ScalePitchClass = ScaleDegree & {
  pitchClass: number
}

export type PianoKey = {
  id: string
  note: string
  label: string
  octave: number
  pitchClass: number
  isBlack: boolean
}

export type PitchClassOption = {
  label: string
  pitchClass: number
}

export type ChordType = {
  id: string
  label: string
  intervals: number[]
  formula: string[]
}

export type ChordTone = {
  note: string
  formula: string
  pitchClass: number
}

export const scaleModeOptions: Array<{
  mode: ScaleMode
  label: string
  fullLabel: string
}> = [
  { mode: 'major', label: 'Major', fullLabel: 'Major Scale' },
  { mode: 'minor', label: 'Minor', fullLabel: 'Natural Minor Scale' },
]

const scaleIntervals: Record<ScaleMode, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
}

const naturalPitchClasses: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
}

const letters = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

const chromaticKeys = [
  { note: 'C', label: 'C', pitchClass: 0, isBlack: false },
  { note: 'C#', label: 'C#/Db', pitchClass: 1, isBlack: true },
  { note: 'D', label: 'D', pitchClass: 2, isBlack: false },
  { note: 'D#', label: 'D#/Eb', pitchClass: 3, isBlack: true },
  { note: 'E', label: 'E', pitchClass: 4, isBlack: false },
  { note: 'F', label: 'F', pitchClass: 5, isBlack: false },
  { note: 'F#', label: 'F#/Gb', pitchClass: 6, isBlack: true },
  { note: 'G', label: 'G', pitchClass: 7, isBlack: false },
  { note: 'G#', label: 'G#/Ab', pitchClass: 8, isBlack: true },
  { note: 'A', label: 'A', pitchClass: 9, isBlack: false },
  { note: 'A#', label: 'A#/Bb', pitchClass: 10, isBlack: true },
  { note: 'B', label: 'B', pitchClass: 11, isBlack: false },
]

export const pitchClassOptions: PitchClassOption[] = chromaticKeys.map(
  ({ label, pitchClass }) => ({
    label,
    pitchClass,
  }),
)

export const chordTypes: ChordType[] = [
  { id: 'major', label: 'Major', intervals: [0, 4, 7], formula: ['1', '3', '5'] },
  { id: 'minor', label: 'minor', intervals: [0, 3, 7], formula: ['1', 'b3', '5'] },
  { id: 'dim', label: 'dim', intervals: [0, 3, 6], formula: ['1', 'b3', 'b5'] },
  { id: 'aug', label: 'aug', intervals: [0, 4, 8], formula: ['1', '3', '#5'] },
  { id: 'sus2', label: 'sus2', intervals: [0, 2, 7], formula: ['1', '2', '5'] },
  { id: 'sus4', label: 'sus4', intervals: [0, 5, 7], formula: ['1', '4', '5'] },
  { id: '7', label: '7', intervals: [0, 4, 7, 10], formula: ['1', '3', '5', 'b7'] },
  { id: 'maj7', label: 'maj7', intervals: [0, 4, 7, 11], formula: ['1', '3', '5', '7'] },
  { id: 'm7', label: 'm7', intervals: [0, 3, 7, 10], formula: ['1', 'b3', '5', 'b7'] },
]

export const keyOptions: KeyOption[] = [
  { label: 'C', tonic: 'C' },
  { label: 'C#/Db', tonic: 'Db' },
  { label: 'D', tonic: 'D' },
  { label: 'D#/Eb', tonic: 'Eb' },
  { label: 'E', tonic: 'E' },
  { label: 'F', tonic: 'F' },
  { label: 'F#/Gb', tonic: 'Gb' },
  { label: 'G', tonic: 'G' },
  { label: 'G#/Ab', tonic: 'Ab' },
  { label: 'A', tonic: 'A' },
  { label: 'A#/Bb', tonic: 'Bb' },
  { label: 'B', tonic: 'B' },
]

export function getScale(tonic: string, mode: ScaleMode): ScaleDegree[] {
  const { letter, pitchClass } = parseNote(tonic)
  const startLetterIndex = letters.indexOf(letter)

  return scaleIntervals[mode].map((interval, index) => {
    const scaleLetter = letters[(startLetterIndex + index) % letters.length]
    const targetPitchClass = normalizePitchClass(pitchClass + interval)
    const naturalPitchClass = naturalPitchClasses[scaleLetter]
    const accidentalOffset = getAccidentalOffset(
      targetPitchClass,
      naturalPitchClass,
    )

    return {
      degree: index + 1,
      note: `${scaleLetter}${formatAccidental(accidentalOffset)}`,
    }
  })
}

export function getScalePitchClasses(
  tonic: string,
  mode: ScaleMode,
): ScalePitchClass[] {
  return getScale(tonic, mode).map((scaleNote) => ({
    ...scaleNote,
    pitchClass: getPitchClass(scaleNote.note),
  }))
}

export function getMajorScale(tonic: string): ScaleDegree[] {
  return getScale(tonic, 'major')
}

export function getMajorScalePitchClasses(tonic: string): ScalePitchClass[] {
  return getScalePitchClasses(tonic, 'major')
}

export function getTwoOctavePianoKeys(startOctave = 4): PianoKey[] {
  return Array.from({ length: 24 }, (_, index) => {
    const key = chromaticKeys[index % chromaticKeys.length]
    const octave = startOctave + Math.floor(index / chromaticKeys.length)

    return {
      ...key,
      octave,
      id: `${key.note}${octave}`,
    }
  })
}

export function getScaleModeFullLabel(mode: ScaleMode) {
  return (
    scaleModeOptions.find((option) => option.mode === mode)?.fullLabel ??
    'Major Scale'
  )
}

export function getChord(rootPitchClass: number, chordTypeId: string): ChordTone[] {
  const chordType = getChordType(chordTypeId)

  return chordType.intervals.map((interval, index) => {
    const pitchClass = normalizePitchClass(rootPitchClass + interval)

    return {
      note: getPitchClassLabel(pitchClass),
      formula: chordType.formula[index],
      pitchClass,
    }
  })
}

export function getChordType(chordTypeId: string) {
  const chordType = chordTypes.find((type) => type.id === chordTypeId)

  if (!chordType) {
    throw new Error(`Invalid chord type: ${chordTypeId}`)
  }

  return chordType
}

export function getPitchClassLabel(pitchClass: number) {
  const normalizedPitchClass = normalizePitchClass(pitchClass)
  const option = pitchClassOptions.find(
    (item) => item.pitchClass === normalizedPitchClass,
  )

  if (!option) {
    throw new Error(`Invalid pitch class: ${pitchClass}`)
  }

  return option.label
}

export function getPitchClass(note: string) {
  return parseNote(note).pitchClass
}

function parseNote(note: string) {
  const letter = note[0]
  const accidentals = note.slice(1)
  const basePitchClass = naturalPitchClasses[letter]

  if (basePitchClass === undefined) {
    throw new Error(`Invalid note: ${note}`)
  }

  const accidentalOffset = [...accidentals].reduce((offset, accidental) => {
    if (accidental === '#') {
      return offset + 1
    }

    if (accidental === 'b') {
      return offset - 1
    }

    throw new Error(`Invalid accidental: ${accidental}`)
  }, 0)

  return {
    letter,
    pitchClass: normalizePitchClass(basePitchClass + accidentalOffset),
  }
}

function normalizePitchClass(pitchClass: number) {
  return ((pitchClass % 12) + 12) % 12
}

function getAccidentalOffset(targetPitchClass: number, naturalPitchClass: number) {
  const rawOffset = normalizePitchClass(targetPitchClass - naturalPitchClass)

  if (rawOffset > 6) {
    return rawOffset - 12
  }

  return rawOffset
}

function formatAccidental(offset: number) {
  if (offset > 0) {
    return '#'.repeat(offset)
  }

  if (offset < 0) {
    return 'b'.repeat(Math.abs(offset))
  }

  return ''
}
