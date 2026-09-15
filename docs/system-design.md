# System Design

Implements the loop described in `idea.md` under the constraints in
`context.md`. This is architecture and interface design, not yet an
implementation — no code exists in this repo yet.

## Architecture overview

Single Docker Compose stack, two containers, one shared volume for the
leaderboard database:

```
┌─────────────────────────────┐        ┌──────────────────────────────┐
│  frontend (nginx)            │  HTTP  │  api (Node/Express)          │
│  React + Vite build, static  │ ─────► │  serves word dataset,        │
│  files served by nginx       │        │  leaderboard CRUD            │
│  reverse-proxies /api/* → api│        │                              │
└─────────────────────────────┘        └──────────────┬───────────────┘
                                                        │
                                                 ┌──────▼───────┐
                                                 │ SQLite file   │
                                                 │ (volume mount)│
                                                 └───────────────┘
```

- Everything runs on `localhost` via `docker compose up`; no external network
  calls at runtime (word dataset is a bundled JSON file, not a live API).
- Two containers (not one) so the frontend build and the API/data layer can
  be developed, rebuilt, and restarted independently — still a single
  `docker-compose.yml` and a single command to run.

## Tech stack

| Layer      | Choice                                | Why |
|------------|----------------------------------------|-----|
| Frontend   | React 18 + Vite + Tailwind v4          | Tailwind v4 tokens already extracted in `design/tailwind-v4.md`; Vite gives fast local dev and a small static production build. |
| Backend    | Node.js + Express                      | Same language as frontend; trivial JSON + SQLite API, no need for a heavier framework. |
| Database   | SQLite (file-based, e.g. via `better-sqlite3`) | Leaderboard is small, single-writer, local-only — no need for a network database. Easy to volume-mount and reset between events. |
| Serving    | nginx (serves the built frontend, proxies `/api` to the Node service) | Standard static-file + reverse-proxy pattern; keeps the Node process focused on the API. |
| Packaging  | Docker + Docker Compose                | Required constraint (`context.md`) — must run locally via Docker. |

## Repo/folder structure (proposed)

```
/
├── docs/                      # this planning pass
├── design/                    # existing style-token reference
├── frontend/
│   ├── src/
│   │   ├── screens/           # Attract, NameEntry, Countdown, Play, Result, Leaderboard
│   │   ├── components/        # AnswerButton, ScoreBadge, Timer, WordCard, LeaderboardTable
│   │   ├── state/             # game state machine (see below)
│   │   ├── styles/            # tailwind.css importing tokens from design/tailwind-v4.md
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── Dockerfile
├── api/
│   ├── src/
│   │   ├── data/words.json    # curated Pokémon + programming language dataset
│   │   ├── routes/words.ts    # GET /api/words
│   │   ├── routes/scores.ts   # GET/POST /api/scores
│   │   ├── db.ts              # SQLite setup + migrations
│   │   └── server.ts
│   └── Dockerfile
└── docker-compose.yml
```

## Frontend

### Screens (maps 1:1 to the core loop in `idea.md`)

1. **Attract** — idle loop, title, "click/press to start," shows current
   top-3 leaderboard. Returns here automatically after Leaderboard screen
   times out.
2. **NameEntry** — short text input (name/initials), confirm to continue.
3. **Countdown** — 3-2-1 visual beat, no input accepted.
4. **Play** — word display + two answer controls + live timer + live score.
   Accepts click on either answer button, or Left/Right arrow keys.
5. **Result** — final score, "new high score" indicator if applicable,
   confirm to submit to leaderboard (name already captured in step 2).
6. **Leaderboard** — ranked list (top 10), auto-returns to Attract after a
   short delay (e.g. 10s) or on any input.

### Game state machine

```
idle → name_entry → countdown → playing → result → leaderboard → idle
```

- `playing` internally ticks a timer (default 60s, configurable constant)
  and advances through a shuffled queue of words from `/api/words`, with no
  immediate repeats.
- Any wrong or right answer stays inside `playing` — only the timer
  expiring transitions to `result` (per the no-penalty rule in `idea.md`).

### Components mapped to design tokens

Reusing shapes/tokens from `design/DESIGN.md` / `design/tailwind-v4.md`
(flagged in `context.md` as a borrowed, not purpose-built, style kit):

- **AnswerButton** → "Gate Pill Button" pattern (100px pill radius, flat
  fill, one accent color).
- **WordCard** → "Hero Display Headline" pattern (oversized display type,
  centered).
- **ScoreBadge / Timer** → "Mono Label Tag" pattern (small mono/sans label).
- **LeaderboardTable rows** → "Dark Text Card" / "Color Swatch Card"
  patterns for alternating row emphasis.

## Backend / API

Minimal JSON API, no auth (local booth use only):

| Method | Path           | Purpose                                      |
|--------|----------------|-----------------------------------------------|
| GET    | `/api/words`   | Returns the full word dataset (id, text, category). Frontend shuffles/queues client-side. |
| GET    | `/api/scores`  | Returns top N leaderboard entries, descending by score. |
| POST   | `/api/scores`  | Submits `{ name, score }`; server validates and inserts. |

### Data model

**Word dataset** (`api/src/data/words.json`, static, curated by hand —
content itself is an implementation task, not part of this design doc):

```json
[
  { "text": "Pikachu", "category": "pokemon" },
  { "text": "Python", "category": "language" },
  { "text": "Snorlax", "category": "pokemon" },
  { "text": "Rust", "category": "language" }
]
```

**Leaderboard table** (SQLite):

```sql
CREATE TABLE scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

- `name` is free-text (initials or short name), not unique — repeat players
  can appear multiple times on the board.
- No update/delete endpoint needed for v1; a booth operator can reset by
  clearing the SQLite file/volume between events if desired.

## Persistence

- SQLite file lives in a named Docker volume (e.g. `leaderboard-data`)
  mounted into the `api` container, so scores survive container
  restarts but can be wiped by removing the volume (`docker compose down -v`)
  — useful for resetting between separate booth events.

## Docker

- `frontend/Dockerfile`: multi-stage — build with Node, serve the static
  output with nginx; nginx config proxies `/api/*` to the `api` service.
- `api/Dockerfile`: single-stage Node image running the Express server.
- `docker-compose.yml`: defines `frontend` (published port, e.g. 8080),
  `api` (internal only, not published), and the `leaderboard-data` volume.
- Run instructions: `docker compose up --build`, open `http://localhost:8080`.

## Non-functional notes

- **Offline-first:** no runtime calls outside the two local containers.
- **Resettable:** volume can be wiped between events; containers are
  stateless otherwise.
- **Low ops overhead:** no external services, no auth, no build step needed
  on the booth machine beyond `docker compose up` (assuming Docker is
  already installed).

## Open risks / follow-ups

- Word dataset content (the actual curated list and its size/difficulty
  balance) is not yet built — tracked as an open item in `context.md`.
- Visual reuse of the "Flying Papers" style kit needs confirmation before
  frontend implementation (see `context.md`).
- No phase/implementation plan has been written yet; recommend creating one
  (Monozukuri blueprint stage 4 equivalent) once these three docs are
  reviewed and approved.
