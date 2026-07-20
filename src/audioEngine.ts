type PianoSample = {
  midiNote: number
  fileName: string
}

const pianoSamples: PianoSample[] = [
  { midiNote: 21, fileName: 'A0v13.mp3' },
  { midiNote: 24, fileName: 'C1v13.mp3' },
  { midiNote: 27, fileName: 'D#1v13.mp3' },
  { midiNote: 30, fileName: 'F#1v13.mp3' },
  { midiNote: 33, fileName: 'A1v13.mp3' },
  { midiNote: 36, fileName: 'C2v13.mp3' },
  { midiNote: 39, fileName: 'D#2v13.mp3' },
  { midiNote: 42, fileName: 'F#2v13.mp3' },
  { midiNote: 45, fileName: 'A2v13.mp3' },
  { midiNote: 48, fileName: 'C3v13.mp3' },
  { midiNote: 51, fileName: 'D#3v13.mp3' },
  { midiNote: 54, fileName: 'F#3v13.mp3' },
  { midiNote: 57, fileName: 'A3v13.mp3' },
  { midiNote: 60, fileName: 'C4v13.mp3' },
  { midiNote: 63, fileName: 'D#4v13.mp3' },
  { midiNote: 66, fileName: 'F#4v13.mp3' },
  { midiNote: 69, fileName: 'A4v13.mp3' },
  { midiNote: 72, fileName: 'C5v13.mp3' },
  { midiNote: 75, fileName: 'D#5v13.mp3' },
  { midiNote: 78, fileName: 'F#5v13.mp3' },
  { midiNote: 81, fileName: 'A5v13.mp3' },
  { midiNote: 84, fileName: 'C6v13.mp3' },
  { midiNote: 87, fileName: 'D#6v13.mp3' },
  { midiNote: 90, fileName: 'F#6v13.mp3' },
  { midiNote: 93, fileName: 'A6v13.mp3' },
  { midiNote: 96, fileName: 'C7v13.mp3' },
  { midiNote: 99, fileName: 'D#7v13.mp3' },
  { midiNote: 102, fileName: 'F#7v13.mp3' },
  { midiNote: 105, fileName: 'A7v13.mp3' },
  { midiNote: 108, fileName: 'C8v13.mp3' },
]

const sampleBasePath = '/samples/piano/'
const pianoBuffers = new Map<number, AudioBuffer>()

let audioContext: AudioContext | null = null
let preloadPromise: Promise<void> | null = null
let warnedNoSamples = false

export async function preloadPianoSamples() {
  if (!preloadPromise) {
    preloadPromise = loadPianoSamples()
  }

  return preloadPromise
}

export async function playPianoNotes(midiNotes: number[], durationSeconds = 2) {
  const context = getAudioContext()
  await preloadPianoSamples()
  await context.resume()

  if (pianoBuffers.size === 0) {
    warnNoSamples()
    await playSineTones(
      midiNotes.map((midiNote) => getFrequencyFromMidiNote(midiNote)),
      durationSeconds,
    )
    return
  }

  const now = context.currentTime
  const peakGain = Math.min(0.34, 0.52 / midiNotes.length)

  midiNotes.forEach((midiNote) => {
    schedulePianoNote(context, midiNote, now, durationSeconds, peakGain)
  })
}

export async function playPianoNoteSequence(
  midiNotes: number[],
  intervalSeconds = 0.85,
  durationSeconds = 1.45,
) {
  const context = getAudioContext()
  await preloadPianoSamples()
  await context.resume()

  if (pianoBuffers.size === 0) {
    warnNoSamples()
    await playSineToneSequence(
      midiNotes.map((midiNote) => getFrequencyFromMidiNote(midiNote)),
      intervalSeconds,
      durationSeconds,
    )
    return
  }

  const now = context.currentTime

  midiNotes.forEach((midiNote, index) => {
    schedulePianoNote(
      context,
      midiNote,
      now + intervalSeconds * index,
      durationSeconds,
      0.34,
    )
  })
}

export async function playSineTone(frequency: number, durationSeconds = 0.9) {
  await playSineTones([frequency], durationSeconds)
}

export async function playSineTones(
  frequencies: number[],
  durationSeconds = 0.9,
) {
  const context = getAudioContext()
  await context.resume()

  const now = context.currentTime
  const outputGain = context.createGain()
  const peakGain = Math.min(0.28, 0.42 / frequencies.length)

  outputGain.gain.setValueAtTime(0.0001, now)
  outputGain.gain.exponentialRampToValueAtTime(peakGain, now + 0.02)
  outputGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds)
  outputGain.connect(context.destination)

  frequencies.forEach((frequency) => {
    scheduleSineTone(context, outputGain, frequency, now, durationSeconds)
  })
}

