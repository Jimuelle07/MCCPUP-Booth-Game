import { useEffect, useRef, useState } from 'react';
import {
  BrandWordmark,
  ConfettiCard,
  DarkTextCard,
  ExitButton,
  FloatingKey,
  GatePillButton,
  MonoLabel,
  MonoTag,
  OutlinedDisplayButton,
  PodiumRow,
  RoundTimer,
  Screen,
  UnderlineLink,
} from './components/ui';

// Full booth game loop:
//   Attract → NameEntry → Countdown → Playing → Result → Leaderboard → Attract
// Each playing session is a fixed 15-round quiz. Each round asks the
// player to spot the odd one out among 4 options, with a 10s timer.
const STAGE = {
  LOADING: 'loading',
  ATTRACT: 'attract',
  NAME_ENTRY: 'name_entry',
  COUNTDOWN: 'countdown',
  PLAYING: 'playing',
  RESULT: 'result',
  LEADERBOARD: 'leaderboard',
};

const ROUND_SECONDS = 10;
const ROUND_COUNT = 15;
const OPTIONS_PER_ROUND = 4;
const LEADERBOARD_TIMEOUT_MS = 10000;

export default function App() {
  const [stage, setStage] = useState(STAGE.LOADING);
  const [error, setError] = useState(null);

  const [words, setWords] = useState([]);
  const [name, setName] = useState('');

  const [rounds, setRounds] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [pickedText, setPickedText] = useState(null);
  const [countdownValue, setCountdownValue] = useState(3);

  const [leaderboard, setLeaderboard] = useState([]);
  const [top3, setTop3] = useState([]);

  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const leaderboardReturnRef = useRef(null);

  // Boot: load the full word list and the attract-screen leaderboard.
  useEffect(() => {
    Promise.all([fetchWords(), fetchTop3()])
      .then(([wordList]) => {
        setWords(wordList);
        setStage(STAGE.ATTRACT);
      })
      .catch((err) => setError(err.message));

    return () => {
      clearInterval(timerRef.current);
      clearInterval(countdownRef.current);
      clearTimeout(leaderboardReturnRef.current);
    };
  }, []);

  // 10s-per-round countdown.
  useEffect(() => {
    if (stage !== STAGE.PLAYING) return undefined;

    setTimeLeft(ROUND_SECONDS);
    setPickedText(null);
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          advanceRound(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [stage, roundIndex]);

  // 3-2-1 countdown before play.
  useEffect(() => {
    if (stage !== STAGE.COUNTDOWN) return undefined;

    setCountdownValue(3);
    clearInterval(countdownRef.current);

    countdownRef.current = setInterval(() => {
      setCountdownValue((v) => {
        if (v <= 1) {
          clearInterval(countdownRef.current);
          startPlaying();
          return 0;
        }
        return v - 1;
      });
    }, 1000);

    return () => clearInterval(countdownRef.current);
  }, [stage]);

  // Leaderboard returns to attract automatically.
  useEffect(() => {
    if (stage !== STAGE.LEADERBOARD) return undefined;

    clearTimeout(leaderboardReturnRef.current);
    leaderboardReturnRef.current = setTimeout(() => {
      setStage(STAGE.ATTRACT);
    }, LEADERBOARD_TIMEOUT_MS);

    return () => clearTimeout(leaderboardReturnRef.current);
  }, [stage]);

  // Keyboard controls for booth play.
  useEffect(() => {
    function onKeyDown(event) {
      if (stage === STAGE.ATTRACT) {
        event.preventDefault();
        setStage(STAGE.NAME_ENTRY);
      } else if (stage === STAGE.NAME_ENTRY) {
        if (event.key === 'Enter' && name.trim()) {
          event.preventDefault();
          setStage(STAGE.COUNTDOWN);
        }
      } else if (stage === STAGE.PLAYING && pickedText === null) {
        const num = Number(event.key);
        if (num >= 1 && num <= OPTIONS_PER_ROUND) {
          event.preventDefault();
          choose(rounds[roundIndex]?.options[num - 1]);
        }
      } else if (stage === STAGE.RESULT) {
        if (event.key === 'Enter') {
          event.preventDefault();
          submitScore();
        }
      } else if (stage === STAGE.LEADERBOARD) {
        event.preventDefault();
        setStage(STAGE.ATTRACT);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [stage, name, pickedText, roundIndex, rounds]);

  async function fetchWords() {
    const res = await fetch('/api/words');
    if (!res.ok) throw new Error(`GET /api/words failed: ${res.status}`);
    return res.json();
  }

  async function fetchTop3() {
    const res = await fetch('/api/scores?limit=3');
    if (!res.ok) throw new Error(`GET /api/scores failed: ${res.status}`);
    const rows = await res.json();
    setTop3(rows);
    return rows;
  }

  function startCountdown() {
    setStage(STAGE.COUNTDOWN);
  }

  function startPlaying() {
    const built = buildRounds(words);
    setRounds(built);
    setRoundIndex(0);
    setScore(0);
    setPickedText(null);
    setStage(STAGE.PLAYING);
  }

  function advanceRound(chosenText) {
    clearInterval(timerRef.current);
    setPickedText(chosenText);

    setTimeout(() => {
      const next = roundIndex + 1;
      if (next >= rounds.length) {
        setStage(STAGE.RESULT);
      } else {
        setRoundIndex(next);
      }
    }, chosenText === null ? 0 : 700);
  }

  function choose(option) {
    if (pickedText !== null || !option || !rounds[roundIndex]) return;
    const round = rounds[roundIndex];
    const correct = option.text === round.answerText;
    if (correct) setScore((s) => s + 1);
    advanceRound(option.text);
  }

  async function submitScore() {
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || 'Anonymous', score, rounds: rounds.length }),
      });
      if (!res.ok) throw new Error(`POST /api/scores failed: ${res.status}`);

      const [board] = await Promise.all([
        fetch('/api/scores?limit=10').then((r) => r.json()),
        fetchTop3(),
      ]);
      setLeaderboard(board);
      setStage(STAGE.LEADERBOARD);
    } catch (err) {
      setError(err.message);
    }
  }

  function restart() {
    setName('');
    setStage(STAGE.ATTRACT);
  }

  if (error) {
    return (
      <Screen>
        <h2 className="font-obviouslyvariable font-black uppercase text-hero text-3d">
          Oops
        </h2>
        <p className="mt-40 font-bergenmonoregular text-body leading-body text-[var(--kb-text-dim)] max-w-[480px]">
          {error}
        </p>
        <GatePillButton onClick={() => window.location.reload()} className="mt-60">
          Try again
        </GatePillButton>
      </Screen>
    );
  }

  if (stage === STAGE.LOADING) {
    return (
      <Screen>
        <MonoTag>Loading words&hellip;</MonoTag>
      </Screen>
    );
  }

  if (stage === STAGE.ATTRACT) {
    return (
      <Screen onClick={() => setStage(STAGE.NAME_ENTRY)}>
        <BrandWordmark>MCCPUP Booth Game</BrandWordmark>

        <div className="mt-10 md:mt-4 w-full max-w-[1100px] flex flex-col items-center">
          <h2
            className="font-obviouslyvariable font-black uppercase text-hero text-center text-3d"
            style={{ fontFeatureSettings: '"calt" 0' }}
          >
            <span className="text-[var(--kb-text)]">Pok&eacute;mon</span>{' '}
            <span className="text-[var(--kb-accent)]">or</span>{' '}
            <span className="text-[var(--kb-text)]">Programming</span>{' '}
            <span className="text-[var(--kb-accent)]">Language?</span>
          </h2>
        </div>

        <div className="mt-24 md:mt-6 action-row">
          <GatePillButton onClick={(e) => { e.stopPropagation(); setStage(STAGE.NAME_ENTRY); }}>
            Start playing
          </GatePillButton>
          <OutlinedDisplayButton onClick={(e) => { e.stopPropagation(); setStage(STAGE.LEADERBOARD); }}>
            View leaderboard
          </OutlinedDisplayButton>
        </div>

        <p className="mt-16 md:mt-4 font-bergenmonoregular text-body leading-body text-[var(--kb-text-dim)] uppercase tracking-[0.05em]">
          Press any key to start
        </p>

        {top3.length > 0 && (
          <div className="mt-24 md:mt-6 w-full max-w-[720px] text-center">
            <MonoLabel>Top players</MonoLabel>
            <div className="mt-16 md:mt-3">
              <PodiumRow entries={top3} />
            </div>
          </div>
        )}
      </Screen>
    );
  }

  if (stage === STAGE.NAME_ENTRY) {
    return (
      <Screen>
        <BrandWordmark className="mb-24 md:mb-6">New player</BrandWordmark>
        <DarkTextCard>
          <MonoLabel>Player</MonoLabel>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) startCountdown();
            }}
            className="mt-16 md:mt-3 flex flex-col gap-[17px] md:gap-[12px]"
          >
            <label
              htmlFor="name"
              className="font-degulardisplay-bold font-bold text-body leading-body tracking-[0.05em] uppercase text-[var(--kb-text)]"
            >
              Enter your name
            </label>
            <input
              id="name"
              autoFocus
              placeholder="Your name or initials"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              className="key-input"
            />
            <GatePillButton type="submit" disabled={!name.trim()}>
              Start game
            </GatePillButton>
            <UnderlineLink onClick={restart}>
              Back to attract screen
            </UnderlineLink>
          </form>
        </DarkTextCard>
      </Screen>
    );
  }

  if (stage === STAGE.COUNTDOWN) {
    return (
      <Screen>
        <MonoTag>Get ready</MonoTag>
        <div
          key={countdownValue}
          className="mt-20 font-obviouslyvariable font-black text-display leading-display tracking-display text-3d-accent animate-pop"
          style={{ fontFeatureSettings: '"calt" 0' }}
        >
          {countdownValue === 0 ? 'Go!' : countdownValue}
        </div>
      </Screen>
    );
  }

  if (stage === STAGE.PLAYING) {
    const round = rounds[roundIndex];
    if (!round) return null;

    return (
      <Screen>
        <ExitButton onClick={restart} />
        <RoundTimer seconds={timeLeft} total={ROUND_SECONDS} />

        <div className="w-full max-w-[1080px]">
          <div className="flex flex-wrap items-center justify-center gap-[12px] md:gap-[17px]">
            <MonoTag variant="outline">Score {score}</MonoTag>
            <MonoTag variant="outline">Round {roundIndex + 1} / {rounds.length}</MonoTag>
          </div>

          <h2
            key={`prompt-${roundIndex}`}
            className="mt-24 md:mt-6 font-obviouslyvariable font-black uppercase text-hero-sm text-3d text-center"
            style={{ fontFeatureSettings: '"calt" 0' }}
          >
            {round.prompt.split(' ').map((word, wi, arr) => (
              <span key={wi}>
                <span
                  className="inline-block animate-question-in"
                  style={{ animationDelay: `${wi * 70}ms` }}
                >
                  {word}
                </span>
                {wi < arr.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h2>

          <div
            key={`options-${roundIndex}`}
            className="mt-32 md:mt-8 options-grid items-stretch justify-center"
          >
            {round.options.map((option, i) => {
              const isPicked = pickedText === option.text;
              const isCorrect = option.text === round.answerText;
              const revealed = pickedText !== null;

              let state = 'default';
              if (revealed && isCorrect) state = 'correct';
              else if (revealed && isPicked) state = 'wrong';
              else if (revealed) state = 'revealed';

              return (
                <FloatingKey key={option.text} delay={i * 80}>
                  <OptionKey
                    index={i}
                    option={option}
                    state={state}
                    revealed={revealed}
                    onClick={() => choose(option)}
                  />
                </FloatingKey>
              );
            })}
          </div>
        </div>
      </Screen>
    );
  }

  if (stage === STAGE.RESULT) {
    return (
      <Screen>
        <DarkTextCard>
          <MonoLabel>Final score</MonoLabel>
          <p className="mt-4 md:mt-2 font-obviouslyvariable font-black text-5xl leading-[0.8] text-3d-accent">
            {score} / {rounds.length}
          </p>
          <p className="mt-4 md:mt-2 font-degularvariable text-body leading-body text-[var(--kb-text)]">
            {name.trim() || 'Anonymous'}
          </p>

          <div className="mt-24 md:mt-6 flex flex-col gap-[17px] md:gap-[12px]">
            <GatePillButton onClick={submitScore}>
              Submit score
            </GatePillButton>
            <OutlinedDisplayButton onClick={restart}>
              Skip & restart
            </OutlinedDisplayButton>
          </div>
        </DarkTextCard>
      </Screen>
    );
  }

  return (
    <Screen onClick={() => setStage(STAGE.ATTRACT)}>
      <div className="w-full max-w-[720px]">
        <BrandWordmark>Leaderboard</BrandWordmark>

        <div className="mt-24 md:mt-6 leaderboard-grid">
          {leaderboard.map((row, i) => (
            <ConfettiCard
              key={i}
              color={i === 0 ? 'yellow' : i % 2 === 1 ? 'pink' : 'green'}
            >
              <div className="flex items-center justify-between">
                <span
                  className="font-bergenmonoregular text-sm leading-[0.8] uppercase tracking-[0.05em]"
                  style={{ fontFeatureSettings: '"calt" 0' }}
                >
                  #{i + 1} {row.name}
                </span>
                <span className="font-obviouslyvariable font-black text-body-lg leading-body-lg">
                  {row.score}{row.rounds ? `/${row.rounds}` : ''}
                </span>
              </div>
            </ConfettiCard>
          ))}
        </div>

        <p className="mt-24 md:mt-6 font-bergenmonoregular text-caption leading-caption text-[var(--kb-text-dim)] uppercase tracking-[0.05em]">
          Tap or press any key to continue
        </p>
      </div>
    </Screen>
  );
}

const KEY_TONES = ['red', 'blue', 'yellow', 'green'];

function OptionKey({ index, option, state, revealed, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={revealed}
      className={[
        'key-button w-full text-3d-sm',
        `key-button--${KEY_TONES[index % KEY_TONES.length]}`,
        state === 'correct' ? 'correct' : '',
        state === 'wrong' ? 'wrong' : '',
        state === 'revealed' ? 'revealed' : '',
      ].join(' ')}
    >
      <span className="key-number-badge font-bergenmonoregular">
        {index + 1}
      </span>
      <span className="pl-40 md:pl-[34px]">{option.text}</span>
    </button>
  );
}

// Builds a fixed 15-round session. Each round randomly asks the player to
// spot the one programming language among 3 Pokémon, or the one Pokémon
// among 3 programming languages. Words are drawn without replacement so
// nothing repeats within a session.
function buildRounds(words) {
  const pokemon = shuffle(words.filter((w) => w.category === 'pokemon'));
  const languages = shuffle(words.filter((w) => w.category === 'language'));

  const rounds = [];
  for (let i = 0; i < ROUND_COUNT; i += 1) {
    const findLanguage = Math.random() < 0.5;
    const decoyPool = findLanguage ? pokemon : languages;
    const answerPool = findLanguage ? languages : pokemon;

    if (answerPool.length < 1 || decoyPool.length < OPTIONS_PER_ROUND - 1) {
      break;
    }

    const answer = answerPool.pop();
    const decoys = decoyPool.splice(0, OPTIONS_PER_ROUND - 1);
    const options = shuffle([
      { text: answer.text, category: answer.category },
      ...decoys.map((d) => ({ text: d.text, category: d.category })),
    ]);

    rounds.push({
      prompt: findLanguage
        ? 'Which one is a programming language?'
        : 'Which one is a Pokémon?',
      options,
      answerText: answer.text,
    });
  }

  return rounds;
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
