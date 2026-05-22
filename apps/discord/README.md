# Discord Bots - World of Darkness Suite

Node.js Discord bot suite providing slash commands, dice rolling, and character management for World of Darkness tabletop RPGs. Three specialized bots support V5, V20, and Chronicles of Darkness game systems.

## 🤖 Bot Architecture

| Bot          | Game System                  | Features                                         |
| ------------ | ---------------------------- | ------------------------------------------------ |
| **5th Bot**  | Vampire, Hunter and Werewolf | Hunger dice, compulsions, 5th character trackers |
| **20th Bot** | World of Darkness 20th       | Classic WoD dice, 5th edition character sheets   |
| **CoD Bot**  | Chronicles of Darkness       | CoD 2e mechanics, conditions, tilts              |

## �️ Tech Stack

- **Discord.js 14.16** - Discord API wrapper
- **Node.js 18+** - JavaScript runtime
- **TypeScript** - Type safety (partial migration)
- **Module-alias** - Clean import paths (`@commands`, `@modules`)
- **Nodemon** - Development hot reloading

## 🚀 Development Setup

### Quick Start

```bash
# Install dependencies
npm install

# Deploy slash commands to development server
npm run deploy:all

# Start all bots in development mode
npm run dev:5th
npm run dev:20th
npm run dev:cod
```

### Environment Configuration

```env
# Bot Client IDs (from Discord Developer Portal)
CLIENT_ID_5TH=your_v5_bot_client_id
CLIENT_ID_20TH=your_v20_bot_client_id
CLIENT_ID_COD=your_cod_bot_client_id

# Bot Tokens (from Discord Developer Portal)
TOKEN_5TH=your_v5_bot_token
TOKEN_20TH=your_v20_bot_token
TOKEN_COD=your_cod_bot_token

# Development server for command testing
DEV_SERVER_ID=your_test_server_id

# Backend API integration
API_KEY=matches_backend_api_key
API_BASE_URL=http://localhost:8080  # Backend server URL
```

## � Project Structure

```
discord_bots/
├── src/
│   ├── shards/               # Bot entry points
│   │   ├── index-5th.js     # V5 bot launcher
│   │   ├── index-20th.js    # V20 bot launcher
│   │   └── index-cod.js     # CoD bot launcher
│   ├── commands/            # Slash command implementations
│   │   ├── 5th/            # V5-specific commands
│   │   │   ├── vtmDice.js  # V5 dice rolling
│   │   │   ├── character.js # V5 character management
│   │   │   └── hunger.js   # Hunger mechanics
│   │   ├── 20th/           # V20-specific commands
│   │   └── cod/            # Chronicles of Darkness commands
│   ├── events/             # Discord.js event handlers
│   │   ├── ready.js        # Bot startup
│   │   ├── interactionCreate.js # Command handling
│   │   └── guildCreate.js  # New server setup
│   ├── modules/            # Shared utilities
│   │   ├── dice/           # Dice rolling engines
│   │   ├── character/      # Character validation
│   │   └── utils/          # Helper functions
│   ├── realmAPI/           # Backend API client
│   │   ├── characters.js   # Character CRUD operations
│   │   ├── users.js        # User management
│   │   └── index.js        # API wrapper
│   ├── constants/          # Game system constants
│   ├── structures/         # Data models
│   └── errors/             # Error handling
├── scripts/                # Development scripts
│   ├── deploy.js          # Slash command deployment
│   ├── build.js           # TypeScript compilation
│   └── run.sh             # Production launcher
├── alias.js               # Module path aliases
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## 🎲 Command Categories

### Character Management

```javascript
/character create        # Create new character tracker
/character view         # Display character information
/character update       # Modify character attributes
/character list         # Show user's characters
/character delete       # Remove character
```

### Dice Rolling (V5)

```javascript
/v hunger               # Roll hunger dice
/v test                 # Attribute + skill tests
/v rouse                # Rouse checks
/v frenzy               # Frenzy resistance
/v compulsion           # Random compulsion
```

### Dice Rolling (V20)

```javascript
/w test                 # Attribute + ability tests
/w extended             # Extended actions
/w rite                 # Garou rites
/w resonance            # Mage resonance
```

### Chronicles of Darkness

```javascript
/cod test               # Core mechanic tests
/cod condition          # Apply/remove conditions
/cod tilt               # Environmental tilts
```

## 🔧 Development Workflow

### Command Development

```javascript
// Example: Creating a new V5 command
// File: src/commands/5th/newCommand.js
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("v")
    .setDescription("V5 command")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("new-action")
        .setDescription("New V5 action")
        .addIntegerOption((option) =>
          option
            .setName("dice")
            .setDescription("Number of dice")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    // Command logic here
    await interaction.deferReply();
    // ... implementation
    await interaction.editReply({ content: "Result" });
  },
};
```

### Module Alias Usage

```javascript
// Clean imports using aliases (defined in alias.js)
const DiceRoller = require("@modules/dice/DiceRoller");
const CharacterAPI = require("@realmAPI/characters");
const { V5_CONSTANTS } = require("@constants/vampire5th");

