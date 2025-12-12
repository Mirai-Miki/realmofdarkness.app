# @realm/common

**Shared Kernel** for the Realm of Darkness monorepo. Contains all contracts, interfaces, types, enums, and error definitions used across all packages.

## 🎯 Purpose

This package serves as the **Tier 0** foundation in our clean architecture:

- **Zero internal dependencies** (only depends on `zod` for schemas)
- **Defines the language** of the application (interfaces, types, enums)
- **No implementation details** - just contracts
- **All packages depend on this** - it depends on nothing

## 📦 Installation

This is a workspace package. Add it to your package dependencies:

```json
{
  "dependencies": {
    "@realm/common": "workspace:*"
  }
}
```

## 📚 What's Inside

### 1. **Interfaces** - Contracts for Infrastructure

All infrastructure packages implement these interfaces:

- `ILogger` - Logging contract (implemented by `@realm/logger`)
- `IEventClient` - Event pub/sub contract (implemented by `@realm/events`)
- `IGuildRepository` - Guild data access contract
- `IMemberRepository` - Member data access contract
- `ISupporterRepository` - Supporter subscription contract
- `IUserRepository` - User data access contract

### 2. **Types** - Core Type Definitions

- `Snowflake` - Discord ID type (string alias)
- `HttpStatus` - HTTP status code enum

### 3. **Enums** - Shared Enumerations

- `SheetStatus` - Character sheet status (Draft/Review/Active/Dead/Archive)
- `Splats` - All character types (Vampire5th, Hunter5th, Werewolf20th, etc.)
- `SupporterName` - Patreon supporter tiers
- `Environment` - Application environment (Development/Preproduction/Production)
- `LogLevel` - Logging levels (Debug/Info/Warning/Error/Fatal)

### 4. **Errors** - Two-Tier Error System

- `RealmError` - Internal application errors (logged by default)
- `UserError` - User-facing errors (not logged by default)

---

## 🔌 Interfaces

### ILogger

Logging contract for the application.

```typescript
import type { ILogger, LogLevel, Environment } from "@realm/common";

class MyService {
  constructor(private logger: ILogger) {}

  async doSomething() {
    this.logger.debug("Starting operation");
    this.logger.info("Operation completed", {
      fields: { duration: "1.2s" },
    });
    this.logger.error("Operation failed", {
      error: new Error("Database timeout"),
    });
  }
}
```

**Methods:**

- `setAppName(name: string): void` - Set the application name for logs
- `getAppName(): string` - Get current application name
- `configure(config: Partial<LoggerConfig>): void` - Update logger configuration
- `debug(message: string, options?: LogOptions): void` - Debug-level logs
- `info(message: string, options?: LogOptions): void` - Info-level logs
- `warning(message: string, options?: LogOptions): void` - Warning-level logs
- `error(message: string, options?: LogOptions): void` - Error-level logs
- `fatal(message: string, options?: LogOptions): void` - Fatal-level logs

### IEventClient

Event pub/sub contract for real-time communication.

```typescript
import type { IEventClient } from "@realm/common";

class MyService {
  constructor(private eventClient: IEventClient) {}

  async updateCharacter(char: Character) {
    await this.repo.save(char);

    // Publish event for other services
    await this.eventClient.publish(
      "character:updated",
      CharacterUpdatedSchema,
      {
        type: "character:updated",
        data: { characterId: char.id, userId: char.userId },
      }
    );
  }
}
```

**Methods:**

- `connect(): Promise<void>` - Establish connection
- `disconnect(): Promise<void>` - Close connection
- `publish<T>(channel, schema, event): Promise<void>` - Publish typed event
- `subscribe<T>(channel, schema, handler): Promise<void>` - Subscribe to events
- `subscribePattern<T>(pattern, schema, handler): Promise<void>` - Subscribe with pattern
- `unsubscribe(channel): Promise<void>` - Unsubscribe from channel

### Repository Interfaces

All repository interfaces define data access contracts with lightweight DTOs:

```typescript
import type { IUserRepository, User } from "@realm/common";

class MyService {
  constructor(private userRepo: IUserRepository) {}

  async getUser(id: string): Promise<User | null> {
    return await this.userRepo.findById(id);
  }
}
```

