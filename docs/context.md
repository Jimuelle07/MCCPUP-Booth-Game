# Context

## What this repo is

`MCCPUP-Booth-Game` is a new (currently empty) project. This is the first
planning pass: no application code exists yet, only this docs pass and a
borrowed visual style kit under `design/`.

Evidence labels below follow the `nemawashi` convention: **Observed** (verified
in this repo), **Decided** (confirmed by the user), **Assumed** (a reasonable
default not yet confirmed), **Open** (unresolved, flagged for follow-up).

## Background

- **Observed** — Repo root contains `README.md` (just the title), an empty
  `docs/` folder, a `design/` folder with a borrowed style guide, and
  `.agents/skills/` — an installed "Monozukuri" engineering-process skill pack
  (`skills-lock.json` pins it to `github.com/kuya-egg/Monozukuri`).
- **Assumed** — "MCCPUP" refers to a student/community org (e.g. a computing
  club) and this game is meant to run at their event booth to attract and
  engage attendees.
- **Decided** — The game concept is a rapid-fire binary classification quiz:
  a word appears, the player decides whether it's a **Pokémon name** or a
  **programming language name**.

## Process used for this planning pass

Per `.agents/skills/monozukuri-router/SKILL.md`, this task classifies as
**greenfield**, which routes to `nemawashi → monozukuri-blueprint`. The user
asked for three specific documents instead of the blueprint's default
4-artifact naming, so this pass maps the blueprint's intent onto the
requested files rather than replacing them:

| Blueprint stage (skill's default)      | Where it lives here       |
|-----------------------------------------|----------------------------|
| 1. Business logic                       | `idea.md`                 |
| 2. Tech stack                           | `system-design.md`        |
| 3. Logic-to-stack map                   | `system-design.md`        |
| 4. Phase plan                           | *deferred — not requested yet, see Open below* |

`context.md` (this file) captures the `nemawashi` brief: background,
constraints, decisions, assumptions, and open risks.

## Constraints

- **Decided** — Must run locally via Docker (no cloud dependency required for
  the booth itself).
- **Decided** — Input/display target is a laptop with keyboard and mouse (not
  a dedicated touchscreen kiosk). A staff member may operate it, or a guest
  may play directly.
- **Assumed** — The booth likely has unreliable or no internet access, so the
  game should not depend on an external API at runtime (word list is bundled
  locally, not fetched live).
- **Observed** — `design/` (DESIGN.md, css-variable.md, design-token.md,
  tailwind-v4.md) is a generic visual style/token kit called "Flying Papers"
  scraped from an unrelated third-party site. It is **not** built for this
  game's mechanics — no screens, flows, or components specific to a
  word-guessing game exist in it. It's usable as a visual skin (color palette,
  type scale, spacing/radius, button/card shapes), not as a UX spec.
- **Open** — Confirm with the user whether the "Flying Papers" look (violet/
  yellow/pink risograph poster style, oversized display type, pill buttons)
  is actually the desired branding for this game, since it wasn't produced
  for it. Proceeding on the assumption that it should be reused as the
  starting visual skin, since it's the only design asset available.

## Decisions log (from stakeholder Q&A)

1. **Game format:** Round-based quiz, superseding the original 60s
   score-attack format. A session is a randomized 1-20 round quiz; each
   round shows 4 options (1 correct + 3 decoys from the other category),
   alternating between "find the language" and "find the Pokémon" prompts,
   with a 10s-per-round timer. +1 per correct pick; no penalty for a wrong
   pick or a timeout.
2. **Tech stack:** React + Vite + Tailwind v4 on the frontend, Node/Express
   API on the backend, packaged for Docker.
3. **Leaderboard:** Yes — persistent local leaderboard (top scores +
   name/initials), shown between plays to drive booth engagement.
4. **Input/platform:** Laptop with keyboard and mouse (click or arrow-key
   answering), not a touchscreen kiosk.

## Non-goals (for this pass)

- No multiplayer/networked play across machines.
- No user accounts, auth, or personal data collection beyond a
  display name/initials for the leaderboard.
- No online word-source API — the dataset is a local static file.
- No mobile-native app; this is a browser-based app running in a container.

## Open items for follow-up

- **Resolved** — Word dataset is built: 50 Pokémon names + 50 programming
  language names, hand-curated specifically because each name is easy to
  mistake for the other category (e.g. Gholdengo reads as "Go" + "Django"
  but is a Pokémon; Malbolge reads as a legendary Pokémon but is an
  esoteric language). Lives in `api/src/data/words.json`.
- **Resolved** — Implementation plan written: `docs/implementation-plan.md`
  (Monozukuri blueprint stage 4).
- **Resolved** — "Flying Papers" style kit reuse confirmed by proceeding;
  Tailwind v4 tokens are wired up and applied across all screens.
