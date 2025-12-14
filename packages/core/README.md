# @realm/core

Domain entities and application services for the Realm of Darkness application.

## 🎯 Purpose

This package contains the core business logic of the application, organized following Domain-Driven Design principles:

- **Entities**: Rich domain models with business logic (User, Guild, Member, Supporter, Characters)
- **Services**: Pure application services for orchestrating domain operations
- **Value Objects**: Immutable objects representing domain concepts (DamageTracker, Skills, etc.)

## 📦 Package Structure

```
@realm/core/
├── src/
│   ├── entities/              # Domain entities
│   │   ├── user.entity.ts
│   │   ├── guild.entity.ts
│   │   ├── member.entity.ts
│   │   ├── supporter.entity.ts
│   │   └── characters/        # Character domain models (WIP)
│   ├── services/              # Application services
│   │   ├── user.service.ts
│   │   ├── guild.service.ts
│   │   └── member.service.ts
│   ├── value-objects/         # Immutable value objects
│   │   ├── damage-tracker-5th.vo.ts
│   │   ├── damage-tracker-20th.vo.ts
│   │   └── willpower-tracker.vo.ts
│   └── index.ts
├── package.json
└── README.md
```

## 🔗 Dependencies

- `@realm/common` - Contracts, types, and DTOs

## 📚 Key Concepts

### Entities

Entities wrap DTOs from `@realm/common` with business logic:

```typescript
import { User } from "@realm/core";
import type { UserDto } from "@realm/common";

// Entity wraps DTO
const user = new User(userDto);

// Business logic methods
user.updateProfile("NewName", "avatar.png");
user.hasRoleInGuild(guildId, roleId);

// Export back to DTO for persistence
const updatedDto = user.toDto();
```

### Services

Pure services orchestrate domain operations without cross-service dependencies:

```typescript
import { UserService } from "@realm/core";

class UserService {
  constructor(
    private userRepo: IUserRepository,
    private logger: ILogger
  ) {}

  async create(input: CreateUserInput): Promise<UserDto> {
    // Validate input
    const validated = CreateUserInputSchema.parse(input);

    // Create entity
    const user = new User({
      id: validated.id,
      username: validated.username,
      // ... timestamps added by repository
    });

    // Persist
    return await this.userRepo.create(user.toDto());
  }
}
```

### Value Objects

Immutable objects that encapsulate domain concepts:

```typescript
import { DamageTracker5th } from "@realm/core";

// Create immutable tracker
const health = new DamageTracker5th(7, 0, 0);

// Methods return new instances
const damaged = health.takeSuperficial(3);
const healed = damaged.healSuperficial(1);

// Serialize for storage
const json = health.toJSON();
const restored = DamageTracker5th.fromJSON(json);
```

## 🏛️ Architecture Principles

1. **Pure Domain Logic**: No database, HTTP, or framework dependencies
2. **DTO Wrapping**: Entities wrap DTOs, never expose internal state
3. **Immutability**: Value Objects are immutable (return new instances)
4. **Service Purity**: Services don't call other services, only repositories
5. **Testability**: All logic is testable without external dependencies

## 📖 Usage Examples

### Creating a Guild

```typescript
import { GuildService } from "@realm/core";
import type { CreateGuildInput } from "@realm/common";

const input: CreateGuildInput = {
  id: "123456789012345678",
  name: "My Chronicle",
  iconUrl: "https://cdn.discord.com/icons/...",
  storytellerRoleIds: ["987654321098765432"],
};

const guildDto = await guildService.create(input);
```

### Managing Members

```typescript
import { MemberService } from "@realm/core";

// Grant storyteller permission
await memberService.grantStoryteller(guildId, userId);

// Add server boost
await memberService.addBoost(guildId, userId);

// Sync profile from Discord
await memberService.syncProfile({
  guildId,
  userId,
  nickname: "NewNick",
  avatarUrl: "https://cdn.discord.com/avatars/...",
  roleIds: ["role1", "role2"],
});
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## 📝 Contributing

When adding new entities or services:

1. Create the entity class wrapping a DTO from `@realm/common`
2. Add business logic methods to the entity
3. Create a pure service class for orchestration
4. Inject only repositories and logger (never other services)
5. Add comprehensive tests
6. Export from `index.ts`

See [NAMING_CONVENTIONS.md](../../NAMING_CONVENTIONS.md) for file naming standards.
