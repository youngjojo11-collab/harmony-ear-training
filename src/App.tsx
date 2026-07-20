import { useMemo, useState } from 'react'
import './App.css'
import { PianoKeyboard } from './PianoKeyboard'
import { ScaleQuiz } from './ScaleQuiz'
import {
  chordTypes,
  getChord,
  getChordType,
  getPitchClassLabel,
  getScale,
  getScaleModeFullLabel,
  getScalePitchClasses,
  getTwoOctavePianoKeys,
  keyOptions,
  pitchClassOptions,
  scaleModeOptions,
  type ScaleMode,
} from './musicTheory'

type Screen = 'home' | 'theory'
type TheoryView = 'scale' | 'chord'

type LearningMenu = {
  title: string
  description: string
  accent: string
  disabled?: boolean
  onSelect?: () => void
}

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [theoryView, setTheoryView] = useState<TheoryView>('scale')
  const [selectedKey, setSelectedKey] = useState(keyOptions[0].tonic)
  const [scaleMode, setScaleMode] = useState<ScaleMode>('major')
  const [rootPitchClass, setRootPitchClass] = useState(0)
  const [chordTypeId, setChordTypeId] = useState(chordTypes[0].id)

  const scaleNotes = useMemo(
    () => getScale(selectedKey, scaleMode),
    [selectedKey, scaleMode],
  )
  const highlightedScaleNotes = useMemo(
    () =>
      getScalePitchClasses(selectedKey, scaleMode).map((scaleNote) => ({
        pitchClass: scaleNote.pitchClass,
        label: `${scaleNote.degree}도`,
      })),
    [selectedKey, scaleMode],
  )
  const chordNotes = useMemo(
    () => getChord(rootPitchClass, chordTypeId),
    [rootPitchClass, chordTypeId],
  )
  const highlightedChordNotes = useMemo(
    () =>
      chordNotes.map((chordNote) => ({
        pitchClass: chordNote.pitchClass,
        label: chordNote.formula,
      })),
    [chordNotes],
  )
  const pianoKeys = useMemo(() => getTwoOctavePianoKeys(), [])
  const scaleLabel = getScaleModeFullLabel(scaleMode)
  const selectedChordType = getChordType(chordTypeId)
  const rootLabel = getPitchClassLabel(rootPitchClass)

  const menus: LearningMenu[] = [
    {
      title: '화성학 학습',
      description: '음정, 코드, 진행을 체계적으로 익히는 학습 공간',
      accent: 'theory',
      onSelect: () => setScreen('theory'),
    },
    {
      title: '청음 훈련',
      description: '멜로디와 화음을 듣고 구분하는 반복 훈련 공간',
      accent: 'ear',
      disabled: true,
    },
    {
      title: '절대음감 테스트',
      description: '단일 음을 듣고 음높이를 판별하는 테스트 공간',
      accent: 'pitch',
      disabled: true,
    },
  ]

  if (screen === 'theory') {
    return (
      <main className="app-shell scale-shell">
        <button
          type="button"
          className="back-button"
          onClick={() => setScreen('home')}
        >
          이전 화면으로
        </button>

        <section className="scale-header" aria-labelledby="theory-title">
          <p className="eyebrow">Harmony Study</p>
          <h1 id="theory-title">화성학 학습</h1>
          <p className="hero-copy">
            스케일과 코드의 구성음을 선택 조건에 맞춰 확인할 수 있습니다.
          </p>
        </section>

        <section className="scale-panel" aria-label="학습 화면 선택">
          <div className="section-heading">
            <h2>학습 선택</h2>
            <p>스케일 / 코드</p>
          </div>
          <div className="view-toggle" role="group" aria-label="학습 화면">
            <button
              type="button"
              className={
                theoryView === 'scale' ? 'view-button selected' : 'view-button'
              }
              onClick={() => setTheoryView('scale')}
            >
              스케일 학습
            </button>
            <button
              type="button"
              className={
                theoryView === 'chord' ? 'view-button selected' : 'view-button'
              }
              onClick={() => setTheoryView('chord')}
            >
              코드 학습
            </button>
          </div>
        </section>

        {theoryView === 'scale' ? (
          <>
            <section className="scale-panel" aria-label="스케일 모드 선택">
              <div className="section-heading">
                <h2>모드 선택</h2>
                <p>Major / Natural Minor</p>
              </div>
              <div className="mode-toggle" role="group" aria-label="스케일 모드">
                {scaleModeOptions.map((option) => (
                  <button
                    key={option.mode}
                    type="button"
                    className={
                      option.mode === scaleMode
                        ? 'mode-button selected'
                        : 'mode-button'
                    }
                    onClick={() => setScaleMode(option.mode)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="scale-panel" aria-label="Key 선택">
              <div className="section-heading">
                <h2>Key 선택</h2>
                <p>{scaleLabel} 기준</p>
              </div>
              <div className="key-grid">
                {keyOptions.map((key) => (
                  <button
                    key={key.tonic}
                    type="button"
                    className={
                      key.tonic === selectedKey
                        ? 'key-button selected'
                        : 'key-button'
                    }
                    onClick={() => setSelectedKey(key.tonic)}
                  >
                    {key.label}
                  </button>
                ))}
              </div>
            </section>

            <section
              className="scale-panel"
              aria-label={`${selectedKey} ${scaleLabel}`}
            >
              <div className="section-heading">
                <h2>
                  {selectedKey} {scaleLabel}
                </h2>
                <p>1도부터 7도까지</p>
              </div>
              <ol className="degree-grid">
                {scaleNotes.map((scaleNote) => (
                  <li key={`${scaleNote.degree}-${scaleNote.note}`}>
                    <span className="degree-label">{scaleNote.degree}도</span>
                    <span className="note-name">{scaleNote.note}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section
              className="scale-panel piano-panel"
              aria-label={`${selectedKey} ${scaleLabel} 피아노 건반`}
            >
              <div className="section-heading">
                <h2>가상 피아노</h2>
                <p>2옥타브 범위</p>
              </div>
              <PianoKeyboard
                keys={pianoKeys}
                highlightedNotes={highlightedScaleNotes}
              />
            </section>

            <ScaleQuiz />
          </>
        ) : (
          <>
            <section className="scale-panel" aria-label="루트음 선택">
              <div className="section-heading">
                <h2>루트음 선택</h2>
                <p>12개 음</p>
              </div>
              <div className="key-grid">
                {pitchClassOptions.map((root) => (
                  <button
                    key={root.pitchClass}
                    type="button"
                    className={
                      root.pitchClass === rootPitchClass
                        ? 'key-button selected'
                        : 'key-button'
                    }
                    onClick={() => setRootPitchClass(root.pitchClass)}
                  >
                    {root.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="scale-panel" aria-label="코드 종류 선택">
              <div className="section-heading">
                <h2>코드 종류 선택</h2>
                <p>interval 공식 기반</p>
              </div>
              <div className="chord-type-grid">
                {chordTypes.map((chordType) => (
                  <button
                    key={chordType.id}
                    type="button"
                    className={
                      chordType.id === chordTypeId
                        ? 'key-button selected'
                        : 'key-button'
                    }
                    onClick={() => setChordTypeId(chordType.id)}
                  >
                    {chordType.label}
                  </button>
                ))}
              </div>
            </section>

            <section
              className="scale-panel"
              aria-label={`${rootLabel} ${selectedChordType.label} 코드`}
            >
              <div className="section-heading">
                <h2>
                  {rootLabel} {selectedChordType.label}
                </h2>
                <p>공식: {selectedChordType.formula.join(' - ')}</p>
              </div>
              <ol className="degree-grid chord-tone-grid">
                {chordNotes.map((chordNote) => (
                  <li key={`${chordNote.formula}-${chordNote.note}`}>
                    <span className="degree-label">{chordNote.formula}</span>
                    <span className="note-name">{chordNote.note}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section
              className="scale-panel piano-panel"
              aria-label={`${rootLabel} ${selectedChordType.label} 피아노 건반`}
            >
              <div className="section-heading">
                <h2>가상 피아노</h2>
                <p>구성음 하이라이트</p>
              </div>
              <PianoKeyboard
                keys={pianoKeys}
                highlightedNotes={highlightedChordNotes}
              />
            </section>
          </>
        )}
      </main>
    )
  }

  return (
    <main className="app-shell">
      <section className="home-hero" aria-labelledby="home-title">
        <p className="eyebrow">Harmony & Ear Training</p>
        <h1 id="home-title">화성학/청음 학습</h1>
        <p className="hero-copy">
          기초 이론 학습부터 듣기 훈련까지 한곳에서 진행하는 음악 학습 앱입니다.
        </p>
      </section>

      <nav className="menu-grid" aria-label="학습 메뉴">
        {menus.map((menu) => (
          <button
            key={menu.title}
            type="button"
            className={`menu-card ${menu.accent}`}
            disabled={menu.disabled}
            onClick={menu.onSelect}
          >
            <span className="menu-mark" aria-hidden="true" />
            <span className="menu-content">
              <span className="menu-title">{menu.title}</span>
              <span className="menu-description">{menu.description}</span>
            </span>
            <span className="menu-status">
              {menu.disabled ? '준비 중' : '학습 시작'}
            </span>
          </button>
        ))}
      </nav>
    </main>
  )
}

export default App