**Available Repositories:**

- `IGuildRepository` - Guild (Discord server) operations
- `IMemberRepository` - Guild membership operations
- `ISupporterRepository` - Patreon supporter subscriptions
- `IUserRepository` - User (Discord user) operations

---

## 📝 Types

### Snowflake

Discord snowflake ID type (string to preserve precision).

```typescript
import type { Snowflake } from "@realm/common";

const userId: Snowflake = "123456789012345678";
const guildId: Snowflake = BigInt(987654321098765432).toString();
```

### HttpStatus

Type-safe HTTP status codes.

```typescript
import { HttpStatus } from "@realm/common";

// 2xx Success
HttpStatus.OK; // 200
HttpStatus.CREATED; // 201
HttpStatus.NO_CONTENT; // 204

// 4xx Client Errors
HttpStatus.BAD_REQUEST; // 400
HttpStatus.UNAUTHORIZED; // 401
HttpStatus.FORBIDDEN; // 403
HttpStatus.NOT_FOUND; // 404
HttpStatus.METHOD_NOT_ALLOWED; // 405
HttpStatus.CONFLICT; // 409
HttpStatus.UNPROCESSABLE_ENTITY; // 422
HttpStatus.TOO_MANY_REQUESTS; // 429

// 5xx Server Errors
HttpStatus.INTERNAL_SERVER_ERROR; // 500
HttpStatus.NOT_IMPLEMENTED; // 501
HttpStatus.BAD_GATEWAY; // 502
HttpStatus.SERVICE_UNAVAILABLE; // 503
HttpStatus.GATEWAY_TIMEOUT; // 504
```

---

## 🏷️ Enums

### SheetStatus

Character sheet status enumeration.

```typescript
import { SheetStatus } from "@realm/common";

SheetStatus.Draft; // "draft"
SheetStatus.Review; // "review"
SheetStatus.Active; // "active"
SheetStatus.Dead; // "dead"
SheetStatus.Archive; // "archive"
```

### Splats

All character types across V5, V20, and Chronicles of Darkness.

```typescript
import { Splats } from "@realm/common";

// V5 (5th Edition)
Splats.Vampire5th; // "vampire5th"
Splats.Hunter5th; // "hunter5th"
Splats.Werewolf5th; // "werewolf5th"
Splats.Human5th; // "human5th"
Splats.Ghoul5th; // "ghoul5th"

// V20 (20th Anniversary)
Splats.Vampire20th; // "vampire20th"
Splats.Werewolf20th; // "werewolf20th"
Splats.Changeling20th; // "changeling20th"
Splats.Mage20th; // "mage20th"
Splats.Demon20th; // "demon20th"
Splats.Wraith20th; // "wraith20th"
Splats.Human20th; // "human20th"
Splats.Ghoul20th; // "ghoul20th"
```

### SupporterName

Patreon supporter tier names.

```typescript
import { SupporterName } from "@realm/common";

SupporterName.Base; // "Base"
SupporterName.FirstDrink; // "First Drink"
SupporterName.TastingMenu; // "Tasting Menu"
SupporterName.NightlySpecial; // "Nightly Special"
SupporterName.OpenBar; // "Open Bar"
```

### Environment

Application environment enumeration.

```typescript
import { Environment } from "@realm/common";

Environment.Development; // "development"
Environment.Preproduction; // "preproduction"
Environment.Production; // "production"
```

### LogLevel

Logging level enumeration.

```typescript
import { LogLevel } from "@realm/common";

LogLevel.Debug; // "debug"
LogLevel.Info; // "info"
LogLevel.Warning; // "warning"
LogLevel.Error; // "error"
LogLevel.Fatal; // "fatal"
```

---

## ❌ Errors

### RealmError - Internal Application Errors

Use `RealmError` for internal application errors that indicate bugs or system failures in **our code**. These are automatically logged by default.

