import { useEffect, useState } from "react";

type Screen = "welcome" | "challenge" | "progress" | "complete";
type Difficulty = "easy" | "normal" | "hard";
type GameStatus = "idle" | "playing" | "lost" | "won";
type GameEntity = {
  id: string;
  type: "drop" | "waste";
  x: number;
  y: number;
  createdAt: number;
};

const DIFFICULTIES = {
  easy: { label: "Easy", seconds: 60, goal: 10, spawnRate: 900 },
  normal: { label: "Normal", seconds: 45, goal: 15, spawnRate: 760 },
  hard: { label: "Hard", seconds: 30, goal: 20, spawnRate: 620 },
} as const;

function DropIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 58" fill="none" aria-hidden="true">
      <path d="M24 2C20 12 6 26 6 38a18 18 0 0 0 36 0C42 26 28 12 24 2Z" fill="currentColor" />
      <path d="M13.5 38.5c0 6 4.5 11 10 12.2" stroke="white" strokeWidth="3" strokeLinecap="round" opacity=".75" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m15 5-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19.5 4.5C12 4.6 6.8 7.2 6.3 12.1c-.4 3.5 2.3 5.6 5.1 4.8 4.7-1.3 6.8-6.8 8.1-12.4Z" fill="currentColor" />
      <path d="M4 20c2.5-4.1 5.7-7 10.5-9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function WasteIcon() {
  return (
    <svg viewBox="0 0 44 52" fill="none" aria-hidden="true">
      <path d="M13 13h18l-2 32H15l-2-32Z" fill="#F47A62" />
      <path d="M10 13h24M17 8h10l2 5H15l2-5Z" stroke="#123C56" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m19 21 7 7-7 7m7-14-7 7 7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function WaterLandscape({ clean = false }: { clean?: boolean }) {
  return (
    <svg className="landscape" viewBox="0 0 390 245" fill="none" aria-hidden="true">
      <circle cx="323" cy="43" r="24" fill="#FFD84A" />
      <path d="M0 137 74 76l63 65 69-93 77 95 43-47 64 56v93H0V137Z" fill="#E4F4DF" />
      <path d="m0 150 74-62 63 65 69-93 77 96 44-48 63 55v82H0v-95Z" fill="#6CCB73" />
      <path d="m58 102 16-14 13 14-12-5-8 8-9-3Zm126-12 22-30 22 28-18-10-11 14-15-2Z" fill="white" opacity=".85" />
      <path d="M0 171c74-20 120 8 184-2 74-12 115-36 206-4v80H0v-74Z" fill="#3EB6E8" />
      <path d="M0 191c68-17 125 10 188-1 72-13 116-31 202-5v60H0v-54Z" fill={clean ? "#148DCE" : "#299FD2"} />
      <path d="M21 205c42-13 89 12 131 1m81-4c38-13 83-18 134-4" stroke="white" strokeWidth="4" strokeLinecap="round" opacity=".5" />
      <g fill="#197447">
        <path d="M29 169c5-20 11-30 18-42-1 16-5 29-18 42Z" />
        <path d="M31 169c-1-16-8-25-17-34 1 15 6 27 17 34Z" />
        <path d="M352 166c1-21 8-33 16-45-1 17-6 31-16 45Z" />
        <path d="M353 166c-3-17-11-24-20-31 3 15 9 25 20 31Z" />
      </g>
      {clean ? (
        <g fill="#FFD84A"><circle cx="47" cy="139" r="4" /><circle cx="365" cy="133" r="4" /><circle cx="25" cy="146" r="3" /></g>
      ) : (
        <g><path d="m287 211 18 3-3 10-17-4 2-9Z" fill="#FFD84A" /><path d="m101 194 12 6-5 8-13-7 6-7Z" fill="#F26C5B" /></g>
      )}
    </svg>
  );
}

function ScreenHeader({ score, onBack, step }: { score?: number; onBack: () => void; step: number }) {
  return (
    <header className="screen-header">
      <button className="round-button" onClick={onBack} aria-label="Go back"><BackIcon /></button>
      <div className="step-dots" aria-label={`Screen ${step} of 4`}>
        {[1, 2, 3, 4].map((item) => <span key={item} className={item <= step ? "active" : ""} />)}
      </div>
      {score !== undefined ? (
        <div className="score-pill"><DropIcon /><strong>{score}</strong></div>
      ) : <div className="header-spacer" />}
    </header>
  );
}

function CharityFooter() {
  return (
    <footer className="charity-footer">
      <a href="https://www.charitywater.org/" target="_blank" rel="noreferrer">Learn more</a>
      <span />
      <a href="https://www.charitywater.org/donate" target="_blank" rel="noreferrer">Donate</a>
    </footer>
  );
}

function makeEntity(forceDrop = false): GameEntity {
  return {
    id: `${Date.now()}-${Math.random()}`,
    type: forceDrop || Math.random() > 0.24 ? "drop" : "waste",
    x: 8 + Math.random() * 78,
    y: 8 + Math.random() * 72,
    createdAt: Date.now(),
  };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [difficultyOpen, setDifficultyOpen] = useState(false);
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DIFFICULTIES.normal.seconds);
  const [entities, setEntities] = useState<GameEntity[]>([]);
  const [feedback, setFeedback] = useState("");

  const mode = DIFFICULTIES[difficulty];
  const progress = Math.min(100, Math.round((score / mode.goal) * 100));

  useEffect(() => {
    if (gameStatus !== "playing" || screen !== "challenge") return;
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          setGameStatus("lost");
          setEntities([]);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [gameStatus, screen]);

  useEffect(() => {
    if (gameStatus !== "playing" || screen !== "challenge") return;
    const spawner = window.setInterval(() => {
      setEntities((current) => [...current.filter((item) => Date.now() - item.createdAt < 3200).slice(-7), makeEntity()]);
    }, mode.spawnRate);
    return () => window.clearInterval(spawner);
  }, [gameStatus, mode.spawnRate, screen]);

  useEffect(() => {
    if (!feedback) return;
    const clear = window.setTimeout(() => setFeedback(""), 1400);
    return () => window.clearTimeout(clear);
  }, [feedback]);

  function startGame() {
    setScore(0);
    setTimeLeft(mode.seconds);
    setEntities([makeEntity(true), makeEntity(true), makeEntity(), makeEntity()]);
    setFeedback("");
    setGameStatus("playing");
    setDifficultyOpen(false);
    setScreen("challenge");
  }

  function tapEntity(entity: GameEntity) {
    if (gameStatus !== "playing") return;
    setEntities((current) => current.filter((item) => item.id !== entity.id));

    if (entity.type === "waste") {
      setFeedback("Pollution tapped — 3 seconds lost");
      setTimeLeft((current) => {
        if (current <= 3) {
          setGameStatus("lost");
          setEntities([]);
          return 0;
        }
        return current - 3;
      });
      return;
    }

    const nextScore = score + 1;
    setScore(nextScore);
    setFeedback("+1 clean Water Drop");
    if (nextScore >= mode.goal) {
      setGameStatus("won");
      setEntities([]);
      setScreen("progress");
    }
  }

  function leaveGame() {
    setGameStatus("idle");
    setEntities([]);
    setScreen("welcome");
  }

  function restart() {
    setGameStatus("idle");
    setScore(0);
    setEntities([]);
    setScreen("welcome");
    setDifficultyOpen(true);
  }

  return (
    <main className="app-canvas">
      <div className="canvas-copy">
        <div className="mini-brand"><DropIcon /> WATER GUARDIAN</div>
        <p>A small choice can create a wave of change.</p>
      </div>

      <div className="phone-shell">
        <div className="phone-screen">
          {screen === "welcome" && (
            <section className="app-screen welcome-screen">
              <div className="welcome-top">
                <div className="brand-drops" aria-label="Water Guardian"><DropIcon /><DropIcon /><DropIcon /></div>
                <span className="edition">CAMPUS EDITION</span>
              </div>
              <div className="hero-planet">
                <div className="orbit orbit-one" /><div className="orbit orbit-two" />
                <div className="planet">
                  <svg viewBox="0 0 180 180" aria-hidden="true">
                    <circle cx="90" cy="90" r="82" fill="#28A9E2" />
                    <path d="M35 42c19-22 44-34 73-32l-5 18-21 4-8 18-18 6-21-14Zm89 20 27 5 17 22-13 17-23-3-14-18 6-23ZM43 99l25 3 13 16-9 34-20-6-17-28 8-19Z" fill="#6DCC73" />
                    <path d="M28 70c-8 26-3 54 12 74m110-88c12 18 16 38 12 58" stroke="white" strokeWidth="5" strokeLinecap="round" opacity=".35" />
                  </svg>
                  <div className="hero-drop"><DropIcon /></div>
                </div>
                <div className="spark spark-one" /><div className="spark spark-two" />
              </div>
              <div className="welcome-content">
                <p className="eyebrow">THE PLANET NEEDS YOU</p>
                <h1>Water<br />Guardian</h1>
                <p className="tagline">Every drop counts. Protect water.<br />Protect our planet.</p>
                <button className="primary-button" onClick={() => setDifficultyOpen(true)}>Start game <ArrowIcon /></button>
                <p className="partner-note">Helping share <strong>charity: water’s</strong> mission to bring clean and safe drinking water to people around the world.</p>
                <CharityFooter />
              </div>

              {difficultyOpen && (
                <div className="difficulty-overlay" role="dialog" aria-modal="true" aria-labelledby="difficulty-title">
                  <button className="sheet-backdrop" onClick={() => setDifficultyOpen(false)} aria-label="Close difficulty selection" />
                  <div className="difficulty-sheet">
                    <div className="sheet-handle" />
                    <p className="eyebrow">CHOOSE YOUR CHALLENGE</p>
                    <h2 id="difficulty-title">Select difficulty</h2>
                    <p>Collect clean drops and avoid pollution before time runs out.</p>
                    <div className="difficulty-list">
                      {(Object.keys(DIFFICULTIES) as Difficulty[]).map((key) => {
                        const item = DIFFICULTIES[key];
                        return (
                          <button key={key} className={`difficulty-option ${difficulty === key ? "selected" : ""}`} onClick={() => setDifficulty(key)}>
                            <span className="mode-icon"><DropIcon /></span>
                            <span><strong>{item.label}</strong><small>{item.seconds} seconds · {item.goal} drops to win</small></span>
                            <i />
                          </button>
                        );
                      })}
                    </div>
                    <button className="primary-button" onClick={startGame}>Play {mode.label} <ArrowIcon /></button>
                  </div>
                </div>
              )}
            </section>
          )}

          {screen === "challenge" && (
            <section className="app-screen challenge-screen game-screen">
              <ScreenHeader score={score} onBack={leaveGame} step={2} />
              {gameStatus === "lost" ? (
                <div className="game-over">
                  <div className="game-over-icon"><DropIcon /><span>×</span></div>
                  <p className="eyebrow">TIME’S UP</p>
                  <h2>Keep making<br />waves.</h2>
                  <p>You collected <strong>{score} of {mode.goal}</strong> Water Drops. Every try helps build better water-saving habits.</p>
                  <button className="primary-button" onClick={startGame}>Play again <ArrowIcon /></button>
                  <button className="text-button" onClick={leaveGame}>Change difficulty</button>
                  <CharityFooter />
                </div>
              ) : (
                <>
                  <div className="game-hud">
                    <div><span>TIME</span><strong className={timeLeft <= 10 ? "urgent" : ""}>{timeLeft}s</strong></div>
                    <div><span>MODE</span><strong>{mode.label}</strong></div>
                    <div><span>GOAL</span><strong>{score}/{mode.goal}</strong></div>
                  </div>
                  <div className="goal-progress">
                    <div><span>Mission progress</span><strong>{progress}%</strong></div>
                    <div className="goal-track"><span style={{ width: `${progress}%` }} /></div>
                  </div>
                  <div className="game-instructions">
                    <h2>Catch clean water!</h2>
                    <p>Tap blue drops. Avoid red pollution.</p>
                  </div>
                  <div className="play-field" aria-label="Water collection game area">
                    <div className="field-cloud cloud-one" /><div className="field-cloud cloud-two" />
                    <div className="field-hills" />
                    {entities.map((entity) => (
                      <button
                        key={entity.id}
                        className={`game-entity ${entity.type}`}
                        style={{ left: `${entity.x}%`, top: `${entity.y}%` }}
                        onClick={() => tapEntity(entity)}
                        aria-label={entity.type === "drop" ? "Collect clean water drop" : "Avoid pollution"}
                      >
                        {entity.type === "drop" ? <DropIcon /> : <WasteIcon />}
                      </button>
                    ))}
                    <div className="field-water" />
                    {feedback && <div className={`tap-feedback ${feedback.startsWith("+") ? "good" : "bad"}`}>{feedback}</div>}
                  </div>
                  <div className="game-legend"><span><DropIcon /> Tap to collect</span><span><WasteIcon /> Avoid pollution</span></div>
                </>
              )}
            </section>
          )}

          {screen === "progress" && (
            <section className="app-screen progress-screen">
              <ScreenHeader score={score} onBack={leaveGame} step={3} />
              <div className="screen-copy centered">
                <p className="eyebrow">GOAL REACHED · {mode.label.toUpperCase()}</p>
                <h2>Your choices are<br /><span>making a difference!</span></h2>
              </div>
              <div className="impact-landscape">
                <WaterLandscape clean />
                <div className="impact-label plant-label"><LeafIcon /> Plants growing</div>
                <div className="impact-label water-label"><DropIcon /> Cleaner water</div>
              </div>
              <div className="meter-card">
                <div className="meter-top"><span>Water health</span><strong>100%</strong></div>
                <div className="water-meter"><span style={{ width: "100%" }} /></div>
                <div className="meter-scale"><span>Needs help</span><span>Healthy</span></div>
              </div>
              <div className="impact-stats">
                <div><DropIcon /><span><strong>{score}</strong>Water Drops</span></div>
                <div><LeafIcon /><span><strong>3</strong>Positive changes</span></div>
              </div>
              <button className="primary-button bottom-button" onClick={() => setScreen("complete")}>Complete mission <ArrowIcon /></button>
            </section>
          )}

          {screen === "complete" && (
            <section className="app-screen complete-screen">
              <ScreenHeader onBack={() => setScreen("progress")} step={4} />
              <div className="complete-landscape"><WaterLandscape clean /><div className="sun-rays" /></div>
              <div className="complete-content">
                <div className="mission-badge"><LeafIcon /></div>
                <p className="eyebrow">WATER GUARDIAN</p>
                <h2>Mission<br />Complete!</h2>
                <div className="final-score"><DropIcon /><div><strong>{score}</strong><span>FINAL WATER DROPS · {mode.label.toUpperCase()}</span></div></div>
                <p className="mission-message">
                  Clean water changes everything. <strong>charity: water</strong> helps bring clean and safe drinking water to people around the world—and every action helps protect our shared planet.
                </p>
                <button className="primary-button" onClick={restart}>Play again <ArrowIcon /></button>
                <CharityFooter />
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
