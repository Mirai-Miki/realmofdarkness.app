# Realm of Darkness

![Project Banner](https://res.cloudinary.com/dze64d7cr/image/upload/v1701410603/Logo/banner_bg_index.webp)

Realm of Darkness is a pnpm/Turborepo monorepo for a World of Darkness platform (API, Discord bots, shared packages, and docs).

The repository is in an active refactor from legacy Django/JavaScript services to a TypeScript-first architecture based on NestJS, PostgreSQL, Drizzle, and shared domain packages.

## Current State (March 2026)

- Refactor branch is active (`refactor/project-overhaul`)
- New TypeScript monorepo foundation is in place
- Core shared packages are implemented and building
- API exists as a NestJS Fastify app scaffold
- Bot app is TypeScript-based and integrated with shared packages
- Legacy code is preserved under [legacy/](legacy) as reference-only

## Repository Layout

```text
realm-of-darkness/
├── apps/
│   ├── api/         # @realm/api (NestJS + Fastify)
│   ├── bot/         # @realm/bot (Discord.js)
│   └── codex/       # @realm/codex (Astro/Starlight docs)
│
├── packages/
│   ├── assets/        # @realm/assets
│   ├── common/        # @realm/common (schemas, types, contracts, errors)
│   ├── content/       # @realm/content
│   ├── core/          # @realm/core (entities, services, actions)
│   ├── database/      # @realm/database (Drizzle schema + DB tooling)
│   ├── events/        # @realm/events (event system package)
│   ├── logger/        # @realm/logger
│   └── repositories/  # @realm/repositories
│
├── legacy/
│   ├── backend-legacy/
│   ├── bot-legacy/
│   └── frontend-legacy/
│
└── scripts/
```

## Architecture Rules (Important)

- Type safety first (strict TypeScript, explicit types)
- Zod-first contracts in `@realm/common`
- No TypeScript enums (use `as const` objects)
- Barrel exports required (`index.ts` exports)
- No `.js` extensions in TypeScript imports
- Domain logic in `@realm/core`; persistence in `@realm/repositories`

See [NAMING_CONVENTIONS.md](NAMING_CONVENTIONS.md) and [DOMAIN_REPOSITORY_EXPLAINED.md](DOMAIN_REPOSITORY_EXPLAINED.md).

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 10+
- PostgreSQL

### Setup

```bash
pnpm install
cp .env.example .env
pnpm build
```

Environment is centralized in one root `.env`. See [ENV_SETUP.md](ENV_SETUP.md).

## Common Commands

```bash
# Development
pnpm dev
pnpm dev:api
pnpm dev:bot
pnpm dev:bot:5th
pnpm dev:bot:20th
pnpm dev:bot:cod

# Build / quality
pnpm build
pnpm lint
pnpm test
pnpm format

# Database
pnpm db:generate
pnpm db:migrate
pnpm db:studio
pnpm db:reset
```

## Legacy Code Policy

Code under [legacy/](legacy) is frozen and kept for reference while features are ported to the new TypeScript packages.

## Contributing

1. Create a branch (`feature/*`, `refactor/*`, `fix/*`, `docs/*`, etc.)
2. Follow repository conventions and package boundaries
3. Run `pnpm build`, `pnpm lint`, and `pnpm test`
4. Open a pull request with a focused description

## License

Licensed under AGPL. See [LICENSE](LICENSE).
