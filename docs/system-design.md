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
4. **Play** — prompt ("find the language" / "find the Pokémon") + 4 option
   buttons + a 10s per-round countdown + live score + round counter
   (e.g. "Round 3 / 12").
5. **Result** — final score, "new high score" indicator if applicable,
   confirm to submit to leaderboard (name already captured in step 2).
6. **Leaderboard** — ranked list (top 10), auto-returns to Attract after a
   short delay (e.g. 10s) or on any input.

### Game state machine

```
idle → name_entry → countdown → playing → result → leaderboard → idle
```

- On entering `playing`, the client fetches the full word list from
  `/api/words` and builds a session client-side: a randomized round count
  (1-20), where each round randomly picks a mode (find-the-language or
  find-the-pokemon) and draws its answer + 3 decoys without replacement
  from the remaining pool.
- Each round ticks its own 10s timer (configurable constant). A correct
  pick, wrong pick, or timeout all advance to the next round; only running
  out of rounds transitions to `result` (per the no-penalty rule in
  `idea.md`).

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

**Word dataset** (`api/src/data/words.json`, static, 50 Pokémon + 50
programming languages curated specifically because their names are easy to
mistake for the other category — full source list in `context.md`):

```json
[
  { "text": "Porygon", "category": "pokemon" },
  { "text": "Scala", "category": "language" },
  { "text": "Gholdengo", "category": "pokemon" },
  { "text": "Malbolge", "category": "language" }
]
```

The API returns the full 100-word list in one response; round-building
(random round count, mode per round, decoy selection) happens client-side
so no round-shape logic lives in the API.

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

- Word dataset is now the full curated 50/50 list (see `context.md` for
  source); no further curation work pending.
- "Flying Papers" visual skin has been applied to the frontend (Tailwind v4
  tokens wired up, all screens styled) — no longer an open item.
