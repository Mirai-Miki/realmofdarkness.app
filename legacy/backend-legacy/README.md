# Django Backend

The Django backend provides a REST API for character management, real-time updates via WebSockets, and Discord bot integration for the Realm of Darkness tabletop gaming platform.

## 🏗️ Architecture Overview

### Project Structure

```
backend/
├── rod/                    # Django project settings
│   ├── settings.py        # Main configuration file
│   ├── urls.py           # Root URL routing
│   ├── asgi.py           # ASGI configuration for WebSockets
│   └── wsgi.py           # WSGI configuration for HTTP
├── haven/                 # Character management app
│   ├── models/           # Character data models
│   ├── serializers/      # DRF serializers for API
│   └── utility.py        # Helper functions
├── api/                   # Public REST API endpoints
│   ├── views.py          # API view classes
│   └── urls.py           # API URL routing
├── bot/                   # Discord bot internal API
│   ├── views/            # Bot-specific endpoints
│   │   └── character_views/  # Character operations for bots
│   └── urls.py           # Bot API routing
├── gateway/              # WebSocket gateway
│   ├── consumers.py      # WebSocket message handlers
│   ├── routing.py        # WebSocket URL routing
│   └── constants.py      # Channel group definitions
├── discordauth/          # Discord OAuth authentication
│   ├── models.py         # User model extensions
│   ├── views.py          # OAuth flow handlers
│   └── backends.py       # Custom auth backend
├── chronicle/            # Chronicle/campaign management
├── patreon/              # Patreon integration
├── main/                 # Frontend serving
├── scripts/              # Setup and utility scripts
│   ├── setup.sh          # Environment setup (Unix)
│   ├── setup.bat         # Environment setup (Windows)
│   ├── dev.sh            # Development server
│   └── run.sh            # Production server
├── media/                # User-uploaded files
├── manage.py             # Django management script
└── .env                  # Environment configuration
```

### Data Model Hierarchy

The backend uses a multi-level inheritance structure to represent characters across different game systems and types:

```python
# Base model: fields common to all characters
Character (haven/models/Character.py)
├── name, user, chronicle, avatar, experience, timestamps, splat, etc.

# System version models: fields common to all characters in a game edition
Character5th (extends Character)
├── core stats: health, willpower, attributes, skills, etc. (All 5th edition characters)

Character20th (extends Character)
├── core stats: health, willpower, attributes, skills, etc. (All 20th anniversary edition characters)

# Splats: actual character types (used in practice)
Vampire5th (extends Character5th)
├── Clan, generation, predator_type, humanity, disciplines, etc. (Vampire, 5th edition)

Vampire20th (extends Character20th)
├── Clan, morality, blood_pool, etc. (Vampire, 20th anniversary edition)

# ...other splats (e.g., Ghoul5th, Human5th, Werewolf5th, etc.) also extend the appropriate system version model
```

- **Character**: The abstract base model. Only contains fields that every character (regardless of system or type) must have.
- **Character5th / Character20th**: System version models. Contain fields shared by all characters in that edition (e.g., all 5th edition characters have the same set of attributes/skills).
- **Splats (e.g., Vampire5th, Vampire20th, etc.)**: The actual character types used in the game. These contain fields specific to that type (e.g., humanity, clan, blood pool) and are the models you interact with most in practice.

The `splat` field on `Character` is used to identify and retrieve the specific derived instance (the actual splat/type) for a given character.

### API Architecture

**Public API (`/api/`)** - Frontend and general client access

- Character CRUD operations
- Chronicle management
- User profile management
- Uses Django REST Framework with session authentication

**Bot API (`/bot/`)** - Discord bot internal endpoints

- Character operations triggered by bot commands
- Server synchronization
- Uses API key authentication

**WebSocket Gateway (`/ws/gateway/`)** - Real-time updates

- Character field updates
- User presence
- Chronicle notifications
- Uses Redis for channel layers

## ⚙️ Configuration & Setup

### Environment Configuration

The backend uses environment variables for configuration. You can run the setup script directly to create your `.env` file, or simply use the development script, which will automatically run the setup if your environment is not configured:

```bash
# Windows (runs setup if needed)
scripts\dev.bat

# Unix/Linux/macOS (runs setup if needed)
scripts/dev.sh
```

Alternatively, you can run the setup script manually:

```bash
# Windows
scripts\setup.bat

# Unix/Linux/macOS
scripts/setup.sh
```

The setup script will prompt you for:

- Environment type (development/production/preproduction)
- Database configuration
- Django secret keys
- Discord integration settings
- Patreon webhook settings

### Environment Variables

