# Shared Package - Logger and Error System

This package provides a comprehensive logging and error handling system for the Realm of Darkness TypeScript platform.

## Features

- **Singleton logger pattern** for consistent usage across applications
- **Type-safe logging** with full TypeScript support
- **Discord integration** for real-time log monitoring
- **File backup logging** when Discord is unavailable
- **Environment-based configuration** (dev, preproduction, production)
- **Custom error types** with enhanced metadata
- **Client error handling** for user-facing errors that shouldn't be logged
- **Async logging** that doesn't block application flow
- **Structured logging** with fields and context

## Quick Start

### 1. Environment Setup

Create a `.env` file in your shared package with:

```env
# Discord logging configuration
LOGGER_TOKEN=your_discord_bot_token_here
LOGGER_CHANNEL_ID=your_discord_channel_id_here

# File logging configuration (optional)
LOG_FILE_PATH=./logs/app.log

# Environment
NODE_ENV=development

# Optional overrides
ENABLE_CONSOLE_LOGGING=true
ENABLE_DISCORD_LOGGING=false
```

### 2. Basic Usage

```typescript
import { RealmLogger, RealmError, ClientError } from 'shared';

// Get the singleton logger instance
const logger = RealmLogger.getInstance();

// Set your application name
logger.setAppName('my-app');

// Basic logging
await logger.info('Application started');
await logger.warning('Something might be wrong');
await logger.error('An error occurred');

// Logging with context
await logger.info('User logged in', {
  location: 'AuthController.login',
  fields: {
    userId: '12345',
    username: 'john_doe',
  },
});
```

### 3. Using RealmError

```typescript
import { RealmError } from 'shared';

try {
  // Some operation that might fail
  throw new Error('Database connection failed');
} catch (originalError) {
  // Create a structured error with metadata
  const realmError = RealmError.error('Failed to connect to database', {
    location: 'DatabaseService.connect',
    fields: {
      host: 'localhost',
      port: '5432',
      retryAttempt: '3',
    },
    cause: originalError,
  });

  // Log the error (includes all metadata)
  await logger.logError(realmError);
  
  // Or throw for upstream handling
  throw realmError;
}
```

### 4. Using ClientError (User-facing errors)

```typescript
import { ClientError } from 'shared';

// For user input validation - these won't be logged
const clientError = ClientError.badRequest('Email is required', {
  errorCode: 'VALIDATION_ERROR',
  fields: {
    field: 'email',
    constraint: 'required',
  },
});

// This won't be logged since it's a user error, not a system issue
await logger.logError(clientError);

// Use in API responses
throw clientError; // Will have statusCode: 400
```

## Environment Behavior

### Development (NODE_ENV=development)
- **Console Logging**: Enabled
- **Discord Logging**: Disabled
- **Min Log Level**: debug (all levels)

### Preproduction (NODE_ENV=preproduction)
- **Console Logging**: Disabled
- **Discord Logging**: Enabled
- **Min Log Level**: debug (all levels)

### Production (NODE_ENV=production)
- **Console Logging**: Disabled
- **Discord Logging**: Enabled
- **Min Log Level**: error (only error and fatal)

### Custom Configuration

You can override defaults:

```typescript
const logger = RealmLogger.getInstance();
logger.setAppName('my-app');

// Override environment defaults
logger.configure({
  enableConsoleLogging: true,  // Force console logging in production
  enableDiscordLogging: true,  // Enable Discord logging in development
  customMinLogLevel: 'warning', // Only log warnings and above
});
```

## API Reference

### RealmLogger (Singleton)

#### Static Methods
- `getInstance()` - Get the singleton logger instance

#### Instance Methods
- `setAppName(name)` - Set the application name
- `getAppName()` - Get the current application name
- `configure(config)` - Override environment-based configuration
- `debug(message, options?)` - Log debug information
- `info(message, options?)` - Log informational messages
- `warning(message, options?)` - Log warning messages
- `error(message, options?)` - Log error messages
- `fatal(message, options?)` - Log fatal error messages
- `logError(error, additionalOptions?)` - Log RealmError/ClientError/Error with metadata
- `getEnvironment()` - Get current environment
- `isConsoleLoggingEnabled()` - Check if console logging is enabled
- `isDiscordLoggingEnabled()` - Check if Discord logging is enabled

