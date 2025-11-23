# Realm of Darkness Refactor Plan

## 1. Overview

Full replacement of current Django + MariaDB stack with a TypeScript-first monorepo:

- Runtime stack: NestJS (Fastify), PostgreSQL, Drizzle ORM, Redis (pub/sub + caching), Shared Domain Models.
- Single language surface (TypeScript) for API, bots, frontend, migration tooling.
- One-time database migration (no incremental / dual-write long term). Cutover after validation.

## 2. Core Goals

| Goal                                    | Description                                                               | Success Metric                               |
| --------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------- |
| Unified Domain                          | Shared executable character & chronicle models across API, bots, frontend | One source package used by all apps          |
| Eliminate Redundant Internal APIs       | Bots call domain/services directly instead of /bot/ endpoints             | Removal of legacy bot REST layer             |
| Strong Type Safety & Runtime Validation | Zod at ingress/egress; internal trust after parse                         | 0 unsafe `any`, validation at all boundaries |
| Clean Persistence Boundary              | Repositories map domain <-> Drizzle schema                                | Domain layer free of SQL / Drizzle imports   |
| Deterministic Migration                 | Typed pipeline OldRow -> NewDTO -> Domain -> Persist                      | Dry run produces zero rejects                |
| Fast Iteration                          | Cached, parallel task graph (Turborepo)                                   | Cold build < 60s, warm builds < 5s           |

## 3. Out of Scope (Initial Phase)

- Feature expansion of rules systems
- Frontend visual redesign
- Real-time protocol redesign beyond necessary parity

## 4. Target Monorepo Layout

```
apps/
  api/        # NestJS Fastify gateway (HTTP + WS)
  web/        # React SPA (later: consumes shared-types + domain)
  bots/       # Consolidated Discord bot process(es)
  migration/  # One-off CLI + integrity dashboards
packages/
  domain/         # Pure domain logic (rich models, invariants)
  db/             # Drizzle schemas, migrations, repositories
  shared-types/   # Zod DTOs, API & event contracts, generated OpenAPI
  events/         # Redis channel contracts + helpers
  gateway/        # WebSocket protocol (schemas, client/server utils)
  auth/           # Auth strategies (Discord OAuth, tokens)
  tooling/        # ESLint, tsconfig bases, shared scripts
infra/            # (Optional) IaC, Docker, compose
```

## 5. Package Responsibilities

- domain: Rich objects (Vampire5th, Chronicle) + methods; serialization/deserialization only.
- db: Table definitions, migrations, repository classes (CRUD + query composition).
- shared-types: DTO schemas (Zod) — stable contract surface for external/edge layers.
- events: Pub/sub typed channels; each event = { schema, channelName }.
- gateway: WS message schemas (subscribe, patch, broadcast) + utilities.
- auth: Abstractions for session/JWT/Discord; no framework coupling.
- migration: Reads legacy exports, validates, loads new DB, runs integrity checks.

## 6. tsconfig / Build Strategy

- One root `tsconfig.base.json` for compilerOptions + path aliases.
- Each app/package: individual `tsconfig.json` with `"composite": true`, `rootDir: src`, `outDir: dist`.
- Dev execution: `tsx -r tsconfig-paths/register` (no prebuild).
- Production: `pnpm build` → Turborepo orchestrates `tsc -b` or `tsup` for libraries, then apps.
- Never import another package’s `dist/` in source; rely on path aliases pointing to `src`.

## 7. Tooling: Turborepo Pipelines

Turborepo provides:

- Task graph resolution (dependency-aware ordering).
- Persistent + remote cache (optional) for build/test/lint.
- Parallel execution with output streaming.
  Pipeline example (see `turbo.json` below):
- build: runs only where sources changed.
- dev: parallel watchers (apps only).
- test / lint: cached by inputs (ts, config, lockfile).

## 8. Why Zod (vs. Only TypeScript)

| Concern              | TS Types Only        | With Zod                      |
| -------------------- | -------------------- | ----------------------------- |
| Runtime Safety       | None (erased)        | parse()/safeParse() enforces  |
| External Input       | Trust risk           | Rejected early, typed result  |
| Migration Validation | Manual ad-hoc checks | Unified schemas               |
| Shared Contracts     | Requires duplication | Single schema → inferred type |
| Discriminated Unions | Compile-time only    | Runtime narrowing supported   |
| Tooling / Codegen    | Needs extra metadata | Schemas already structured    |

Scope Zod usage to boundaries (HTTP handlers, WS ingress, Redis events, migration import). Internal pure logic uses static types only (no re-parse).

## 9. Database Migration (One-Time Cutover)

Phases:

1. Schema Design: Model new PostgreSQL schema (normalized, future-proof).
2. Legacy Snapshot: Lock writes (maintenance window). Dump MariaDB & store checksum manifest.
3. Export: Extract tables to NDJSON/CSV (stable ordering). Include foreign key manifests.
4. Transform & Validate: TypeScript migration CLI:
   - Load row → LegacyRowType
   - Map → NewDTO
   - Zod validate (shared-types)
   - Instantiate domain model
   - Persist via repositories (transactional batches)
