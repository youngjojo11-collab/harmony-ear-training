export async function playSineTone(frequency: number, durationSeconds = 0.9) {
  await playSineTones([frequency], durationSeconds)
}

export async function playSineTones(
  frequencies: number[],
  durationSeconds = 0.9,
) {
  const audioContext = createAudioContext()
  const now = audioContext.currentTime
  const outputGain = audioContext.createGain()
  const peakGain = Math.min(0.28, 0.42 / frequencies.length)

  outputGain.gain.setValueAtTime(0.0001, now)
  outputGain.gain.exponentialRampToValueAtTime(peakGain, now + 0.02)
  outputGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds)
  outputGain.connect(audioContext.destination)

  frequencies.forEach((frequency) => {
    scheduleSineTone(audioContext, outputGain, frequency, now, durationSeconds)
  })

  closeAfter(audioContext, now + durationSeconds)
}

export async function playSineToneSequence(
  frequencies: number[],
  intervalSeconds = 0.6,
  durationSeconds = 0.45,
) {
  const audioContext = createAudioContext()
  const outputGain = audioContext.createGain()
  const now = audioContext.currentTime
  const endAt = now + intervalSeconds * (frequencies.length - 1) + durationSeconds

  outputGain.gain.setValueAtTime(0.22, now)
  outputGain.connect(audioContext.destination)

  frequencies.forEach((frequency, index) => {
    scheduleSineTone(
      audioContext,
      outputGain,
      frequency,
      now + intervalSeconds * index,
      durationSeconds,
    )
  })

  closeAfter(audioContext, endAt)
}

function createAudioContext() {
  const AudioContextClass = window.AudioContext ?? window.webkitAudioContext
  return new AudioContextClass()
}

function scheduleSineTone(
  audioContext: AudioContext,
  destination: AudioNode,
  frequency: number,
  startAt: number,
  durationSeconds: number,
) {
  const oscillator = audioContext.createOscillator()
  const toneGain = audioContext.createGain()

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

function closeAfter(audioContext: AudioContext, endAt: number) {
  window.setTimeout(
    () => void audioContext.close(),
    Math.max(0, (endAt - audioContext.currentTime) * 1000 + 80),
  )
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}
