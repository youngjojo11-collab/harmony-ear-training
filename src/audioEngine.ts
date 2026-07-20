export async function playSineTone(frequency: number, durationSeconds = 0.9) {
  const AudioContextClass = window.AudioContext ?? window.webkitAudioContext
  const audioContext = new AudioContextClass()
  const oscillator = audioContext.createOscillator()
  const gain = audioContext.createGain()
  const now = audioContext.currentTime

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, now)

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.28, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds)

  oscillator.connect(gain)
  gain.connect(audioContext.destination)
  oscillator.start(now)
  oscillator.stop(now + durationSeconds)

  oscillator.addEventListener('ended', () => {
    void audioContext.close()
  })
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}