5. Integrity Checks:
   - Row counts (expected vs actual)
   - Referential integrity (no orphan FKs)
   - Hash sampling (stable hash of canonical fields)
6. Dry Run Reports: Reject list (with reason). Fix mappers until zero rejects.
7. Final Run: Wipe target DB, rerun load, sign-off.
8. Cutover:
   - Deploy new stack (readiness + health checks)
   - DNS / reverse proxy switch
   - Archive legacy dumps
9. Post-Cutover Validation: Shadow queries (optional) or business KPIs.

Batching:

- Use chunk size tuned to transaction cost (e.g. 1k rows / transaction).
- Parallelize independent entity groups (characters vs chronicles) while respecting dependencies.

## 10. Integrity / Safety Tools

- Hash Function: Stable JSON canonicalization → SHA256 for each logical entity.
- Diff Reporter: Compares sets of (id, hash).
- FK Auditor: After load, run queries for any FK referencing missing PK.
- Null / Domain Range Auditor: Zod refinements finalize invariants.

## 11. Deployment Flow

1. `pnpm install`
2. `pnpm build` (Turborepo)
3. Run DB migrations: `pnpm --filter @realm/db exec drizzle-kit migrate`
4. Start services (Docker Compose or orchestrator):
   - api
   - bots
   - web (static build served by CDN/edge)
   - redis
   - postgres

## 12. Coding Standards (Enforced)

- No `any`. Use discriminated unions where polymorphism is needed.
- Functions ≤ single responsibility; pure where feasible.
- All exports documented (JSDoc).
- Runtime boundaries validated (no unparsed `unknown` escapes).
- Commit naming per existing branch / conventional commits style.

## 13. Proposed Initial turbos + workspace Config

### pnpm workspace

Root file `pnpm-workspace.yaml`:

```yaml
# pnpm workspaces
packages:
  - "apps/*"
  - "packages/*"
  - "infra"
  - "scripts"
```

### turbo.json

```jsonc
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "!dist/**/*.map"],
    },
    "lint": {
      "outputs": [],
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
    },
    "dev": {
      "cache": false,
      "persistent": true,
    },
    "codegen": {
      "outputs": ["src/generated/**"],
    },
  },
}
```

### Root package.json (excerpt)

```jsonc
{
  "private": true,
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "codegen": "turbo run codegen",
    "migrate": "pnpm --filter @realm/db exec drizzle-kit migrate",
  },
}
```

## 14. Environment & Configuration

- Each app reads `.env` + optional `.env.local` merging (dotenv-flow or similar).
- Central schema (Zod) for required variables in `tooling/env.ts`.
- Fail fast if any required config missing.

## 15. Logging & Observability (Baseline)

- Structured logs (pino) in API + bots.
- Request ID middleware propagated via Redis events.
- Health endpoints: `/healthz` (liveness), `/readyz` (readiness incl. DB + Redis ping).

## 16. Security Considerations

- Principle of least privilege DB roles (read vs migration).
- Input validation (Zod) prevents injection via untyped JSON.
- Remove legacy bot API keys post-cutover.
- Rotate secrets immediately after migration success.

## 17. Risk & Mitigation

| Risk                                    | Impact              | Mitigation                                                  |
| --------------------------------------- | ------------------- | ----------------------------------------------------------- |
| Schema mismatch discovered late         | Rollback complexity | Early dry run + exhaustive mapping docs                     |
| Performance regression in new queries   | User latency        | Load test repositories early using production-like snapshot |
| Over-validating (perf cost)             | Throughput drop     | Validate only at boundaries                                 |
| Drift between DTO and Drizzle schema    | Runtime errors      | Add schema-to-DTO sync test (snapshot compare field sets)   |
| Forgotten dependency edges in Turborepo | Build failures      | Add `tsc -b --verbose` CI gate                              |

## 18. Phase Breakdown

1. Scaffolding: Workspaces, tsconfig, empty packages, CI lint/build.
2. Domain Extraction: Port core character logic from existing code (no persistence).
3. DB Schema & Repos: Implement Drizzle tables + repositories.
4. Contracts: Zod DTOs + gateway message definitions.
5. Migration Tool: Legacy export parser + loaders + integrity suite.
6. API Implementation: Controllers → service → repository → domain.
7. Bots Refactor: Replace REST calls with direct imports.
8. Frontend Adapter: Hydrate domain models from gateway data.
9. Dry Runs & Load Tests.
10. Cutover & Post-Validation.
11. Decommission Legacy.

## 19. Open Decisions (Resolve Early)

- Naming strategy for table prefixes (snake_case vs existing style).
- Use of UUID vs numeric IDs (recommend UUID v7).
- Soft delete policy (global? per-entity?).
- Event versioning strategy (channel version suffix or payload `v` field).
- Pagination style: cursor vs offset (recommend cursor).

## 20. Immediate Action List

- [ ] Commit initial workspace scaffolding (pnpm, turbo, tsconfig.base).
- [ ] Create empty packages with documented readme stubs.
- [ ] Define initial Drizzle schema draft for core entities.
- [ ] Enumerate legacy → new field mapping spreadsheet.
- [ ] Build migration CLI skeleton (`apps/migration`).

---

Contact: Update this file when decisions finalize or scope shifts.

```

```
