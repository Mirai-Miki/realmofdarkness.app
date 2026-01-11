# @realm/assets

Type-safe emoji asset management for Realm of Darkness.

## Features

- **Recursive folder scanning** - Automatically discovers nested emoji files
- **Type-safe access** - `Emojis.Dice.V5.Default.Primary.Crit` with full autocomplete
- **Runtime validation** - Build fails if themed sets are incomplete
- **File path abstraction** - Apps don't need to know folder structure

## Installation

```bash
pnpm add @realm/assets
```

## Usage

### Accessing Emojis

```typescript
import { Emojis, type EmojiName } from '@realm/assets';

// Type-safe nested access
const critDie = Emojis.Dice.V5.Default.Primary.Crit;
// Returns: "dice_v5_default_primary_crit"

// Progress bars
const greenBar = Emojis.ProgressBar.Green.Filled.Left;
// Returns: "progress_bar_green_filled_left"
```

### Getting File Paths

```typescript
import { getAllEmojiFiles, getEmojiFilePath } from '@realm/assets';

// Get all emoji files with paths
const emojis = getAllEmojiFiles();
// [{ name: "dice_v5_default_primary_crit", absolutePath: "/path/to/file.webp", ... }]

// Get specific emoji path
const path = getEmojiFilePath("dice_v5_default_primary_crit");
```

### Themed Dice Sets

```typescript
import { Emojis, type V5DiceSet } from '@realm/assets';

function loadV5Dice(theme: 'default' | 'wod'): V5DiceSet {
  const diceSet = theme === 'default' 
    ? Emojis.Dice.V5.Default 
    : Emojis.Dice.V5.Wod;

  return {
    primary: {
      crit: diceSet.Primary.Crit,
      pass: diceSet.Primary.Pass,
      fail: diceSet.Primary.Fail,
    },
    secondary: {
      bestial: diceSet.Secondary.Bestial, // V5-specific
      crit: diceSet.Secondary.Crit,
      pass: diceSet.Secondary.Pass,
      fail: diceSet.Secondary.Fail,
    },
  };
}
```

## Structure

Emojis are organized by category and theme:

```
emojis/
├── dice/
│   ├── v5/          # Vampire 5th Edition
│   │   ├── default/
│   │   └── wod/
│   ├── w5/          # Werewolf 5th Edition
│   ├── h5/          # Hunter 5th Edition
│   └── wod20/       # World of Darkness 20th
├── progress-bar/
│   ├── green/
│   ├── red/
│   └── yellow/
├── tracker/
├── supporter/
├── logo/
└── misc/
```

## Type Safety

```typescript
// ✅ Compile-time safety
const valid: EmojiName = "dice_v5_default_primary_crit";

// ❌ TypeScript error
const invalid: EmojiName = "nonexistent_emoji";

// ✅ Autocomplete works
Emojis.Dice.V5.Default. // <- shows Primary, Secondary
```

## Build Process

Types are auto-generated from folder structure during build:

```bash
pnpm build
# 1. Scans emojis/ recursively
# 2. Generates types and validation
# 3. Compiles package
```

## Exports

- `Emojis` - Nested object matching folder structure
- `EmojiName` - Union type of all emoji names
- `EmojiNameSchema` - Zod schema for validation
- `getAllEmojiFiles()` - Get all emoji metadata
- `getEmojiFilePath(name)` - Resolve emoji path
- `emojiExists(name)` - Check if emoji exists
- `V5DiceSet`, `W5DiceSet`, `H5DiceSet` - Dice set types
- `ProgressBarSet` - Progress bar types
