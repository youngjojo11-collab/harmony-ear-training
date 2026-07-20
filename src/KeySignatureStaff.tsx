import type { KeySignature } from './scaleQuizLogic'

type KeySignatureStaffProps = {
  signature: KeySignature
  compact?: boolean
}

const sharpPositions = [30, 48, 24, 42, 60, 36, 54]
const flatPositions = [54, 36, 60, 42, 66, 48, 72]

export function KeySignatureStaff({
  signature,
  compact = false,
}: KeySignatureStaffProps) {
  const width = compact ? 154 : 260
  const height = compact ? 88 : 118
  const lineStart = compact ? 18 : 28
  const lineEnd = width - (compact ? 18 : 28)
  const staffTop = compact ? 24 : 34
  const lineGap = compact ? 8 : 10
  const symbolXStart = compact ? 48 : 84
  const symbolGap = compact ? 14 : 20
  const fontSize = compact ? 24 : 34
  const positions =
    signature.accidental === 'flat' ? flatPositions : sharpPositions
  const symbol = signature.accidental === 'flat' ? '♭' : '♯'

  return (
    <svg
      className="key-signature-staff"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={getSignatureAriaLabel(signature)}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <line
          key={index}
          x1={lineStart}
          x2={lineEnd}
          y1={staffTop + index * lineGap}
          y2={staffTop + index * lineGap}
        />
      ))}
      <text
        className="staff-clef"
        x={compact ? 22 : 34}
        y={staffTop + lineGap * 3.55}
        fontSize={compact ? 34 : 46}
      >
        𝄞
      </text>
      {signature.accidental !== 'none' &&
        Array.from({ length: signature.count }, (_, index) => (
          <text
            key={`${signature.accidental}-${index}`}
            className="staff-accidental"
            x={symbolXStart + index * symbolGap}
            y={staffTop + positions[index] - 30}
            fontSize={fontSize}
          >
            {symbol}
          </text>
        ))}
      {signature.accidental === 'none' && (
        <text
          className="staff-empty"
          x={width / 2 + 18}
          y={staffTop + lineGap * 2.7}
          textAnchor="middle"
        >
          조표 없음
        </text>
      )}
    </svg>
  )
}

function getSignatureAriaLabel(signature: KeySignature) {
  if (signature.count === 0) {
    return '조표 없음'
  }

  const accidentalLabel = signature.accidental === 'sharp' ? '샵' : '플랫'

  return `${accidentalLabel} ${signature.count}개: ${signature.notes.join(', ')}`
}
