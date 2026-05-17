---
name: import-organization
description: Use this skill when writing imports, configuring barrel exports, or managing file dependencies across modules.
---

# Import Organization

This repository adheres to strict import organization rules to prevent build breaks and maintain a clean dependency tree.

## 1. ALWAYS Use Barrel Exports

- **MANDATORY**: Import from barrel exports (`index.ts`), NEVER from direct file paths if a barrel export exists.
- Every directory MUST have an `index.ts` file exporting all public members.

**Correct:**

```typescript
import { CustomIdProtocol } from "utilities";
```

**Wrong:**

```typescript
import { CustomIdProtocol } from "./utilities/custom-id-protocol.utility";
```

## 2. NEVER Use File Extensions in Imports

- This is a hard rule with ZERO exceptions. File extensions will break the build.

**Correct:**

```typescript
import { users } from "./schema/users";
```

**Wrong:**

```typescript
import { users } from "./schema/users.js";
import { users } from "./schema/users.ts";
```

## 3. NEVER Import from /index Explicitly

**Correct:**

```typescript
import { User } from "./entities";
```

**Wrong:**

```typescript
import { User } from "./entities/index";
```

## 4. Import Ordering

Organize imports in this exact order:

1. **External dependencies** (e.g., `@nestjs/common`, `uuid`)
2. **Internal package imports** (`@realm/*`)
3. **Relative imports** (using barrel exports, NO extensions, NO `/index`)
4. **Type-only imports** (`import type { ... }`)
