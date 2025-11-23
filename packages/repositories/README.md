# @realm/repositories

Repository implementations for the Realm of Darkness application. Provides the data access layer that bridges between domain models and database persistence.

## Installation

This is a workspace package. Add it to your package dependencies:

```json
{
  "dependencies": {
    "@realm/repositories": "workspace:*"
  }
}
```

## Overview

The repository layer is responsible for:

- Loading domain entities from the database
- Saving domain entities to the database
- Translating between database records and domain models
- Hiding database implementation details from the domain layer

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (API, Bot)                      │
│  - Controllers, Command Handlers                    │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  APPLICATION LAYER                                  │
│  - Services, Use Cases                              │
└──────────────────┬──────────────────────────────────┘
                   │ uses
┌──────────────────▼──────────────────────────────────┐
│  REPOSITORY LAYER (this package)                    │
│  - CharacterRepository, UserRepository, etc.        │
│  - Mappers (DB ↔ Domain)                           │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────┐      ┌──────────────┐
│ DOMAIN LAYER │      │ DATABASE     │
│ (Entities)   │      │ (Drizzle)    │
└──────────────┘      └──────────────┘
```

## Usage

### Basic CRUD Operations

```typescript
import { CharacterRepository } from "@realm/repositories";
import { db } from "@realm/database";

const repo = new CharacterRepository(db);

// Find by ID
const character = await repo.findById(123);

// Find by user and name
const vampire = await repo.findByUser(456789n, "Dracula");

// Find all for user
const characters = await repo.findAllByUser(456789n);

// Create
const newChar = new Vampire5th({
  name: "New Vampire",
  userId: 123456n,
  // ... other properties
});
const saved = await repo.create(newChar);

// Update
vampire.increaseHunger(1);
await repo.update(vampire);

// Delete
await repo.delete(123);
```

### Repository Pattern Benefits

✅ **Testability**: Easy to mock for unit tests
✅ **Flexibility**: Can swap database without changing domain
✅ **Separation**: Domain doesn't know about SQL/Drizzle
✅ **Clarity**: Clear contract for data access

## Repository Interface

All repositories implement standard CRUD operations:

```typescript
interface IRepository<T, ID> {
  findById(id: ID): Promise<T | null>;
  create(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
  delete(id: ID): Promise<void>;
}
```

## Mappers

Mappers handle translation between database records and domain models:

```typescript
// Example: CharacterMapper
class CharacterMapper {
  // Database → Domain
  static toDomain(db: CharacterDb): Character {
    switch (db.splat) {
      case Splats.Vampire5th:
        return new Vampire5th(baseData, db.data as Vampire5thData);
      // ... other splats
    }
  }

  // Domain → Database
  static fromDomain(char: Character): CharacterDb {
    return {
      name: char.name,
      userId: char.userId,
      splat: char.splat,
      data: char.serialize(), // JSONB data
    };
  }
}
```

## Dependencies

- `@realm/core` - Domain models and interfaces
- `@realm/database` - Drizzle ORM and schema
- `@realm/errors` - Error handling
- `@realm/logger` - Logging

## Development Status

🚧 **Under Construction** - Phase 2 of the refactor plan

This package structure is in place but implementations are not yet complete.

## License

MIT
