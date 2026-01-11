# Architecture & Refactor Plan

## 1. High-Level Architecture

We are moving to a **Feature-Based (Vertical Slice)** architecture powered by a **View-First** dependency flow.

### Core Principles

1.  **Group by Ruleset/System:** Features are organized by game system (e.g., `wod-20`, `wod-5`) rather than generic types.
2.  **View-First Definitions:** The **View** is the source of truth for Interface Interaction Contracts. It exports the Interaction ID and the Payload Schema.
3.  **Interface Handlers Implement Contracts:** Handlers import the contract from the View to register themselves. They never define IDs independently.
4.  **Dependency Flow:** `Handler` → imports → `View` → imports → `Shared/Lib`. (No Circular Dependencies).

---

## 2. Directory Structure

We avoid deep nesting of "splats". We separate by major System (Edition), then by Module (Domain).

```text
src/
├── features/
│   ├── core/                   # Generic/System-Agnostic Features
│   │   ├── admin/
│   │   │   ├── admin.views.ts
│   │   │   └── admin.handlers.ts
│   │   └── help/
│   │
│   ├── wod-20/                 # V20 Specific Logic
│   │   ├── character/
│   │   │   ├── sheet.views.ts  # Main character sheet UI
│   │   │   └── sheet.handlers.ts
│   │   ├── dice/
│   │   │   ├── roller.views.ts # Difficulty selector
│   │   │   └── roller.handlers.ts
│   │   └── index.ts            # Public API (if needed)
│   │
│   └── wod-5/                  # V5 Specific Logic
│       ├── character/
│       └── dice/
│
├── shared/                     # Cross-feature infrastructure
│   ├── framework/              # The "Engine" (Loaders, Base Classes)
│   ├── utils/                  # Stateless Helpers (Math, Strings)
│   └── types/                  # Global shared types
│
└── main.ts                     # Entry point
```

---

## 3. Naming Conventions

We use a strict **kebab-case** file naming strategy with **dot-notation suffixes** to denote the file's role. This ensures files are grouped visually in the editor.

### File Patterns

| Role         | Pattern                      | Example                     |
| ------------ | ---------------------------- | --------------------------- |
| **Views**    | `{feature-name}.views.ts`    | `char-creation.views.ts`    |
| **Handlers** | `{feature-name}.handlers.ts` | `char-creation.handlers.ts` |
| **Actions**  | `{action-name}.action.ts`    | `increase-hunger.action.ts` |
| **Services** | `{service-name}.service.ts`  | `xp-calculator.service.ts`  |

### The "Twin File" Rule

To manage large numbers of handlers, we enforce a **1-to-1 Mapping** between View files and Handler files.

If you have a view file named `creation-wizard.views.ts` that defines 5 buttons and 2 modals, all 7 corresponding handlers **must** live in `creation-wizard.handlers.ts`.

- **Benefit:** If you are editing the View, you know exactly where the Logic lives (just change `.views` to `.handlers`).
- **Benefit:** Prevents "Handler Bloat" where one `handlers.ts` file contains 50 unrelated interactions.

### Variable/Class Naming

- **View Contracts:** PascalCase. Should sound like a noun.
- `ApproveSheetBtn`
- `EditStatsModal`

- **Handler Instances:** camelCase with `Handler` suffix.
- `approveSheetHandler`
- `editStatsHandler`

---

## 4. The View-First Workflow

### Step 1: The View (`char-sheet.views.ts`)

Defines the **Contract** (ID + Schema) and the **UI**.

```typescript
// 1. Define Contract
export const RerollBtn = createInterfaceDef<{ risk: number }>("v20_reroll");

// 2. Define UI
export const renderSheet = (props: any) => {
  return new ButtonBuilder().setCustomId(RerollBtn.encode({ risk: 5 })); // Uses Contract
};
```

### Step 2: The Handler (`char-sheet.handlers.ts`)

Implements the logic.

```typescript
import { RerollBtn, renderSheet } from './char-sheet.views';

// 1. Register Handler using Contract
export const rerollHandler = new InterfaceHandler(RerollBtn, async (ctx, params) => {
  // params is typed as { risk: number }
  await ctx.reply(renderSheet(...));
});

```

---

## 5. Infrastructure vs. Utilities

To prevent circular dependencies and spaghetti code, we strictly separate the "Framework" from "Utilities".

### A. Shared/Framework (`src/shared/framework/`)

**Definition:** Code that defines **how the bot runs**. It dictates architecture.
**Dependencies:** Can import library code (Discord.js). **Cannot** import Features.
**Contents:**

- `base-handler.ts`: The `InterfaceHandler` and `CommandHandler` abstract classes.
- `loader.ts`: The dynamic file scanner (`fast-glob`) that registers handlers.
- `registry.ts`: The Map that holds active handlers.
- `router.ts`: The `interactionCreate` event listener.

### B. Shared/Utils (`src/shared/utils/`)

**Definition:** Stateless helper functions. Pure logic.
**Dependencies:** Zero dependencies on the Framework or Features.
**Contents:**

- `formatting.ts`: Text formatting, date formatting.
- `math.ts`: Random number generators, dice math helpers.
- `interface-utils.ts`: The `createInterfaceDef` helper function.

### C. Shared/Types (`src/shared/types/`)

**Definition:** Global TypeScript interfaces used across multiple features.
**Contents:**

- `user-context.d.ts`: Extensions to the Discord Request object.
- `config.d.ts`: Environment variable schemas.
- _Note: Feature-specific DTOs (like `VampireSheet`) should stay inside `features/wod-20/types.ts`, not here._

---

## 6. Implementation Checklist

