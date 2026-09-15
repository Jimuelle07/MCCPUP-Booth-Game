# Idea

## Elevator pitch

**"Pokémon or Programming Language?"** — a fast-paced booth quiz. Each round
shows 4 words — one from a target category and three decoys from the other
— and the player has 10 seconds to spot the odd one out. Rounds alternate
between "find the programming language" and "find the Pokémon," which keeps
players from settling into a single mental shortcut. Deliberately deceptive
names (Gholdengo, Malbolge, Porygon) are what make it a fun booth draw.

## Audience & setting

- Played standing at a booth at a community/club event (see `context.md`).
- Sessions are a randomized 1-20 round quiz, 10 seconds per round, so a line
  of people can cycle through quickly and no two sessions feel identical.
- Spectators watching the current player should be able to follow along —
  the game state (prompt, options, score, time left) should be readable
  from a short distance.

## Core loop

1. **Idle/attract screen** — shows the game title, a call to action
   ("Press Start" / click to begin), and the current leaderboard top scores,
   looping when no one is playing.
2. **Name entry** — player enters a display name or initials (used later for
   the leaderboard).
3. **Countdown** — a short 3-2-1 beat before the round starts, so the player
   is ready.
4. **Play round (repeats for a randomized 1-20 rounds):**
   - Each round randomly asks one of two prompts: **"Which one is a
     programming language?"** (3 Pokémon decoys) or **"Which one is a
     Pokémon?"** (3 programming language decoys).
   - 4 options are shown as buttons; the player has **10 seconds** to pick
     one.
   - Correct pick → score +1, brief positive feedback, next round starts
     immediately.
   - Wrong pick, or time runs out with no pick → no score change, brief
     reveal of the correct answer, next round starts immediately (see
     Non-goals — no life loss / no session-ending penalty).
   - Session ends after the last round (not a fixed clock — round count is
     randomized per session, between 1 and 20).
5. **Round result screen** — shows final score out of the session's round
   count, and a prompt to submit to the leaderboard.
6. **Leaderboard screen** — shows the current top scores (e.g. top 10), then
   returns to the idle/attract screen after a short delay.

## Rules

- Every word belongs to exactly one of the two categories — the dataset is
  curated so there's no ambiguity (a word is never a real name in both
  domains). Difficulty comes from **deceptive naming**, not trick overlaps:
  e.g. Gholdengo (Go + Django) and Malbolge (sounds like a legendary) are
  the whole point of the dataset (see `context.md` for the source list).
- No penalty for a wrong pick, or for timing out, beyond not scoring — this
  keeps the pace fast and forgiving for a walk-up booth audience.
- Each round draws its 4 words without replacement from the session's word
  pool, so nothing repeats within a session.
- Session length (number of rounds) is randomized between 1 and 20 each
  time a game starts, so replaying doesn't feel identical.

## Scoring

- +1 point per correct pick within the 10-second window.
- **Assumed (not yet decided):** an optional streak bonus could be added
  later to reward focus, but is out of scope for the first version — flag
  as a future enhancement, not a requirement.
- Final score is what's eligible for the leaderboard.

## Leaderboard

- Persistent across sessions (survives container restart via a mounted
  volume — see `system-design.md`).
- Shows name/initials + score, ranked descending, capped at a reasonable
  size (e.g. top 10) so early low scores eventually roll off.
- Purpose is booth engagement (return visits, friendly competition), not a
  long-term global ranking system.

## Tone & branding

- The only visual asset available is the "Flying Papers" style kit in
  `design/` — a flat, saturated "risograph poster" look (violet/yellow/pink
  palette, oversized display type, pill-shaped buttons, no shadows/gradients,
  cartoon mascot illustrations). It reads as a generic energetic event-brand
  skin rather than something built for this quiz, but it's usable as-is for
  buttons, cards, type scale, and color accents (see `context.md` open item).
- Recommend leaning into a playful, high-energy tone in copy ("Quick! What is
  it?!") to match that visual style and keep the booth line moving.

## Non-goals

- No lives/game-over state on a wrong answer — see Rules above.
- No multiplayer or head-to-head mode in this version.
- No account system — leaderboard entries are just a name/initials string.
- No difficulty settings/modes selection screen — one default difficulty mix
  for the first version.
- No sound requirement (nice-to-have, not required for the booth to
  function on a laptop with speakers off).

## Success criteria

- A new player can understand the rules within ~5 seconds of watching someone
  else play (visually self-explanatory: prompt + 4 labeled option buttons +
  visible countdown).
- A full session (name entry → 1-20 rounds → leaderboard) comfortably fits
  inside 60-90 seconds so a booth line keeps moving.
- The app runs fully offline once the Docker container is up — no
  live internet dependency during play.
