# Copilot Instructions for Realm of Darkness

## Project Overview

- **Monorepo** for World of Darkness tabletop RPG platform: web app (React), backend (Django), Discord bots (Discord.js - Node.js/TypeScript).
- Key features: character sheets, Discord integration, real-time collaboration, chronicle/campaign management.

## Type Safety & Documentation Requirements

- **All code generated must use strict type safety:**
  - TypeScript: Always use explicit types, interfaces, and enums. Avoid `any` and implicit types.
  - Python: Use type hints for all functions, methods, and classes. Prefer `mypy`-compatible annotations.
  - Other languages: Use the strongest available type system features.
- **Documentation is mandatory for all code:**
  - Every function, class, and module must include clear, concise documentation (docstrings, JSDoc, or comments).
  - Document parameters, return types, and purpose. Use best practices for each language.
  - Example:
    - TypeScript: `/** ... */` JSDoc above functions/classes.
    - Python: Triple-quoted docstrings with parameter and return type info.

Copilot and all contributors should prioritize type safety and documentation in every code change, review, and generation task.

## Architecture & Major Components

- **backend/**: Django REST API, WebSocket (Channels), character/campaign logic, Discord OAuth, bot API, and scripts.
  - `rod/`: Django settings, root URLs, ASGI/WSGI config.
  - `haven/`: Character models (multi-level inheritance: base, system, splat), serializers, utilities.
  - `gateway/`: WebSocket consumers/routing, Redis channel layers.
  - `api/`, `bot/`, `discordauth/`, `chronicle/`, `patreon/`: API endpoints, OAuth, campaign, Patreon integration.
  - `scripts/`: Setup, dev, update, sync scripts for env/config/deps.
- **frontend/**: React SPA, Material-UI, WebSocket client, Discord OAuth, character sheet UI, routes per game system.
  - `src/components/Sheet*`, `routes/`, `gateway/`, `structures/`.
- **discord_bots/**: Discord.js bots for 5th Edition, 20th Edition, Chronicles of Darkness; slash commands, dice rolling, character sync.
  - `src/commands/`, `src/events/`, `src/realm_api/` (backend API client), `modules/`, `constants/`.

## Developer Workflows

- **Full-stack dev**: Run `dev.bat` (Windows) or `dev.sh` (Linux/macOS) from project root. Starts backend (Django+Redis) and frontend (React) in separate terminals.
- **Backend only**: `backend/scripts/dev.bat` or `dev.sh`. Handles env setup, venv, deps, code format (Black), migrations, Redis, Django server.
- **Frontend only**: `frontend/dev.bat` or `dev.sh`. Installs deps, formats code (Prettier), starts React dev server.
- **Discord bots**: `npm run dev:5th|20th|cod` in `discord_bots/` for local dev; `npm run deploy:all` for command deployment.
- **Env setup**: Use `backend/scripts/setup.bat|setup.sh` to create `.env` files (prompts for keys, DB, Discord, Patreon).
- **Python package updates**: `backend/scripts/update_packages.bat|.sh` (interactive), then `sync_requirements.bat|.sh` to sync prod/dev requirements.

## Key Patterns & Conventions

- **Character models**: Multi-level inheritance (base → system → splat). Use `splat` field to resolve actual type.
- **API separation**: `/api/` for frontend, `/bot/` for Discord bots (API key auth), `/ws/gateway/` for WebSocket.
- **Frontend**: Use React Context for global state, WebSocket for live updates, REST for CRUD. Proxy API/media via `setupProxy.js`.
- **Discord bots**: Use module aliases (`@commands`, `@realm_api`, etc.), error handling with user-friendly messages, always test in dev server first.
- **Branch naming**: `feature/`, `bugfix/`, `refactor/`, `docs/`, `test/`, `chore/`, `deps/`, `config/`, `ci/`, `style/`, `perf/`, `revert/`.

## Integration Points

- **Redis**: Required for backend WebSocket features. Dev scripts attempt to start Redis (WSL on Windows).
- **Environment variables**: Each component has its own `.env` file. Setup scripts prompt for all required values.
- **Backend/Discord bots**: API_KEY must match in both `.env` files for bot integration.
- **Frontend/backend**: WebSocket at `ws://localhost:8080/ws/`, REST at `http://localhost:8080/api/`.

## Troubleshooting

- If backend won't start: check Python version, Redis, `.env`.
- If frontend build fails: clear npm cache, reinstall deps.
- If bots don't respond: check tokens, API_KEY, backend status.
- See component READMEs for more details.

---

For unclear or missing sections, please provide feedback or specify which workflows, conventions, or integration details need further documentation.
