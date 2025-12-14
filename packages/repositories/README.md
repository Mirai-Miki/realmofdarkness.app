# @realm/repositories

Repository implementations for the Realm of Darkness application. Provides the data access layer that bridges between DTOs and database persistence.

## ⚠️ Status

**In Progress** - Core CRUD operations complete, mappers need alignment with updated DTO fields.

## 🎯 Purpose

The repository layer is responsible for:

- Loading DTOs from the database via Drizzle ORM
- Saving DTOs to the database
- Translating between database records and DTOs via mappers
- Hiding database implementation details from application/domain layers

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  APPLICATION LAYER (Services)                       │
│  - Uses repository interfaces from @realm/common    │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  REPOSITORY LAYER (this package)                    │
│  - UserRepository, GuildRepository, etc.            │
│  - Mappers (DB ↔ DTO)                              │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────┐      ┌──────────────┐
│ COMMON       │      │ DATABASE     │
│ (DTOs)       │      │ (Drizzle)    │
└──────────────┘      └──────────────┘
```

## Usage

### Basic CRUD Operations

````typescript
import { CharacterRepository } from "@realm/repositories";
import { db } from "@realm/database";

const repo = new CharacterRepository(db);

// Find bUserRepository } from '@realm/repositories';
import { db } from '@realm/database';

const userRepo = new UserRepository(db);

// Find by ID
const user = await userRepo.findById('123456789012345678');

// Find by username
const user = await userRepo.findByUsername('Dracula');

// Create
const newUser: UserDto = {
  id: '123456789012345678',
  username: 'newuser',
  displayName: 'New User',
  createdAt: new Date(),
  lastUpdated: new Date(),
};
const savedUser = await userRepo.create(newUser);

// Update
const updatedUser = { ...user, displayName: 'Updated Name' };
await userRepo.update(updatedUser);

// Delete
await userRepo.delete('123456789012345678'sy to mock for unit tests
✅ **Flexibility**: Can swap database without c
✅ **Flexibility**: Can swap database without changing services
✅ **Separation**: Services don't know about SQL/Drizzle
✅ **Clarity**: Clear contract for data access

## 📦 Available Repositories

- **UserRepository**: User CRUD operations
- **GuildRepository**: Guild CRUD operations
- **MemberRepository**: Guild membership operations (with composite key)
- **SupporterRepository**: Supporter subscription operations
- **CharacterRepository**: Character CRUD operations (WIP)

## 🔧 Implementation Pattern

Each repository follows this structure:

```typescript
import type { IUserRepository, UserDto, Snowflake } from '@realm/common';
import { RealmError } from '@realm/common';
import { db, users } from '@realm/database';
import { UserMapper } from './mappers/user.mapper';

export class UserRepository implements IUserRepository {
  async findById(id: Snowflake): Promise<UserDto | null> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (result.length === 0) return null;

      return UserMapper.toDto(result[0]);
    } catch (error) {
      throw new RealmError('Failed to find user by ID', {
        cause: error,
        fields: { id },
      });
    }
  }

  // ... other methods
}
```pository<T, ID> {
  findById(id: ID): Promise<T | null>;
  create(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
  delete(id: ID): Promise<void>;
}
````

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