// Instead of messy relative paths:
// const DiceRoller = require('../../modules/dice/DiceRoller');
```

### Backend API Integration

```javascript
// Example: Updating character via backend API
const realmAPI = require("@realmAPI");

async function updateCharacterHealth(characterId, newHealth) {
  try {
    const response = await realmAPI.characters.update(characterId, {
      health: newHealth,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update character:", error.message);
    throw error;
  }
}
```

### NPM Scripts Reference

```bash
# Development (deploys commands to dev server only)
npm run dev:5th          # V5 bot development
npm run dev:20th         # V20 bot development
npm run dev:cod          # CoD bot development

# Global development (deploys commands globally - use carefully)
npm run dev:5th:global   # V5 bot with global commands
npm run dev:20th:global  # V20 bot with global commands
npm run dev:cod:global   # CoD bot with global commands

# Production deployment
npm run deploy:5th       # Deploy V5 commands to production
npm run deploy:20th      # Deploy V20 commands to production
npm run deploy:cod       # Deploy CoD commands to production
npm run deploy:all       # Deploy all bot commands

# Command cleanup (removes commands)
npm run clear:5th:dev    # Clear V5 dev server commands
npm run clear:all:dev    # Clear all dev server commands
npm run clear:all:global # Clear all global commands (dangerous!)

# Production
npm run build            # Compile TypeScript to dist/
npm start               # Run production bots
```

## 🧪 Testing & Debugging

### Local Testing Setup

1. Create a Discord test server
2. Add your bot applications to the server
3. Set `DEV_SERVER_ID` in .env to your test server ID
4. Use `npm run dev:*` commands for development
5. Commands deploy only to your test server

### Error Handling Patterns

```javascript
// Standard error handling in commands
async execute(interaction) {
    try {
        await interaction.deferReply();

        // Command logic here
        const result = await someAsyncOperation();

        await interaction.editReply({ content: result });
    } catch (error) {
        console.error(`Error in ${interaction.commandName}:`, error);

        const errorMessage = 'Something went wrong. Please try again.';

        if (interaction.deferred) {
            await interaction.editReply({ content: errorMessage });
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
}
```

### Backend Connection Testing

```bash
# Test backend API connectivity
node -e "
const api = require('./src/realmAPI');
api.characters.list()
    .then(chars => console.log('Backend connected, found', chars.length, 'characters'))
    .catch(err => console.error('Backend connection failed:', err.message));
"
```

## 🚀 Production Deployment

### Build Process

```bash
# Compile TypeScript files
npm run build

# Start production bots
npm start
```

### Environment Considerations

- Use `NODE_ENV=production` for production
- Deploy commands globally with `npm run deploy:all`
- Ensure backend API is accessible at production URL
- Monitor bot uptime and Discord API rate limits

---

**Development Tips:**

- Always test commands in a development server first
- Use `interaction.deferReply()` for commands that may take time
- Handle API errors gracefully with user-friendly messages
- Check backend server is running before starting bots
- Use proper TypeScript types for new files
