import type { CSSProperties } from 'react'
import type { PianoKey } from './musicTheory'

export type HighlightedPianoNote = {
  pitchClass: number
  label: string
}

type PianoKeyboardProps = {
  keys: PianoKey[]
  highlightedNotes: HighlightedPianoNote[]
}

export function PianoKeyboard({ keys, highlightedNotes }: PianoKeyboardProps) {
  const highlightByPitchClass = new Map(
    highlightedNotes.map((note) => [note.pitchClass, note]),
  )
  const whiteKeys = keys.filter((key) => !key.isBlack)
  const blackKeys = keys
    .map((key, index) => ({ key, index }))
    .filter(({ key }) => key.isBlack)
  const whiteKeyCount = whiteKeys.length

  return (
    <div className="piano-keyboard" aria-label="2옥타브 가상 피아노 건반">
      <div className="white-keys">
        {whiteKeys.map((key) => {
          const highlightedNote = highlightByPitchClass.get(key.pitchClass)

          return (
            <div
              key={key.id}
              className={
                highlightedNote ? 'piano-key white active' : 'piano-key white'
              }
            >
              <span className="piano-degree">{highlightedNote?.label ?? ''}</span>
              <span className="piano-note">{key.note}</span>
            </div>
          )
        })}
      </div>

      <div className="black-keys" aria-hidden="true">
        {blackKeys.map(({ key, index }) => {
          const highlightedNote = highlightByPitchClass.get(key.pitchClass)
          const previousWhiteCount = keys
            .slice(0, index)
            .filter((item) => !item.isBlack).length
          const leftPercent = (previousWhiteCount / whiteKeyCount) * 100

          return (
            <div
              key={key.id}
              className={
                highlightedNote ? 'piano-key black active' : 'piano-key black'
              }
              style={
                {
                  '--black-key-left': `${leftPercent}%`,
                } as CSSProperties
              }
            >
              <span className="piano-degree">{highlightedNote?.label ?? ''}</span>
              <span className="piano-note">{key.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
