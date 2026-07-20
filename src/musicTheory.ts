export type KeyOption = {
  label: string
  tonic: string
}

export type ScaleDegree = {
  degree: number
  note: string
}

const majorScaleIntervals = [0, 2, 4, 5, 7, 9, 11]

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

export function getMajorScale(tonic: string): ScaleDegree[] {
  const { letter, pitchClass } = parseNote(tonic)
  const startLetterIndex = letters.indexOf(letter)

  return majorScaleIntervals.map((interval, index) => {
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
