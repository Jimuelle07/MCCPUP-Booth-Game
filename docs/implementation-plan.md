# Implementation Plan

This is the phase plan (Monozukuri blueprint stage 4), built on
`docs/idea.md` (business logic) and `docs/system-design.md` (tech stack +
logic-to-stack map). Phases are shippable increments, not task lists — the
task list for each phase is written when that phase starts.

## Phase 1: Vertical slice — prove the boundaries
- id: 1
- intent: One real word round works end-to-end through every real boundary — browser → nginx → Express API → SQLite — via `docker compose up`, before any UX polish or real content exists.
- affected: `frontend/` (minimal single-screen app: word + two buttons + score), `api/` (`GET /api/words` with a handful of placeholder words, `GET`/`POST /api/scores`), `docker-compose.yml`, both `Dockerfile`s, SQLite schema/migration.
- prereqs: none
- playbook: feature
- risk: medium

## Phase 2: Full game loop and screens
- id: 2
- intent: The complete play loop from `idea.md` works — attract → name entry → countdown → timed play → result → leaderboard → back to attract — as a real state machine, not a single screen.
- affected: `frontend/src/screens/*`, `frontend/src/state/*`, `frontend/src/components/*` (Timer, ScoreBadge, LeaderboardTable), API leaderboard ranking/top-N query.
- prereqs: 1
- playbook: feature
- risk: medium

## Phase 3: Real word dataset
- id: 3
- intent: Placeholder words are replaced with a curated, sized, difficulty-varied dataset of real Pokémon names and real programming language names.
- affected: `api/src/data/words.json` only.
- prereqs: 1
- playbook: feature
- risk: low

## Phase 4: Visual skin
- id: 4
- intent: The app is restyled with the "Flying Papers" Tailwind v4 tokens (`design/tailwind-v4.md`) — palette, type scale, pill/card shapes — once the open branding question in `docs/context.md` is confirmed.
- affected: `frontend/src/styles/*`, `frontend/tailwind.config` (or v4 `@theme` import), component class names only — no logic changes.
- prereqs: 2
- playbook: feature
- risk: low

## Phase 5: Booth-ready release
- id: 5
- intent: The stack is hardened for unattended booth operation — persistent volume verified across restarts, a documented reset procedure (`docker compose down -v`), and a smoke-tested `docker compose up --build` run-book in the README.
- affected: `docker-compose.yml` (volume/health checks), `README.md` (run + reset instructions).
- prereqs: 2, 3, 4
- playbook: release
- risk: low

## Phase order rationale

Phase 1 front-loads the only real technical risk in this project: three
containers (frontend/api/db-volume) talking to each other correctly through
Docker Compose. Nothing else can be trusted until that vertical slice proves
it, so it ships before any real UX or content exists (placeholder words,
one screen, no styling).

Phase 2 and Phase 3 are deliberately independent of each other (both only
depend on Phase 1): the game-loop/state-machine work never touches
`words.json`, and dataset curation never touches component code. They can
be built in either order, or interleaved, without conflict.

Phase 4 depends on Phase 2 because it needs real screens to restyle, but is
kept separate from logic changes so the open branding question
(`docs/context.md`) can be resolved independently and late, without
blocking gameplay work.

Phase 5 comes last and depends on 2–4 because "booth-ready" release
hardening (volume durability, reset run-book) only makes sense once the
full loop, real content, and final visual skin all exist to smoke-test
together.
