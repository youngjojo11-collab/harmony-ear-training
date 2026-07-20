export async function playSineTone(frequency: number, durationSeconds = 0.9) {
  await playSineTones([frequency], durationSeconds)
}

export async function playSineTones(
  frequencies: number[],
  durationSeconds = 0.9,
) {
  const AudioContextClass = window.AudioContext ?? window.webkitAudioContext
  const audioContext = new AudioContextClass()
  const now = audioContext.currentTime
  const outputGain = audioContext.createGain()
  const peakGain = Math.min(0.28, 0.42 / frequencies.length)

  outputGain.gain.setValueAtTime(0.0001, now)
  outputGain.gain.exponentialRampToValueAtTime(peakGain, now + 0.02)
  outputGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds)
  outputGain.connect(audioContext.destination)

  const oscillators = frequencies.map((frequency) => {
    const oscillator = audioContext.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, now)
    oscillator.connect(outputGain)
    oscillator.start(now)
    oscillator.stop(now + durationSeconds)
    return oscillator
  })

  oscillators[0]?.addEventListener('ended', () => {
    void audioContext.close()
  })
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}