export async function playSineToneSequence(
  frequencies: number[],
  intervalSeconds = 0.85,
  durationSeconds = 1.45,
) {
  const context = getAudioContext()
  await context.resume()

  const now = context.currentTime
  const outputGain = context.createGain()

  outputGain.gain.setValueAtTime(0.24, now)
  outputGain.connect(context.destination)

  frequencies.forEach((frequency, index) => {
    scheduleSineTone(
      context,
      outputGain,
      frequency,
      now + intervalSeconds * index,
      durationSeconds,
    )
  })
}

function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext
    audioContext = new AudioContextClass()
  }

  return audioContext
}

async function loadPianoSamples() {
  const context = getAudioContext()

  await Promise.allSettled(
    pianoSamples.map(async (sample) => {
      if (pianoBuffers.has(sample.midiNote)) {
        return
      }

      const response = await fetch(
        `${sampleBasePath}${encodeURIComponent(sample.fileName)}`,
      )

      if (!response.ok) {
        console.warn(`Failed to load piano sample: ${sample.fileName}`)
        return
      }

      const arrayBuffer = await response.arrayBuffer()
      try {
        const audioBuffer = await context.decodeAudioData(arrayBuffer)
        pianoBuffers.set(sample.midiNote, audioBuffer)
      } catch {
        console.warn(`Failed to decode piano sample: ${sample.fileName}`)
      }
    }),
  )

  if (pianoBuffers.size === 0) {
    warnNoSamples()
  }
}

function schedulePianoNote(
  context: AudioContext,
  midiNote: number,
  startAt: number,
  durationSeconds: number,
  peakGain: number,
) {
  const nearestSample = findNearestLoadedSample(midiNote)

  if (!nearestSample) {
    warnNoSamples()
    scheduleSineTone(
      context,
      context.destination,
      getFrequencyFromMidiNote(midiNote),
      startAt,
      durationSeconds,
    )
    return
  }

  const buffer = pianoBuffers.get(nearestSample.midiNote)

  if (!buffer) {
    warnNoSamples()
    scheduleSineTone(
      context,
      context.destination,
      getFrequencyFromMidiNote(midiNote),
      startAt,
      durationSeconds,
    )
    return
  }

  const source = context.createBufferSource()
  const gain = context.createGain()
  const stopAt = startAt + durationSeconds

  source.buffer = buffer
  source.playbackRate.setValueAtTime(
    2 ** ((midiNote - nearestSample.midiNote) / 12),
    startAt,
  )

  gain.gain.setValueAtTime(0.0001, startAt)
  gain.gain.exponentialRampToValueAtTime(peakGain, startAt + 0.02)
  gain.gain.setValueAtTime(peakGain, Math.max(startAt + 0.03, stopAt - 0.28))
  gain.gain.exponentialRampToValueAtTime(0.0001, stopAt)

  source.connect(gain)
  gain.connect(context.destination)
  source.start(startAt)
  source.stop(stopAt + 0.02)
}

function findNearestLoadedSample(midiNote: number) {
  const loadedSamples = pianoSamples.filter((sample) =>
    pianoBuffers.has(sample.midiNote),
  )

  if (loadedSamples.length === 0) {
    return null
  }

  return loadedSamples.reduce((nearest, sample) =>
    Math.abs(sample.midiNote - midiNote) < Math.abs(nearest.midiNote - midiNote)
      ? sample
      : nearest,
  )
}

function getFrequencyFromMidiNote(midiNote: number) {
  return 440 * 2 ** ((midiNote - 69) / 12)
}

function warnNoSamples() {
  if (warnedNoSamples) {
    return
  }

  warnedNoSamples = true
  console.warn('No piano samples could be loaded; falling back to sine wave.')
}

function scheduleSineTone(
  context: AudioContext,
  destination: AudioNode,
  frequency: number,
  startAt: number,
  durationSeconds: number,
) {
  const oscillator = context.createOscillator()
  const toneGain = context.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, startAt)
  toneGain.gain.setValueAtTime(0.0001, startAt)
  toneGain.gain.exponentialRampToValueAtTime(1, startAt + 0.02)
  toneGain.gain.exponentialRampToValueAtTime(
    0.0001,
    startAt + durationSeconds,
  )

  oscillator.connect(toneGain)
  toneGain.connect(destination)
  oscillator.start(startAt)
  oscillator.stop(startAt + durationSeconds)
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}