```bash
# Environment type
ENV=development                     # development|preproduction|production

# Database configuration
DB_ENGINE=sqlite3                   # sqlite3 for dev, mysql for prod
DB_NAME=db.sqlite3                  # Database name/file
DB_HOST=localhost                   # MySQL host (production only)
DB_USER=username                    # MySQL username (production only)
DB_PASSWORD=password                # MySQL password (production only)
DB_PORT=3306                        # MySQL port (production only)

# Redis configuration
REDIS_DB_INDEX=0                    # Redis database index for channels

# Django security
SECRET_KEY=your-secret-key-here     # Django secret key
API_KEY=your-api-key-for-bots      # Discord bot authentication

# Discord integration
DISCORD_APP_ID=your-app-id
DISCORD_APP_SECRET=your-app-secret
DISCORD_BOT_TOKEN=your-bot-token
DISCORD_DEBUG_CHANNEL=channel-id    # For error logging

# Patreon integration
PATREON_WEBHOOK_SECRET=your-webhook-secret
```

### Settings Architecture

The `settings.py` file uses environment-based configuration:

```python
ENV = os.getenv("ENV", "development")
DEBUG = ENV == "development"

if ENV == "development":
    # Development settings
    ALLOWED_HOSTS = ["localhost", "127.0.0.1"]
    CSRF_TRUSTED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
elif ENV == "preproduction":
    # Preproduction settings
    ALLOWED_HOSTS = ["localhost", "127.0.0.1", "dev.realmofdarkness.app"]
    # Production-like settings but accessible for testing
else:  # production
    # Production settings
    ALLOWED_HOSTS = ["realmofdarkness.app", "www.realmofdarkness.app"]
    # Full production security and performance settings
```

## 🚀 Running the Backend

> **Note:** A Redis server must be installed and available on your system for WebSocket and real-time features to work. The provided dev scripts will attempt to start Redis automatically if possible, but you may need to ensure Redis is installed and running. If you encounter backend issues, try manually starting Redis yourself.

**Recommended:** Use the provided development script to start everything you need for backend development. The script will also check for a valid `.env` file and run the setup script automatically if configuration is missing or incomplete:

```bash
# From backend/ directory
scripts/dev.sh    # Unix/Linux/macOS (runs setup if needed)
scripts/dev.bat   # Windows (runs setup if needed)
```

These scripts will:

- Check for a valid `.env` file and run the setup script if needed
- Set up and activate a Python virtual environment (creating it if needed)
- Install/update all Python dependencies
- Format code with Black
- Apply database migrations
- Attempt to start a Redis server (if possible on your platform)
- Start the Django development server at http://localhost:8080

> If Redis is not installed or cannot be started automatically, you must install and start it manually. See below for platform-specific instructions.

#### Manual Redis Startup (if needed)

If you have issues with real-time features or see errors related to Redis, try starting Redis manually:

- **Ubuntu/Debian:**
  ```bash
  sudo systemctl start redis-server
  ```
- **macOS:**
  ```bash
  brew services start redis
  ```
- **Windows (WSL required):**
  ```bash
  wsl -e redis-server --daemonize yes
  ```
  Or, if you have Redis installed natively:
  ```bash
  redis-server
  ```

Once Redis is running, re-run the dev script if needed.

When finished the backend will be available at http://localhost:8080

---

## 📦 Updating Python Packages

To update your Python dependencies, use the provided scripts. These will launch an interactive helper that checks for outdated packages and lets you choose which to update:

```bash
# Windows
scripts\update_packages.bat

# Unix/Linux/macOS
scripts/update_packages.sh
```

### Recommended Workflow for Updating Packages

1. **Create a new branch for dependency updates**
   - For example: `deps/update-backend-packages`
2. **Run the update script**
   - This will check for outdated packages and let you choose which to update.
   - The script will automatically update `requirements-dev.txt` with the new versions.
3. **Test your environment**
   - Make sure the backend runs and all tests pass after updating dependencies.
4. **Synchronize production requirements**
   - Use the sync script to automatically update `requirements.txt` with matching package versions from `requirements-dev.txt`:

   ```bash
   # Windows
   scripts\sync_requirements.bat

   # Unix/Linux/macOS
   scripts/sync_requirements.sh
   ```

   - This script will only update versions of packages that exist in both files and will report any development-only packages.

5. **Commit your changes and open a pull request**
   - Include both `requirements-dev.txt` and `requirements.txt` in your commit.

> If you see errors about the virtual environment, make sure to run the dev script first to set up your environment.

### Synchronizing Requirements Files

After updating packages in development, you can use the sync script to automatically update production requirements:

```bash
# Windows
scripts\sync_requirements.bat

# Unix/Linux/macOS
scripts/sync_requirements.sh
```

This script will:

- Compare package versions between `requirements-dev.txt` and `requirements.txt`
- Update `requirements.txt` with newer versions from development requirements
- Only update packages that exist in both files (won't add new packages to production)
- Handle packages with extras correctly (e.g., `channels[daphne]` in dev becomes `channels` in production)
- Report which packages were updated and list development-only packages
