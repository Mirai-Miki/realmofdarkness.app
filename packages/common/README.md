# @realm/common

Shared kernel package containing contracts, types, and enums used across the Realm of Darkness monorepo.

## 🎯 Purpose

This package serves as the **shared kernel** in our clean architecture. It defines the contracts that all other packages depend on:

- **DTOs** (Data Transfer Objects) with Zod validation schemas
- **Repository Interfaces** that infrastructure packages implement
- **Types** for type safety across packages
- **Enums** that standardize common values
- **Errors** for consistent error handling

**Key Rule:** All other packages depend on this one, but `common` has ZERO dependencies on other internal packages (only `zod`).

## 📚 Contents

### Core Modules

- **User Module**: User DTOs, input schemas, repository interface
- **Guild Module**: Guild DTOs, input schemas, repository interface
- **Member Module**: Member DTOs, input schemas, repository interface
- **Supporter Module**: Supporter DTOs, repository interface
- **Character Module**: Character validation schemas and types (WIP)

### Cross-Cutting

- **Primitives**: Core types (Snowflake, HttpStatus, Environment)
- **Errors**: Two-tier error system (RealmError, UserError)
- **Logger**: Logging interface contract
- **Event System**: Real-time event contracts (planned)
- **Repository Base**: Base repository interface pattern

## 📦 Package Structure

```
@realm/common/
├── src/
│   ├── primitives/          # Core types
│   │   ├── index.ts         # Snowflake, Environment, etc.
│   │   └── http-status.enum.ts
│   ├── error.definitions.ts # RealmError, UserError
│   ├── logger/              # ILogger interface
│   ├── user.definitions.ts  # User DTOs & repository
│   ├── guild.definitions.ts # Guild DTOs & repository
│   ├── member.definitions.ts # Member DTOs & repository
│   ├── supporter.definitions.ts # Supporter DTOs & repository
│   ├── character/           # Character types (WIP)
│   ├── event-system.definitions.ts # Event contracts (planned)
│   ├── repository.definitions.ts   # Base repository interface
│   └── index.ts             # Public exports
├── package.json
└── README.md
```

## 🔗 Dependencies

� Key Concepts

### DTOs (Data Transfer Objects)

DTOs are defined using Zod schemas and inferred types:

```typescript
// Field schemas (reusable validation)
export const UsernameField = z.string().min(1).max(35);
export const DisplayNameField = z.string().min(1).max(35);

// DTO schema (full object with all fields including timestamps)
export const UserDtoSchema = z.object({
  id: SnowflakeSchema,
  username: UsernameField,
  displayName: DisplayNameField,
  avatarUrl: z.string().url().optional(),
  createdAt: z.date(),
  lastUpdated: z.date(),
});

// Inferred type
export type UserDto = z.infer<typeof UserDtoSchema>;
```

### Input Schemas

Input schemas define what services accept (no timestamps):

```typescript
// Create input (no ID, no timestamps)
export const CreateUserInputSchema = z.object({
  id: SnowflakeSchema,
  username: UsernameField,
  displayName: DisplayNameField,
  avatarUrl: z.string().url().optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

// Update input (only updateable fields)
export const UpdateUserInputSchema = z.object({
  id: SnowflakeSchema,
  displayName: DisplayNameField.optional(),
  avatarUrl: z.string().url().optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;
```

### Repository Interfaces

Repositories define the contract for data access:

```typescript
export interface IUserRepository {
  findById(id: Snowflake): Promise<UserDto | null>;
  findByUsername(username: string): Promise<UserDto | null>;
  create(user: UserDto): Promise<UserDto>;
  update(user: UserDto): Promise<UserDto>;
  delete(id: Snowflake): Promise<void>;
  count(): Promise<number>;
}
```

### Error Handling

Two-tier error system:

```typescript
// System errors (logged and monitored)
throw new RealmError("Database connection failed", {
  cause: error,
  fields: { userId: id },
});

// User errors (not logged, returned to client)
throw new UserError("Invalid username format", {
  fields: { username },
});
```
