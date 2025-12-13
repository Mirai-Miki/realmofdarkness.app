# @realm/common

Shared kernel package containing contracts, types, and enums used across the Realm of Darkness monorepo.

## 🎯 Purpose

This package serves as the foundation layer in our clean architecture. It defines the shared language of the application through:

- **Contracts** (interfaces) that infrastructure packages implement
- **Types** that ensure type safety across all packages
- **Enums** that standardize common values
- **Errors** that provide consistent error handling

All other packages depend on this one, but it has zero internal dependencies.

## 📚 Contents

- **Character Module**: Validation schemas and types for all character types
- **User Module**: User and supporter definitions
- **Guild Module**: Discord server definitions
- **Member Module**: Guild membership definitions
- **Logger**: Logging interface contracts
- **Event System**: Real-time event contracts
- **Repository Interfaces**: Data access contracts
- **Primitives**: Core types (Snowflake, HttpStatus, etc.)
- **Errors**: Two-tier error system (RealmError, UserError)

## 📦 Package Structure

```
@realm/common/
├── src/
│   ├── character/           # Character validation & types
│   │   ├── 5th-edition/     # V5 character definitions
│   │   ├── 20th-edition/    # V20 character definitions
│   │   ├── cod/             # Chronicles of Darkness
│   │   └── character.definitions.ts
│   ├── user/                # User & supporter types
│   ├── guild/               # Guild definitions
│   ├── member/              # Member definitions
│   ├── logger/              # Logger interfaces
│   ├── primitives/          # Core types & enums
│   ├── error.definitions.ts # Error classes
│   ├── event-system.definitions.ts # Event contracts
│   ├── repository.definitions.ts   # Repository interfaces
│   └── index.ts             # Public exports
├── package.json
└── README.md
```

## 🔗 Dependencies

- `zod` - Schema validation