### RealmError

Enhanced error class with metadata for better logging.

#### Constructor
```typescript
new RealmError(message, {
  level?: 'info' | 'debug' | 'warning' | 'error' | 'fatal',
  location?: string,
  fields?: Record<string, string>,
  cause?: Error,
})
```

#### Static Factory Methods
- `RealmError.info(message, options?)` - Create info-level error
- `RealmError.debug(message, options?)` - Create debug-level error
- `RealmError.warning(message, options?)` - Create warning-level error
- `RealmError.error(message, options?)` - Create error-level error
- `RealmError.fatal(message, options?)` - Create fatal-level error

### ClientError

User-facing error class that won't be logged (since they're not system issues).

#### Constructor
```typescript
new ClientError(message, {
  statusCode?: number,
  errorCode?: string,
  fields?: Record<string, string>,
})
```

#### Static Factory Methods
- `ClientError.badRequest(message, options?)` - 400 Bad Request
- `ClientError.unauthorized(message, options?)` - 401 Unauthorized
- `ClientError.forbidden(message, options?)` - 403 Forbidden
- `ClientError.notFound(message, options?)` - 404 Not Found
- `ClientError.conflict(message, options?)` - 409 Conflict
- `ClientError.unprocessableEntity(message, options?)` - 422 Unprocessable Entity

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `LOGGER_TOKEN` | Discord bot token for logging | For Discord logging | - |
| `LOGGER_CHANNEL_ID` | Discord channel ID for logs | For Discord logging | - |
| `LOG_FILE_PATH` | Path to backup log file | No | `./logs/{appName}.log` |
| `NODE_ENV` | Environment (development/preproduction/production) | No | development |
| `ENABLE_CONSOLE_LOGGING` | Override console logging setting | No | Environment default |
| `ENABLE_DISCORD_LOGGING` | Override Discord logging setting | No | Environment default |

### Log Levels

- **debug** - Detailed information for diagnosing problems
- **info** - General information about application flow
- **warning** - Something unexpected happened, but the application can continue
- **error** - A serious problem occurred
- **fatal** - A critical error that might cause the application to terminate

## Discord Integration

The logger sends formatted embeds to Discord with:

- **Author**: Application name with optional icon
- **Title**: Log level with emoji indicator
- **Color**: Level-appropriate colors (gray for debug, blue for info, amber for warning, red for error, dark red for fatal)
- **Message Field**: The main log message
- **Location Field**: Where the log originated (if provided)
- **Description**: Stack trace (if available)
- **Additional Fields**: Custom fields from the log entry

## File Logging

When Discord logging fails or isn't configured, logs are written to a backup file with:

- Timestamp
- Log level
- Application name
- Message
- Location (if provided)
- Additional fields (if provided)
- Stack trace (if available)

Files are automatically rotated when they exceed 10MB.

## Examples

See `src/logger/examples.ts` for comprehensive usage examples including:

- Basic singleton setup
- Custom configuration
- Error handling with RealmError and ClientError
- Environment-specific behavior
- Complete application setup

## Best Practices

1. **Use the singleton pattern** - Always call `RealmLogger.getInstance()`
2. **Set your app name** - Call `setAppName()` at application startup
3. **Use RealmError for system errors** - These will be logged with context
4. **Use ClientError for user errors** - These won't be logged (user mistakes aren't system issues)
5. **Include location information** to help with debugging
6. **Add relevant fields** to provide context
7. **Use appropriate log levels** - don't spam with debug messages in production
8. **Configure for testing** - Use environment variables to test Discord logging in development

## Error Handling

The logger handles failures gracefully:

1. **Discord failure**: Falls back to file logging
2. **File failure**: Throws error (last resort)
3. **No configuration**: Uses file logging as backup
4. **Invalid log levels**: Filters out logs below minimum level
5. **ClientErrors**: Silently ignored (not logged)

This ensures your application won't crash due to logging issues while still providing visibility into actual system problems.
