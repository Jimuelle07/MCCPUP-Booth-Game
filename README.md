<div align="center">

# MCCPUP-Booth-Game

<p>
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white&labelColor=1a1025" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white&labelColor=1a1025" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat&logo=tailwindcss&logoColor=white&labelColor=1a1025" />
  <img alt="Express" src="https://img.shields.io/badge/Express-4-000000?style=flat&logo=express&logoColor=white&labelColor=1a1025" />
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-leaderboard-003B57?style=flat&logo=sqlite&logoColor=white&labelColor=1a1025" />
  <img alt="Azure AD B2C" src="https://img.shields.io/badge/Azure_AD_B2C-Auth-0078D4?style=flat&logo=microsoftazure&logoColor=white&labelColor=1a1025" />
  <img alt="Azure Container Apps" src="https://img.shields.io/badge/Azure-Container_Apps-0078D4?style=flat&logo=microsoftazure&logoColor=white&labelColor=1a1025" />
  <img alt="Docker" src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white&labelColor=1a1025" />
</p>

</div>

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
organizers, backed by Azure AD B2C (Microsoft Entra External ID). B2C hosts
the actual sign-in/sign-up/password-reset forms itself on its own secure,
brandable page — this app's `/admin` pages just launch that flow and land
on a dashboard once it returns a token, they never collect a password
directly. It's off by default: without B2C config the admin pages show a
"not configured" screen and the public game is unaffected.

To enable it:

1. Copy `frontend/.env.example` → `frontend/.env` and `api/.env.example` →
   `api/.env`, then fill in your own Azure AD B2C tenant's values. **Never
   commit these files** — they're gitignored on purpose.
2. Restart the dev servers (or rebuild the Docker images) so the new env
   vars are picked up.
3. From `/admin/signup`, use B2C's hosted "Sign up now" link with an email
   listed in `api/.env`'s `ADMIN_EMAILS`, then sign in at `/admin/login`.

Full Azure AD B2C setup and serverless (Container Apps) deployment steps
are in [`docs/deployment.md`](docs/deployment.md).

## Project structure

```
api/         Express API + SQLite leaderboard + admin auth middleware
  src/middleware/  Azure AD B2C token verification for /api/admin/*
  src/routes/      words, scores, admin
frontend/    React + Vite game UI, built and served via nginx in Docker
  src/admin/       /admin login, sign up, forgot-password, dashboard
  src/lib/         MSAL (Azure AD B2C) client init
docs/        Docs-first project artifacts (context, idea, system design,
             plan, deployment)
design/      Visual reference assets ("Flying Papers" style kit)
```
