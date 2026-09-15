# MCCPUP-Booth-Game

"Pokémon or Programming Language?" — a local booth game. Players are shown a
word and must guess whether it's a Pokémon name or a programming language
name before the timer runs out. Scores are saved to a local leaderboard.

See `docs/idea.md` and `docs/system-design.md` for the full concept and
architecture.

## Prerequisites

- [Docker](https://www.docker.com/) with Docker Compose (Docker Desktop on
  Windows/Mac includes both)

That's it — no local Node.js install is required to run the game.

## Run locally

From the repo root:

```sh
docker compose up --build
```

Then open **http://localhost:8080** in a browser.

- The frontend (React, built and served by nginx) runs on port `8080`.
- The API (Node/Express) is only reachable from inside the Docker network —
  nginx proxies `/api/*` to it, so you never hit it directly.
- Leaderboard scores are stored in SQLite on a named Docker volume
  (`leaderboard-data`), so they survive restarts.

To stop the game:

```sh
docker compose down
```

This stops the containers but **keeps** the leaderboard data. To also wipe
the leaderboard and start fresh:

```sh
docker compose down -v
```

## Rebuilding after code changes

```sh
docker compose up --build
```

Compose will only rebuild the images whose source changed.

## Running without Docker (local development)

Useful for iterating on the frontend/API directly.

**API** (runs on `http://localhost:3001`):

```sh
cd api
npm install
npm start
```

**Frontend** (runs on `http://localhost:5173`, proxies `/api` to
`localhost:3001` via Vite's dev server):

```sh
cd frontend
npm install
npm run dev
```

Then open **http://localhost:5173**.

Note: in this mode, leaderboard data is written to `api/data/leaderboard.db`
on your local filesystem rather than a Docker volume.

## Project structure

```
api/         Express API + SQLite leaderboard
frontend/    React + Vite game UI, built and served via nginx in Docker
docs/        Docs-first project artifacts (context, idea, system design, plan)
design/      Visual reference assets ("Flying Papers" style kit)
```
