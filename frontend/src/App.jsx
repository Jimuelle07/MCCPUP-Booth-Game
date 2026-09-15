import { useEffect, useState } from 'react';

// Phase 1 vertical slice: proves browser -> nginx -> API -> SQLite works
// end-to-end. The full attract/countdown/timer state machine from
// docs/idea.md is built in Phase 2.
const STAGES = {
  LOADING: 'loading',
  PLAYING: 'playing',
  ENTER_NAME: 'enter_name',
  LEADERBOARD: 'leaderboard',
};

export default function App() {
  const [stage, setStage] = useState(STAGES.LOADING);
  const [words, setWords] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [name, setName] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWords();
  }, []);

  function loadWords() {
    setStage(STAGES.LOADING);
    fetch('/api/words')
      .then((res) => {
        if (!res.ok) throw new Error(`GET /api/words failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setWords(shuffle(data));
        setIndex(0);
        setScore(0);
        setStage(STAGES.PLAYING);
      })
      .catch((err) => setError(err.message));
  }

  function answer(category) {
    const current = words[index];
    if (current.category === category) {
      setScore((s) => s + 1);
    }
    const next = index + 1;
    if (next >= words.length) {
      setStage(STAGES.ENTER_NAME);
    } else {
      setIndex(next);
    }
  }

  async function submitScore(event) {
    event.preventDefault();
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || 'Anonymous', score }),
      });
      if (!res.ok) throw new Error(`POST /api/scores failed: ${res.status}`);
      const board = await fetch('/api/scores?limit=10').then((r) => r.json());
      setLeaderboard(board);
      setStage(STAGES.LEADERBOARD);
    } catch (err) {
      setError(err.message);
    }
  }

  if (error) {
    return (
      <div className="app">
        <p>Something went wrong: {error}</p>
      </div>
    );
  }

  if (stage === STAGES.LOADING) {
    return (
      <div className="app">
        <p>Loading words&hellip;</p>
      </div>
    );
  }

  if (stage === STAGES.PLAYING) {
    const current = words[index];
    return (
      <div className="app">
        <p>
          Score: {score} / {words.length}
        </p>
        <div className="word">{current.text}</div>
        <div className="answers">
          <button onClick={() => answer('pokemon')}>Pok&eacute;mon</button>
          <button onClick={() => answer('language')}>Programming Language</button>
        </div>
      </div>
    );
  }

  if (stage === STAGES.ENTER_NAME) {
    return (
      <div className="app">
        <p>
          Final score: {score} / {words.length}
        </p>
        <form onSubmit={submitScore}>
          <input
            placeholder="Your name or initials"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
          />
          <div>
            <button type="submit">Submit score</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="app">
      <h2>Leaderboard</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((row, i) => (
            <tr key={i}>
              <td>{row.name}</td>
              <td>{row.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={loadWords}>Play again</button>
    </div>
  );
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
