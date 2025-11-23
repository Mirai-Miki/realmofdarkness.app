# @realm/logger

Logging infrastructure package for the Realm of Darkness application suite.

## Features

- **Discord Integration**: Send logs to Discord channels for production monitoring
- **File Backup**: Automatic fallback to file logging if Discord is unavailable
- **Source Map Support**: Enhanced stack traces for TypeScript code (auto-initialized)
- **Global Error Handling**: Catches unhandled rejections and uncaught exceptions
- **Custom Error Types**: RealmError and ClientError with metadata support
- **Environment-Based Configuration**: Different behavior for dev/preprod/prod
- **Singleton Pattern**: Single logger instance per application

## Installation

This package is part of the Realm of Darkness monorepo and is not published to npm.

```bash
pnpm install
```

## Usage

### Basic Logging

```typescript
import { logger } from "@realm/logger";

// Set application name (do this once at startup)
logger.setAppName("api");

// Log messages
logger.debug("Debugging information");
logger.info("Informational message");
logger.warn("Warning message");
logger.error("Error occurred", { error: someError });
logger.fatal("Critical failure", { fields: { userId: "12345" } });
```

### Using Errors

```typescript
import { RealmError, ClientError } from "@realm/logger/errors";
import { logger } from "@realm/logger";

// System error (will be logged)
throw new RealmError("Database connection failed", {
  fields: { database: "postgresql" },
  cause: originalError,
});

// User error (won't be logged by default)
throw new ClientError("Invalid input", {
  statusCode: 400,
  fields: { field: "email" },
});

// Log an exception with context
try {
  await riskyOperation();
} catch (error) {
  logger.exception("Operation failed", error, {
    fields: { operationId: "123" },
  });
}
```

### Environment Configuration

The logger automatically configures itself based on `NODE_ENV`:

- **development**: Console logging enabled, Discord disabled
- **preproduction**: Console disabled, Discord enabled (all levels)
- **production**: Console disabled, Discord enabled (error+ only)

Override with environment variables:

```env
NODE_ENV=production
ENABLE_CONSOLE_LOGGING=true
ENABLE_DISCORD_LOGGING=true
LOGGER_TOKEN=your_discord_bot_token
LOGGER_CHANNEL_ID=your_channel_id
LOG_FILE_PATH=/path/to/logs/app.log
```

### Custom Configuration

```typescript
import { logger, Environment } from "@realm/logger";

logger.configure({
  environment: Environment.Production,
  enableConsoleLogging: false,
  enableDiscordLogging: true,
  discordToken: process.env.DISCORD_TOKEN,
  discordChannelId: process.env.DISCORD_CHANNEL,
  customMinLogLevel: "warning",
});
```

## Source Map Support

**Source map support is automatically initialized when you import this package.**

You no longer need to:

- Import `source-map-support/register` in your app
- Call `installSourceMapSupport()` manually
- Add source map initialization to each app's entry point

Simply import the logger and you're done:

```typescript
// Before (old way)
import "source-map-support/register";
import { logger } from "...";

// After (new way)
import { logger } from "@realm/logger";
// Source maps already initialized! ✅
```

## Global Error Handlers

The logger automatically sets up handlers for:

- **Unhandled Promise Rejections**: Logged as FATAL
- **Uncaught Exceptions**: Logged as FATAL

These are initialized when the logger is first imported.

## Error Types

### RealmError

For application/system errors that should be logged:

```typescript
import { RealmError } from "@realm/logger/errors";

throw new RealmError("Something went wrong", {
  log: true, // default
  fields: {
    context: "additional info",
  },
  cause: originalError,
});
```

### ClientError

For user/client errors that shouldn't clutter logs:

```typescript
import { ClientError } from "@realm/logger/errors";

throw new ClientError("Invalid username", {
  log: false, // default
  statusCode: 400,
  fields: {
    username: providedUsername,
  },
});
```

## Architecture

```
@realm/logger/
├── src/
│   ├── index.ts              # Main exports
│   ├── logger.ts             # Logger implementation (includes source maps)
│   ├── logger.types.ts       # Type definitions
│   ├── discord-logger.ts     # Discord integration
│   ├── file-logger.ts        # File logging
│   ├── types.ts              # Environment & HttpStatus enums
│   └── errors/
│       ├── index.ts
│       ├── realm-error.ts    # System error class
│       └── client-error.ts   # Client error class
```

## Dependencies

- `discord.js` - Discord API integration
- `dotenv` - Environment variable loading
- `source-map-support` - Enhanced stack traces

## Migration from Core

If you're migrating from `@realm/core`:

**Before:**

```typescript
import { logger } from "@realm/core/logger";
import { RealmError, ClientError } from "@realm/core/errors";
import "source-map-support/register";
```

**After:**

```typescript
import { logger } from "@realm/logger";
import { RealmError, ClientError } from "@realm/logger/errors";
// No source map import needed!
```

## License

MIT
