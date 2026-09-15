# Idea

## Elevator pitch

**"Pokémon or Programming Language?"** — a fast-paced booth quiz. A word
flashes on screen. The player has one job: decide if it's a Pokémon name or
a programming language name, before the clock runs out. Simple rule, oddly
hard in practice (is "Ruby" a gem, a snake-loving nerd tool, or... wait, is
that a Pokémon too?) — which is exactly what makes it a fun booth draw.

## Audience & setting

- Played standing at a booth at a community/club event (see `context.md`).
- Sessions need to be **short** (~60 seconds) so a line of people can cycle
  through quickly.
- Spectators watching the current player should be able to follow along —
  the game state (current word, score, time left) should be readable from a
  short distance.

## Core loop

1. **Idle/attract screen** — shows the game title, a call to action
   ("Press Start" / click to begin), and the current leaderboard top scores,
   looping when no one is playing.
2. **Name entry** — player enters a display name or initials (used later for
   the leaderboard).
3. **Countdown** — a short 3-2-1 beat before the round starts, so the player
   is ready.
4. **Play round (the core loop, repeats until time runs out):**
   - A single word is shown, large and centered.
   - Two answer options are always visible: **"Pokémon"** and
     **"Programming Language."**
   - Player answers by clicking a button or pressing an assigned key
     (e.g. Left arrow = Pokémon, Right arrow = Programming Language).
   - Correct answer → brief positive feedback (flash/sound), score +1, next
     word appears immediately.
   - Wrong answer → brief negative feedback, score does **not** increase,
     next word appears immediately (see Non-goals — no life loss / no
     round-ending penalty, to keep pacing fast for a booth).
   - Round ends when the timer hits 0.
5. **Round result screen** — shows final score, whether it's a new personal
   or all-time high score, and a prompt to submit to the leaderboard.
6. **Leaderboard screen** — shows the current top scores (e.g. top 10), then
   returns to the idle/attract screen after a short delay.

## Rules

- Every word belongs to exactly one of the two categories — the dataset is
  curated so there's no ambiguity (a word is never a real name in both
  domains). Difficulty comes from **obscurity**, not trick overlaps: e.g.
  well-known entries (Pikachu, Python) are easy; lesser-known ones
  (Stunfisk, Zig) are hard.
- No penalty for wrong answers beyond not scoring — this keeps the pace fast
  and forgiving, which matters for a walk-up booth audience who may not want
  to feel embarrassed by "losing."
- Each round pulls words from the dataset without immediate repeats within
  the same round.

## Scoring

- +1 point per correct answer.
- **Assumed (not yet decided):** an optional streak bonus (e.g. +1 extra
  every 5 in a row correct) could be added later to reward focus, but is
  out of scope for the first version — flag as a future enhancement, not a
  requirement.
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
  else play (visually self-explanatory: word + two big labeled buttons).
- A full session (name entry → play → leaderboard) comfortably fits inside
  60-90 seconds so a booth line keeps moving.
- The app runs fully offline once the Docker container is up — no
  live internet dependency during play.
