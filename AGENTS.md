# Global Architecture & Behavior Standards

You are an expert software engineer operating within a strict TypeScript monorepo. These rules apply to all code generation and analysis across the entire workspace.

## 1. Monorepo & Tooling

- **Package Manager**: This workspace strictly uses `pnpm` and Turborepo. Never suggest or run `npm`, `yarn`, or `bun` commands.
- **Legacy Code Boundary**: Completely ignore the `legacy/` directory (the old Python/Django backend and old React frontend) unless the user explicitly instructs you to port a specific feature to the new stack.
- **Internal Imports**: Always use internal workspace package imports (e.g., `@rod/common`, `@rod/database`, `@rod/assets`) instead of relative paths traversing up to `../../packages/`.
- **Formatting, Linting & Build Verification**: You must strictly adhere to the project's ESLint (`eslint.config.mjs`) and Prettier (`.prettierrc.json`) configurations. Before finalizing your work or declaring a task finished, you must execute the following validation tasks using the project repository's tooling:
  1. Run the formatter to correct any code styling (`pnpm format`).
  2. Run the workspace linter to identify and fix any remaining programmatic violations (`pnpm lint`).
  3. Run a filtered build targeting the specific package or app you were just working on (e.g., `pnpm --filter <package-or-app-name> build`) to verify complete compile-time integrity.

## 2. TypeScript & Code Quality

- **Strict Typing**: Never use `any`. Use `unknown` if a type is truly indeterminate, and always follow up with explicit type narrowing or type guards.
- **Zero Lint Tolerances**: Do not leave unused imports, unhandled variables, or dangling expressions under any circumstances. Even temporary code, scaffolding, mock setups, or structural placeholders must be completely type-safe and fully valid under the project's strict ESLint rules. They must not rely on temporary rule bypasses or ignores.
- **Validation**: Rely heavily on `zod` for all data validation across the API and Discord client. If a type can be inferred from a Zod schema using `z.infer`, do not manually write a duplicate TypeScript interface.
- **Immutability**: Prefer immutable data structures. Avoid `let` where `const` can be used.

## 3. Inline Documentation & Comments

- **Public Exports & Structural APIs**: Every publicly exported function, method, class, interface, type alias, or module boundary **must** be documented using valid, multi-line JSDoc syntax. Include clear descriptions of intent, parameters (`@param`), return types (`@returns`), and thrown exceptions (`@throws`) where applicable.
- **Internal & Private Logic**: Every private class member, unexported utility function, or complex internal code block **must** contain descriptive, clear, single-line or multi-line standard comments explaining _why_ the implementation is handled this way, rather than just _what_ the code does.

## 4. Monorepo Package Topology & Boundaries

Code must be isolated within the correct workspace boundary according to intent, dependency direction, and reuse:

### Applications (`apps/`)

- `apps/api`: NestJS backend. Code unique to the API that is not shared with the bot or frontend must live here.
- `apps/discord`: Discord.js v14+ client layer.
- `apps/codex`: Astro web documentation layer.

### Packages (`packages/`)

- `packages/common`: Universal types, baseline contracts, shared enums, primitives, and interfaces. Contains **strictly zero business logic**.
- `packages/core`: Services, domain entities, value objects, and application-shared controllers. Logic shared between `apps/api` and `apps/discord` lives here. Non-shared logic remains in its respective app folder.
- `packages/repositories`: The **exclusive database access gateway**. All apps and services must perform data mutations and queries through this package. No other app or package may touch or query the database layer directly.
- `packages/database`: Drizzle ORM schema definitions, configuration files, and database migrations. It is only touched directly by `packages/repositories`.
- `packages/logger`: The centralized logging system wrapper used throughout the workspace.
- `packages/content`: Management schemas, data structures, and MDX collections for static text/data content.
- `packages/assets`: Shared static graphics (images, token files, dice emojis) and automatically generated asset map type definitions.
- `packages/events`: Inter-app communication contracts and clients designed for a Redis pub/sub messaging backend.
