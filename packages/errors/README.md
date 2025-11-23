# @realm/errors

Custom error types for the Realm of Darkness application. Provides a two-tier error handling system with additional context for logging and debugging.

## Installation

This is a workspace package. Add it to your package dependencies:

```json
{
  "dependencies": {
    "@realm/errors": "workspace:*"
  }
}
```

## Usage

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

### ClientError - User-Facing Errors

Use `ClientError` for errors caused by **user input** or client-side issues. These are not logged by default (they're expected user mistakes, not bugs).

```typescript
import { ClientError, HttpStatus } from "@realm/errors";

// Validation error
throw new ClientError("Character name cannot contain special characters", {
  statusCode: HttpStatus.BAD_REQUEST,
  fields: { name: userInput },
});

// Not found
throw new ClientError("Character not found", {
  statusCode: HttpStatus.NOT_FOUND,
  fields: { characterId: id.toString() },
});

// Unauthorized
throw new ClientError("You don't have permission to edit this character", {
  statusCode: HttpStatus.FORBIDDEN,
  fields: { userId: user.id.toString(), characterId: char.id.toString() },
});

// Override logging (for debugging)
throw new ClientError("Suspicious validation failure", {
  log: true, // Force logging for investigation
  statusCode: HttpStatus.BAD_REQUEST,
  fields: { pattern: "multiple failed attempts" },
});
```

### HttpStatus - Type-Safe Status Codes

Avoid magic numbers with the `HttpStatus` enum:

```typescript
import { HttpStatus } from "@realm/errors";

// In API controllers
res.status(HttpStatus.OK).json(data);
res.status(HttpStatus.CREATED).json(newCharacter);
res.status(HttpStatus.NOT_FOUND).json({ error: "Not found" });

// In ClientError
throw new ClientError("Invalid request", {
  statusCode: HttpStatus.UNPROCESSABLE_ENTITY, // 422
});
```

## API Reference

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

### `ClientError`

User-facing error class (extends `RealmError`).

**Constructor:**

```typescript
new ClientError(message: string, options?: {
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

### `HttpStatus`

Enum of HTTP status codes.

**Common Values:**

```typescript
HttpStatus.OK = 200;
HttpStatus.CREATED = 201;
HttpStatus.NO_CONTENT = 204;

HttpStatus.BAD_REQUEST = 400;
HttpStatus.UNAUTHORIZED = 401;
HttpStatus.FORBIDDEN = 403;
HttpStatus.NOT_FOUND = 404;
HttpStatus.CONFLICT = 409;
HttpStatus.UNPROCESSABLE_ENTITY = 422;

HttpStatus.INTERNAL_SERVER_ERROR = 500;
HttpStatus.SERVICE_UNAVAILABLE = 503;
```

See [types.ts](./src/types.ts) for the complete list.

## Error Philosophy

### When to use RealmError

✅ **Use RealmError for:**

- Database connection failures
- Invalid state in domain logic (validation in Value Objects)
- File system errors
- External service failures
- Unexpected null/undefined values
- Logic bugs in our code

❌ **Don't use RealmError for:**

- User input validation (use ClientError)
- "Not found" scenarios (use ClientError)
- Authentication/authorization failures (use ClientError)
- Expected business rule violations from user actions (use ClientError)

### When to use ClientError

✅ **Use ClientError for:**

- Form validation errors
- Invalid user input
- Resource not found
- Permission denied
- Rate limiting
- Duplicate entries from user actions

❌ **Don't use ClientError for:**

- Bugs in our code (use RealmError)
- System failures (use RealmError)
- Database errors (use RealmError)
- Internal validation failures (use RealmError)

### Rule of Thumb

**Ask yourself:** "Is this error caused by **our code** or by **the user**?"

- **Our code** → `RealmError` (logged, indicates a bug we need to fix)
- **The user** → `ClientError` (not logged, expected user mistake)

## Examples

### Domain Layer (Value Objects)

```typescript
// Value Objects validate their own state
// Invalid state = our bug (we created invalid data)
class DamageTracker5th {
  constructor(total: number, superficial: number, aggravated: number) {
    if (total < 0) {
      throw new RealmError("Total health cannot be negative", {
        fields: { total: total.toString() },
      });
    }

    if (superficial + aggravated > total) {
      throw new RealmError("Damage cannot exceed total health", {
        fields: {
          total: total.toString(),
          superficial: superficial.toString(),
          aggravated: aggravated.toString(),
        },
      });
    }

    // ... rest of constructor
  }
}
```

### Application Layer (Services)

```typescript
// Services orchestrate domain logic and handle external inputs
class CharacterService {
  async createCharacter(userId: bigint, data: CreateCharacterDto) {
    // Validate user input (external boundary)
    if (!data.name || data.name.length > 50) {
      throw new ClientError("Character name must be 1-50 characters", {
        statusCode: HttpStatus.BAD_REQUEST,
        fields: { name: data.name },
      });
    }

    // Check if character already exists
    const existing = await this.repo.findByName(userId, data.name);
    if (existing) {
      throw new ClientError("Character with this name already exists", {
        statusCode: HttpStatus.CONFLICT,
        fields: { name: data.name },
      });
    }

    try {
      // Create character (internal logic)
      const character = new Character(data);
      return await this.repo.save(character);
    } catch (error) {
      // Database error = our problem
      throw new RealmError("Failed to save character", {
        fields: { userId: userId.toString(), name: data.name },
        cause: error,
      });
    }
  }
}
```

### API Layer (Controllers)

```typescript
// Controllers handle HTTP-specific concerns
@Controller("characters")
export class CharacterController {
  @Post()
  async create(@Body() dto: CreateCharacterDto, @CurrentUser() user: User) {
    try {
      const character = await this.service.createCharacter(user.id, dto);
      return character;
    } catch (error) {
      if (error instanceof ClientError) {
        // User error - return appropriate status code
        throw new HttpException(error.message, error.statusCode);
      }
      // RealmError or unknown error - log and return 500
      this.logger.error("Character creation failed", error);
      throw new InternalServerErrorException("Failed to create character");
    }
  }
}
```

## Integration with Logger

The `@realm/logger` package automatically handles `RealmError` and `ClientError`:

```typescript
import { logger } from "@realm/logger";

try {
  // ... some operation
} catch (error) {
  // Logger checks error.log property
  await logger.error("Operation failed", error);
  // RealmError: logged with full context
  // ClientError: not logged (unless log: true)
}
```

## TypeScript Integration

All types are fully exported for TypeScript consumers:

```typescript
import type { RealmError, ClientError } from "@realm/errors";

// Type guards
function isRealmError(error: unknown): error is RealmError {
  return error instanceof RealmError;
}

function isClientError(error: unknown): error is ClientError {
  return error instanceof ClientError;
}

// Use in catch blocks
try {
  await riskyOperation();
} catch (error) {
  if (isClientError(error)) {
    // Handle user error
    return { error: error.message, statusCode: error.statusCode };
  }
  if (isRealmError(error)) {
    // Log and return generic error
    await logger.error("System error", error);
    return { error: "Internal server error" };
  }
  // Unknown error
  await logger.error(
    "Unknown error",
    new RealmError("Unexpected error", { cause: error })
  );
}
```

## Package Structure

```
@realm/errors/
├── src/
│   ├── errors.ts      # RealmError and ClientError classes
│   ├── types.ts       # HttpStatus enum
│   └── index.ts       # Public API exports
├── dist/              # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

## Dependencies

This package has **zero runtime dependencies** - it only extends the native JavaScript `Error` class.

## Stability Guarantee

This package is considered **stable**. The public API (`RealmError`, `ClientError`, `HttpStatus`) will not have breaking changes without a major version bump.

Safe to use:

- Error constructors and their options
- Public properties (`message`, `name`, `log`, `fields`, `statusCode`, etc.)
- `toJSON()` method
- `HttpStatus` enum values