```typescript
import { RealmError } from "@realm/errors";

// Database connection failure
throw new RealmError("Database connection failed", {
  fields: { host: "localhost", port: "5432" },
  cause: originalError,
});

// Invalid state in domain logic
throw new RealmError("Character health cannot exceed maximum", {
  fields: {
    characterId: char.id.toString(),
    health: health.toString(),
    maxHealth: maxHealth.toString(),
  },
});

// Disable logging for specific errors
throw new RealmError("Cache miss", {
  log: false, // Won't be logged
  fields: { key: cacheKey },
});
```

### UserError - User-Facing Errors

Use `UserError` for errors caused by **user input** or mistakes. These are not logged by default (they're expected user mistakes, not bugs).

```typescript
import { UserError, HttpStatus } from "@realm/common";

// Validation error
throw new UserError("Character name cannot contain special characters", {
  statusCode: HttpStatus.BAD_REQUEST,
  fields: { name: userInput },
});

// Not found
throw new UserError("Character not found", {
  statusCode: HttpStatus.NOT_FOUND,
  fields: { characterId: id.toString() },
});

// Unauthorized
throw new UserError("You don't have permission to edit this character", {
  statusCode: HttpStatus.FORBIDDEN,
  fields: { userId: user.id.toString(), characterId: char.id.toString() },
});

// Override logging (for debugging)
throw new UserError("Suspicious validation failure", {
  log: true, // Force logging for investigation
  statusCode: HttpStatus.BAD_REQUEST,
  fields: { pattern: "multiple failed attempts" },
});
```

---

## 🏛️ Architecture: Shared Kernel Pattern

This package follows the **Shared Kernel** pattern from Domain-Driven Design:

```
┌─────────────────────────────────────────────┐
│  Tier 0: @realm/common (Shared Kernel)     │
│  - Interfaces, Types, Enums, Errors        │
│  - Only depends on zod                     │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Tier 1: @realm/core                       │
│  - Domain entities and business logic      │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Tier 2: Infrastructure Packages           │
│  - @realm/logger (implements ILogger)      │
│  - @realm/events (implements IEventClient) │
│  - @realm/repositories (implement repos)   │
│  - @realm/database                         │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│  Tier 3: Applications                      │
│  - apps/api (NestJS)                       │
│  - apps/bot (Discord.js)                   │
│  - apps/frontend (React)                   │
└────────────────────────────────────────────┘
```

**Key Benefits:**

1. **No circular dependencies** - Clean dependency flow
2. **Testable** - Easy to mock interfaces
3. **Flexible** - Swap implementations without changing contracts
4. **Type-safe** - Full TypeScript support throughout

---

## 🔍 Usage Examples

### Dependency Injection with Interfaces

```typescript
import type { ILogger, IUserRepository } from "@realm/common";

export class UserService {
  constructor(
    private readonly logger: ILogger,
    private readonly userRepo: IUserRepository
  ) {}

  async createUser(id: string, username: string) {
    this.logger.info("Creating user", { fields: { id, username } });

    const user = await this.userRepo.create({ id, username });

    this.logger.info("User created successfully");
    return user;
  }
}

// In app initialization:
import { logger } from "@realm/logger";
import { UserRepository } from "@realm/repositories";

const userService = new UserService(logger, new UserRepository());
```

### Error Handling Pattern

```typescript
import { RealmError, UserError, HttpStatus } from "@realm/common";
import type { ILogger } from "@realm/common";

export class CharacterService {
  constructor(private logger: ILogger) {}

  async updateCharacter(id: string, data: UpdateDto) {
    // Validate user input (boundary validation)
    if (!data.name || data.name.length > 50) {
      throw new UserError("Invalid character name", {
        statusCode: HttpStatus.BAD_REQUEST,
        fields: { name: data.name },
      });
    }

    try {
      // Internal logic - if this fails, it's our bug
      const character = await this.repo.findById(id);

      if (!character) {
        throw new UserError("Character not found", {
          statusCode: HttpStatus.NOT_FOUND,
          fields: { id },
        });
      }

      character.update(data);
      return await this.repo.save(character);
    } catch (error) {
      if (error instanceof UserError) {
        throw error; // Pass through user errors
      }

      // Wrap unknown errors as RealmError
      throw new RealmError("Failed to update character", {
        fields: { id, operation: "update" },
        cause: error,
      });
    }
  }
}
```

### Type-Safe Event Publishing

```typescript
import type { IEventClient, Snowflake } from "@realm/common";
import { z } from "zod";

const CharacterUpdatedSchema = z.object({
  type: z.literal("character:updated"),
  data: z.object({
    characterId: z.number(),
    userId: z.string(),
    guildId: z.string().optional(),
  }),
});

export class CharacterService {
  constructor(private eventClient: IEventClient) {}

  async updateCharacter(char: Character) {
    await this.repo.save(char);

    // Type-safe event publishing
    await this.eventClient.publish(
      "character:updated",
      CharacterUpdatedSchema,
      {
        type: "character:updated",
        data: {
          characterId: char.id,
          userId: char.userId,
          guildId: char.guildId,
        },
      }
    );
  }
}
```

---

## 📖 API Reference

### `RealmError`

Internal application error class with logging support.

**Constructor:**

```typescript
new RealmError(message: string, options?: {
  log?: boolean;        // Whether to log (default: true)
  fields?: Record<string, string>;  // Additional context
  cause?: unknown;      // Original error
})
```

**Properties:**

- `message: string` - Error message
- `name: string` - Always `"RealmError"`
- `log: boolean` - Whether this error should be logged
- `fields: Record<string, string>` - Additional context fields
- `timestamp: Date` - When the error was created
- `cause?: Error` - Original error that caused this one
- `stack?: string` - Stack trace

**Methods:**

- `toJSON(): Record<string, unknown>` - Serialize to JSON for logging/storage

### `UserError`

User-facing error class (extends `RealmError`).

**Constructor:**

```typescript
new UserError(message: string, options?: {
  log?: boolean;        // Whether to log (default: false)
  fields?: Record<string, string>;  // Additional context
  cause?: unknown;      // Original error
  statusCode?: number;  // HTTP status code (default: 400)
})
```

**Properties:**

All properties from `RealmError`, plus:

- `statusCode: number` - HTTP status code for API responses

**Methods:**

- `toJSON(): Record<string, unknown>` - Serialize to JSON (includes `statusCode`)

---

## 📦 Package Structure

```
@realm/common/
├── src/
│   ├── errors.ts                           # RealmError and UserError
│   ├── types/
│   │   └── index.ts                        # Snowflake, HttpStatus
│   ├── enums/
│   │   └── index.ts                        # SheetStatus, Splats, SupporterName
│   ├── interfaces/
│   │   ├── logger.interface.ts             # ILogger + Environment/LogLevel
│   │   ├── event-client.interface.ts       # IEventClient
│   │   ├── guild.repository.interface.ts   # IGuildRepository
│   │   ├── member.repository.interface.ts  # IMemberRepository
│   │   ├── supporter.repository.interface.ts # ISupporterRepository
│   │   └── user.repository.interface.ts    # IUserRepository
│   └── index.ts                            # Public API exports
├── dist/              # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

## 🔗 Dependencies

**Runtime:**

- `zod` - Schema validation for event contracts

**Development:**

- TypeScript for type definitions
- No other dependencies

## ✅ Stability Guarantee

This package is considered **stable**. The public API will not have breaking changes without a major version bump.

**Safe to use:**

- All exported interfaces (ILogger, IEventClient, repository interfaces)
- All types (Snowflake, HttpStatus)
- All enums (SheetStatus, Splats, SupporterName, Environment, LogLevel)
- Error classes (RealmError, UserError)

---

## 🤝 Contributing

When adding new shared definitions to this package:

1. **Interfaces only** - No implementations
2. **Zero internal dependencies** - Only depend on external libraries (like zod)
3. **Types over classes** - Prefer interfaces and type aliases
4. **Document everything** - Add JSDoc comments with usage examples
5. **Consider impact** - Changes here affect ALL packages

---

## 📚 Related Packages

- **[@realm/logger](../logger/README.md)** - Logger implementation (implements `ILogger`)
- **[@realm/events](../events/README.md)** - Event client implementation (implements `IEventClient`)
- **[@realm/repositories](../repositories/README.md)** - Repository implementations
- **[@realm/core](../core/README.md)** - Domain entities and business logic

---

## 📄 License

Proprietary - Realm of Darkness Project
