# MCCPUP-Booth-Game

<p>
  <img alt="Last commit" src="https://img.shields.io/github/last-commit/Jimuelle07/MCCPUP-Booth-Game?style=flat-square&color=c084fc" />
  <img alt="Open issues" src="https://img.shields.io/github/issues/Jimuelle07/MCCPUP-Booth-Game?style=flat-square&color=c084fc" />
  <img alt="Repo size" src="https://img.shields.io/github/repo-size/Jimuelle07/MCCPUP-Booth-Game?style=flat-square&color=c084fc" />
</p>

<p>
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white" />
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-leaderboard-003B57?style=flat-square&logo=sqlite&logoColor=white" />
  <img alt="Firebase Auth" src="https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black" />
  <img alt="Google Cloud Run" src="https://img.shields.io/badge/Google_Cloud-Cloud_Run-4285F4?style=flat-square&logo=googlecloud&logoColor=white" />
  <img alt="Docker" src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white" />
</p>

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

## Admin dashboard (optional)

`/admin` has a separate login / sign up / forgot-password flow for booth
organizers, backed by GCP Identity Platform (Firebase Authentication) —
email/password with real password resets, plus "Continue with Google"
OAuth2.0. It's off by default: without Firebase config the admin pages show
a "not configured" screen and the public game is unaffected.

To enable it:

1. Copy `frontend/.env.example` → `frontend/.env` and `api/.env.example` →
   `api/.env`, then fill in your own Firebase project's values. **Never
   commit these files** — they're gitignored on purpose.
2. Restart the dev servers (or rebuild the Docker images) so the new env
   vars are picked up.
3. Sign up at `/admin/signup` with an email listed in `api/.env`'s
   `ADMIN_EMAILS`, then sign in at `/admin/login`.

Full GCP setup and serverless (Cloud Run) deployment steps are in
[`docs/deployment.md`](docs/deployment.md).

## Project structure

```
api/         Express API + SQLite leaderboard + admin auth middleware
  src/middleware/  Firebase ID token verification for /api/admin/*
  src/routes/      words, scores, admin
frontend/    React + Vite game UI, built and served via nginx in Docker
  src/admin/       /admin login, sign up, forgot-password, dashboard
  src/lib/         Firebase client init
docs/        Docs-first project artifacts (context, idea, system design,
             plan, deployment)
design/      Visual reference assets ("Flying Papers" style kit)
```
