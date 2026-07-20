import './App.css'

type LearningMenu = {
  title: string
  description: string
  accent: string
}

const menus: LearningMenu[] = [
  {
    title: '화성학 학습',
    description: '음정, 코드, 진행을 체계적으로 익히는 학습 공간',
    accent: 'theory',
  },
  {
    title: '청음 훈련',
    description: '멜로디와 화음을 듣고 구분하는 반복 훈련 공간',
    accent: 'ear',
  },
  {
    title: '절대음감 테스트',
    description: '단일 음을 듣고 음높이를 판별하는 테스트 공간',
    accent: 'pitch',
  },
]

function App() {
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
          >
            <span className="menu-mark" aria-hidden="true" />
            <span className="menu-content">
              <span className="menu-title">{menu.title}</span>
              <span className="menu-description">{menu.description}</span>
            </span>
            <span className="menu-status">준비 중</span>
          </button>
        ))}
      </nav>
    </main>
  )
}

export default App
