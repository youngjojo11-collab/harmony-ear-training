import { useMemo, useState } from 'react'
import './App.css'
import { getMajorScale, keyOptions } from './musicTheory'

type Screen = 'home' | 'scale'

type LearningMenu = {
  title: string
  description: string
  accent: string
  disabled?: boolean
  onSelect?: () => void
}

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [selectedKey, setSelectedKey] = useState(keyOptions[0].tonic)
  const scaleNotes = useMemo(() => getMajorScale(selectedKey), [selectedKey])

  const menus: LearningMenu[] = [
    {
      title: '화성학 학습',
      description: '음정, 코드, 진행을 체계적으로 익히는 학습 공간',
      accent: 'theory',
      onSelect: () => setScreen('scale'),
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

  if (screen === 'scale') {
    return (
      <main className="app-shell scale-shell">
        <button
          type="button"
          className="back-button"
          onClick={() => setScreen('home')}
        >
          이전 화면으로
        </button>

        <section className="scale-header" aria-labelledby="scale-title">
          <p className="eyebrow">Major Scale</p>
          <h1 id="scale-title">스케일 학습</h1>
          <p className="hero-copy">
            Key를 선택하면 해당 Major Scale의 7개 음과 1도부터 7도까지의
            관계를 확인할 수 있습니다.
          </p>
        </section>

        <section className="scale-panel" aria-label="Key 선택">
          <div className="section-heading">
            <h2>Key 선택</h2>
            <p>Major Scale 기준</p>
          </div>
          <div className="key-grid">
            {keyOptions.map((key) => (
              <button
                key={key.tonic}
                type="button"
                className={
                  key.tonic === selectedKey ? 'key-button selected' : 'key-button'
                }
                onClick={() => setSelectedKey(key.tonic)}
              >
                {key.label}
              </button>
            ))}
          </div>
        </section>

        <section className="scale-panel" aria-label={`${selectedKey} Major Scale`}>
          <div className="section-heading">
            <h2>{selectedKey} Major Scale</h2>
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