1. [ ] **Scaffold:** Create the `features/wod-20` and `features/wod-5` folders.
2. [ ] **Framework:** Move `BaseHandler` and `InterfaceHandler` to `shared/framework`.
3. [ ] **Utils:** Create `createInterfaceDef` in `shared/utils`.
4. [ ] **Loader:** Update `loader.ts` to scan `src/features/**/*.handlers.ts`.
5. [ ] **Refactor:** Migrate the first View/Handler pair (e.g., generic Dice Roll) to the new structure to validate the flow.

---

### 1. The Dependencies

You will need `fast-glob` to efficiently scan your directory tree.

```bash
npm install fast-glob

```

### 2. The Registry (`src/shared/framework/registry.ts`)

This is the central storage. It doesn't know about files; it just holds the maps of active handlers.

```typescript
import { Collection } from "discord.js";
import {
  BaseInteractionHandler,
  CommandHandler,
  InterfaceHandler,
} from "./base-handler";

// Map for Command Names -> Handlers
export const commands = new Collection<string, CommandHandler>();

// Map for Interaction IDs -> Handlers
// We use a Map for O(1) lookups on buttons/modals
export const interactions = new Map<string, InterfaceHandler<any>>();

export function registerHandler(handler: BaseInteractionHandler) {
  if (handler instanceof CommandHandler) {
    if (commands.has(handler.data.name)) {
      console.warn(`[Registry] Duplicate Command: ${handler.data.name}`);
      return;
    }
    commands.set(handler.data.name, handler);
  } else if (handler instanceof InterfaceHandler) {
    if (interactions.has(handler.handlerId)) {
      console.warn(`[Registry] Duplicate Interface: ${handler.handlerId}`);
      return;
    }
    interactions.set(handler.handlerId, handler);
  }
}
```

### 3. The Loader (`src/shared/framework/loader.ts`)

This is the "Engine". It scans the folders, imports the files, and extracts the exports.

**Key Logic:**

1. Scan for `**/*.handlers.ts` (enforcing the naming convention).
2. Import the file.
3. Loop through **every export** in that file.
4. Check if the export is an instance of `BaseInteractionHandler`.

```typescript
import { glob } from "fast-glob";
import path from "path";
import { BaseInteractionHandler } from "./base-handler";
import { registerHandler } from "./registry";

export async function loadHandlers(rootDirectory: string) {
  const start = Date.now();

  // 1. Find Files
  // Matches: src/features/wod-20/dice/dice.handlers.ts
  const pattern = "**/*.handlers.{ts,js}";

  const files = await glob(pattern, {
    cwd: rootDirectory,
    absolute: true,
    ignore: ["**/*.test.ts", "**/*.spec.ts"],
  });

  console.log(`[Loader] Found ${files.length} handler files. Loading...`);

  let loadedCount = 0;

  // 2. Process Files
  for (const filePath of files) {
    try {
      // Dynamic Import
      const module = await import(filePath);

      // 3. Scan Exports
      for (const [key, exportedItem] of Object.entries(module)) {
        // Instance Check
        if (exportedItem instanceof BaseInteractionHandler) {
          registerHandler(exportedItem);
          loadedCount++;
        }

        // Optional: Support Arrays of Handlers
        else if (Array.isArray(exportedItem)) {
          for (const item of exportedItem) {
            if (item instanceof BaseInteractionHandler) {
              registerHandler(item);
              loadedCount++;
            }
          }
        }
      }
    } catch (err) {
      console.error(`[Loader] Failed to load file: ${filePath}`, err);
    }
  }

  console.log(
    `[Loader] Registered ${loadedCount} handlers in ${Date.now() - start}ms.`
  );
}
```

### 4. The Entry Point (`src/main.ts`)

Connects it all together on startup.

```typescript
import path from "path";
import { loadHandlers } from "./shared/framework/loader";
import { client } from "./client"; // Your Discord Client

async function bootstrap() {
  // Point to the 'features' folder
  const featuresPath = path.join(__dirname, "features");

  // 1. Load Registry
  await loadHandlers(featuresPath);

  // 2. Login
  await client.login(process.env.DISCORD_TOKEN);
}

bootstrap();
```

### 5. The Router (`src/shared/framework/router.ts`)

This is the `interactionCreate` event listener that uses the registry.

```typescript
import { Interaction } from "discord.js";
import { commands, interactions } from "./registry";

export async function handleInteraction(interaction: Interaction) {
  try {
    // --- COMMANDS ---
    if (interaction.isChatInputCommand()) {
      const handler = commands.get(interaction.commandName);
      if (handler) await handler.execute(interaction);
      return;
    }

    // --- INTERFACES (Buttons / Modals / Selects) ---
    if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
      // 1. Extract ID (Format: "action_id:params")
      // We only care about the part before the colon
      const [handlerId] = interaction.customId.split(":");

      // 2. Lookup
      const handler = interactions.get(handlerId);

      // 3. Execute
      if (handler) {
        // The handler's decode logic happens inside handler.execute() or wrapper
        await handler.execute(interaction);
      } else {
        console.warn(`[Router] No handler found for ID: ${handlerId}`);
        // Optional: await interaction.reply({ content: 'Interaction expired', ephemeral: true });
      }
    }
  } catch (error) {
    console.error("[Router] Interaction Error:", error);
  }
}
```

### Why this fits your plan:

1. **Zero Config:** You don't need to manually import files. Just name it `*.handlers.ts` and export the handler.
2. **Multi-Export:** You can have `export const btn1 = ...` and `export const btn2 = ...` in the same file; the `Object.entries` loop catches them all.
3. **Safe:** It ignores non-handler exports (like helper functions or types) because of the `instanceof` check.
