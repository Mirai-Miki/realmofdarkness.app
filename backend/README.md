# Backend - Django REST API

Django 5.2 backend providing REST APIs, WebSocket services, and Discord integration for World of Darkness character sheet management.

## 🛠️ Technology Stack

| Component            | Technology                         | Purpose                     |
| -------------------- | ---------------------------------- | --------------------------- |
| **Web Framework**    | Django 5.2.3                       | Core backend framework      |
| **API Framework**    | Django REST Framework 3.16.0       | RESTful API endpoints       |
| **WebSocket**        | Django Channels 4.2.2              | Real-time communication     |
| **Message Broker**   | Redis 6.2.0 + channels-redis 4.2.1 | WebSocket backend & caching |
| **Database**         | SQLite (dev) / MySQL (prod)        | Data persistence            |
| **Image Processing** | Pillow 11.2.1                      | Character avatar handling   |
| **Environment**      | python-dotenv 1.1.1                | Configuration management    |

## 🚀 Development Setup

### Backend-Only Development

```bash
# From backend/scripts/
./dev.bat     # Windows
./dev.sh      # Linux/macOS
```

### Full-Stack Development

```bash
# From project root
./dev.bat     # Windows - starts backend + frontend + Discord bots
./dev.sh      # Linux/macOS
```

**Services Started:**

- Django dev server: `http://localhost:8080`
- Redis server (WSL on Windows, native on Linux/macOS)
- Auto-migration on startup

## 📁 Django App Architecture

```
backend/
├── rod/                    # Django project configuration
│   ├── settings.py        # Environment-based configuration
│   ├── urls.py           # Root URL routing
│   ├── asgi.py           # ASGI application (WebSocket support)
│   └── wsgi.py           # WSGI application (HTTP only)
├── api/                   # Public REST API layer
│   ├── views.py          # DRF ViewSets for CRUD operations
│   ├── urls.py           # API endpoint routing
│   └── throttling.py     # API rate limiting
├── haven/                 # Character sheet core system
│   ├── models/           # Character models by game system
│   │   ├── Character5th.py    # 5th Edition Shared data
│   │   ├── Character20th.py   # 20th Edition Shared data
│   │   ├── Vampire5th.py      # V5-specific vampire data
│   │   └── Mortal.py          # Mortal character sheets
│   ├── serializers/      # DRF serializers for API responses
│   └── utility.py        # Character validation & helpers
├── gateway/              # WebSocket real-time services
│   ├── consumers.py      # WebSocket message handlers
│   ├── routing.py        # WebSocket URL routing
│   └── serializers/      # WebSocket message serialization
├── chronicle/            # Campaign/chronicle management
│   ├── models.py         # Chronicle and members models
│   └── serializers.py    # Chronicle API serialization
├── discordauth/          # Discord OAuth2 integration
│   ├── backends.py       # Custom authentication backend
│   ├── models.py         # Extended user model with Discord data
│   └── views.py          # OAuth flow handling
├── bot/                  # Discord bot API endpoints
│   ├── views/            # Internal bot API views
│   ├── models.py         # Bot-specific data models
│   └── serializers.py    # Bot API serialization
├── patreon/             # Patreon webhook integration
├── main/                # Core site functionality
├── constants/           # Game system constants and enums
│   └── splats.py        # Vampire clans, werewolf tribes, etc.
└── media/               # User uploaded files (avatars)
```

## 🏗️ Key Django Applications

### `haven` - Character Sheet Engine

**Purpose**: Core character sheet system supporting multiple World of Darkness game lines

**Models**:

- `Character` (base model): Name, avatar, chronicle association, user ownership
- `Character5th`: 5th Edition shared data
- `Character20th`: 20th Edition shared data
- `Vampire5th`: V5-specific data (hunger, compulsions)
- `Mortal`: Human character data

**Key Features**:

- Multi-inheritance character model system
- Game-specific field validation
- Avatar upload and processing
- Character-chronicle relationship management

### `gateway` - WebSocket Real-time Engine

**Purpose**: Real-time character sheet synchronization and live updates

**Architecture**:

- **Consumer**: `CharacterConsumer` handles WebSocket connections
- **Groups**: Redis-backed channel groups organized by chronicle
- **Authentication**: Token-based WebSocket authentication
- **Message Types**: Character updates, user notifications, system events

**Message Flow**:

```python
# Frontend → WebSocket → Redis → Other clients
{
    "type": "character.update",
    "character_id": 123,
    "field": "health",
    "value": 5,
    "user": "username"
}
```

### `chronicle` - Campaign Management

**Purpose**: Organize characters into shared storytelling environments

**Models**:

- `Chronicle`: Campaign/game session container
- `ChronicleSettings`: Chronicle-specific configuration
- **Relationships**: Many-to-many character-chronicle associations

**Discord Integration**:

- Links chronicles to Discord servers
- Permission-based character access control
- Server member synchronization

### `discordauth` - Authentication & User Management

**Purpose**: Discord OAuth2 integration and user session management

**Components**:

- **OAuth Backend**: Custom Django authentication backend
- **User Model Extension**: Discord profile data storage
- **Session Management**: Token-based API authentication
- **Middleware**: Request authentication for Discord bot APIs

### `api` - Public REST API Layer

**Purpose**: RESTful API endpoints for frontend and external integrations

**Endpoints Structure**:

```python
# Character CRUD
GET/POST    /api/characters/
GET/PUT/DELETE /api/characters/{id}/

# Chronicle management
GET/POST    /api/chronicles/
GET/PUT/DELETE /api/chronicles/{id}/

# User profile
GET/PUT     /api/profile/
```

### `bot` - Discord Bot Internal API

**Purpose**: Internal API endpoints for Discord bot communication

**Security**: API key authentication for bot requests
**Features**:

- Character updates from Discord commands
- Server member synchronization
- Permission validation for bot operations

## 💾 Database Schema Overview

### Character System Architecture

```sql
-- Base character model (multi-table inheritance)
Character
├── id (PK)
├── name
├── avatar (ImageField)
├── user_id (FK to auth.User)
├── chronicle_id (FK to Chronicle)
└── created_at

-- Version-specific character extensions
Character5th (extends Character)
├── generation, hunger, humanity
├── clan, coterie, sect
└── v5_specific_fields...

Character20th (extends Character)
├── generation, blood_pool, humanity
├── clan, nature, demeanor
└── v20_specific_fields...

-- Game-specific character extenstions
Vampire5th (extends Character5th)
├── compulsions, touchstones
├── discipline_powers
└── vampire_specific_mechanics...
```

### WebSocket Channel Architecture

```python
# Redis Channel Groups Structure
channel_groups = {
    f"chronicle_{chronicle.id}": [
        "user_123_websocket",
        "user_456_websocket"
    ],
    f"user_{user.id}_notifications": [
        "user_123_websocket"
    ]
}
```

## 🔌 API Reference

### REST API Endpoints (`/api/`)

#### Character Management

```http
GET    /api/characters/                # List user's characters
POST   /api/characters/                # Create new character
GET    /api/characters/{id}/           # Retrieve character details
PUT    /api/characters/{id}/           # Update character (full)
PATCH  /api/characters/{id}/           # Partial character update
DELETE /api/characters/{id}/           # Delete character

# Character avatar upload
POST   /api/characters/{id}/avatar/    # Upload character avatar image
DELETE /api/characters/{id}/avatar/    # Remove character avatar
```

#### Chronicle Management

```http
GET    /api/chronicles/                # List user's chronicles
POST   /api/chronicles/                # Create new chronicle
GET    /api/chronicles/{id}/           # Chronicle details
PUT    /api/chronicles/{id}/           # Update chronicle
DELETE /api/chronicles/{id}/           # Delete chronicle

# Chronicle membership
GET    /api/chronicles/{id}/members/   # List chronicle members
POST   /api/chronicles/{id}/join/      # Join chronicle
DELETE /api/chronicles/{id}/leave/     # Leave chronicle
```

#### User Profile

```http
GET    /api/profile/                   # Current user profile
PUT    /api/profile/                   # Update user profile
GET    /api/profile/characters/        # User's characters across all chronicles
```

### Discord Bot Internal API (`/bot/`)

#### Character Operations

```http
POST   /bot/characters/{id}/update/    # Bot-triggered character updates
GET    /bot/server/{server_id}/characters/ # List server characters
POST   /bot/characters/create/         # Create character via bot
```

#### Server Synchronization

```http
POST   /bot/users/sync/                # Sync Discord user data
GET    /bot/server/{server_id}/info/   # Server information
POST   /bot/server/{server_id}/sync/   # Sync server members
```

### WebSocket API (`/ws/gateway/web/`)

#### Connection Flow

```javascript
// 1. Connect with authentication
const ws = new WebSocket("ws://localhost:8080/ws/gateway/web/", [], {
  headers: { Authorization: `Token ${userToken}` },
});

// 2. Join chronicle groups (automatic on connect)
// 3. Listen for character updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "character.update") {
    updateCharacterInUI(data.character_id, data.field, data.value);
  }
};

// 4. Send character updates
ws.send(
  JSON.stringify({
    type: "character.update",
    character_id: 123,
    field: "health",
    value: 5,
  })
);
```

#### Message Types

```typescript
// Character update message
interface CharacterUpdateMessage {
  type: "character.update";
  character_id: number;
  field: string;
  value: any;
  user: string;
  timestamp: string;
}

// User notification message
interface NotificationMessage {
  type: "notification";
  message: string;
  level: "info" | "warning" | "error" | "success";
  timestamp: string;
}

// System event message
interface SystemMessage {
  type: "system.event";
  event: "user_joined" | "user_left" | "chronicle_updated";
  data: any;
  timestamp: string;
}
```

## 🔧 Development Workflows

### Database Operations

```bash
# Create migration files after model changes
python manage.py makemigrations

# Apply migrations to database
python manage.py migrate

# Create Django superuser
python manage.py createsuperuser

# Database shell access
python manage.py dbshell

# Django shell with models loaded
python manage.py shell
```

### Adding New Game Systems

#### 1. Create Character Model

```python
# In haven/models/NewGameSystem.py
from .Character import Character

class NewGameCharacter(Character):
    # Game-specific fields
    power_level = models.IntegerField(default=1)
    faction = models.CharField(max_length=50)

    class Meta:
        db_table = 'haven_newgame_character'
```

#### 2. Create DRF Serializer

```python
# In haven/serializers/NewGameSystem.py
from rest_framework import serializers
from ..models.NewGameSystem import NewGameCharacter

class NewGameCharacterSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewGameCharacter
        fields = '__all__'
```

#### 3. Add API Views

```python
# In api/views.py
from haven.serializers.NewGameSystem import NewGameCharacterSerializer

class NewGameCharacterViewSet(viewsets.ModelViewSet):
    serializer_class = NewGameCharacterSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return NewGameCharacter.objects.filter(user=self.request.user)
```

#### 4. Update WebSocket Consumer

```python
# In gateway/consumers.py
async def character_update(self, event):
    character_id = event['character_id']
    # Handle NewGameCharacter updates
    await self.send(text_data=json.dumps({
        'type': 'character.update',
        'character_id': character_id,
        'data': event['data']
    }))
```

### WebSocket Development

#### Testing WebSocket Connections

```bash
# Test Redis connection
python manage.py shell
>>> import redis
>>> r = redis.Redis(host='localhost', port=6379, db=1)
>>> r.ping()
True

# Test WebSocket consumer
python manage.py test gateway.tests.ConsumerTestCase
```

#### WebSocket Message Flow

```python
# 1. Frontend sends update
websocket.send({
    'type': 'character.update',
    'character_id': 123,
    'field': 'health',
    'value': 8
})

# 2. Consumer processes message
async def receive(self, text_data):
    data = json.loads(text_data)
    await self.channel_layer.group_send(
        f"chronicle_{self.chronicle_id}",
        {
            'type': 'character.update',
            'character_id': data['character_id'],
            'field': data['field'],
            'value': data['value'],
            'user': self.user.username
        }
    )

# 3. All chronicle members receive update
async def character_update(self, event):
    await self.send(text_data=json.dumps({
        'type': 'character.update',
        'character_id': event['character_id'],
        'field': event['field'],
        'value': event['value'],
        'user': event['user']
    }))
```

### Discord Bot Integration

#### Bot API Authentication

```python
# Bot requests must include API key header
headers = {
    'Authorization': f'ApiKey {settings.API_KEY}',
    'Content-Type': 'application/json'
}

response = requests.post(
    'http://localhost:8080/bot/characters/123/update/',
    headers=headers,
    json={'field': 'health', 'value': 5}
)
```

#### Character Update Flow

```python
# 1. Discord bot receives command
@slash_command(name="damage")
async def damage_character(ctx, character_id: int, damage: int):
    # 2. Bot calls Django API
    response = await bot_api_client.update_character(
        character_id=character_id,
        field='health',
        value=current_health - damage
    )

    # 3. Django API updates database and notifies WebSocket
    # 4. Frontend receives real-time update
    # 5. Bot responds to Discord
    await ctx.respond(f"Character took {damage} damage!")
```

## ⚙️ Configuration & Environment

### Environment Variables

```bash
# Core Django settings
SECRET_KEY=your-secret-key-here
DEBUG=True                          # False for production
API_KEY=your-api-key-for-bots      # Discord bot authentication

# Database configuration
DB_ENGINE=sqlite3                   # or mysql for production
DB_NAME=db.sqlite3                 # SQLite file or MySQL database name
DB_HOST=localhost                  # MySQL host (production only)
DB_USER=username                   # MySQL username (production only)
DB_PASSWORD=password               # MySQL password (production only)
DB_PORT=3306                       # MySQL port (production only)

# Redis configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB_INDEX=1                   # Redis database index for channels

# Discord integration
DISCORD_BOT_TOKEN=your-bot-token
DISCORD_DEBUG_CHANNEL=channel-id   # For error logging

# File storage
MEDIA_ROOT=media/                  # Local media storage path
MEDIA_URL=/media/                  # URL prefix for media files

# Production-only settings
ALLOWED_HOSTS=your-domain.com      # Comma-separated domains
CSRF_TRUSTED_ORIGINS=https://your-domain.com
```

### Settings Architecture

```python
# settings.py structure
if DEBUG:
    # Development settings
    ALLOWED_HOSTS = ["localhost", "127.0.0.1"]
    INSTALLED_APPS = ["daphne"] + COMMON_APPS  # WebSocket support
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    # Production settings
    ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")
    INSTALLED_APPS = COMMON_APPS
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': os.getenv('DB_NAME'),
            'USER': os.getenv('DB_USER'),
            'PASSWORD': os.getenv('DB_PASSWORD'),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '3306'),
        }
    }
```

## 🧪 Testing & Debugging

### Running Tests

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test haven
python manage.py test gateway
python manage.py test api

# Run with coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
coverage html  # Generates htmlcov/ directory
```

### Debugging WebSocket Issues

```python
# Enable Django Channels logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'channels': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

### Common Debugging Commands

```bash
# Check current migrations
python manage.py showmigrations

# Create SQL for migrations (without applying)
python manage.py sqlmigrate haven 0001

# Check for model issues
python manage.py check

# Collect static files
python manage.py collectstatic

# Clear Redis cache
python manage.py shell
>>> import redis
>>> r = redis.Redis()
>>> r.flushdb()
```

### Performance Optimization

```python
# Database query optimization
from django.db import connection
from django.conf import settings

# Enable SQL query logging in development
if settings.DEBUG:
    print(f"Queries executed: {len(connection.queries)}")
    for query in connection.queries:
        print(query['sql'])

# Use select_related for foreign keys
characters = Character.objects.select_related('user', 'chronicle')

# Use prefetch_related for many-to-many
chronicles = Chronicle.objects.prefetch_related('members')
```

## 🚀 Production Deployment

### Production Checklist

- [ ] Set `DEBUG=False`
- [ ] Configure MySQL database
- [ ] Set proper `ALLOWED_HOSTS`
- [ ] Configure Redis with persistence
- [ ] Set up proper logging
- [ ] Configure media file serving (nginx/cloudinary)
- [ ] Set up SSL certificates
- [ ] Configure environment variables securely

### Production Settings

```python
# Additional production settings in settings.py
if not DEBUG:
    # Security settings
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_SECURE = True

    # Static files
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

    # Logging
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'handlers': {
            'file': {
                'level': 'INFO',
                'class': 'logging.FileHandler',
                'filename': '/var/log/django/debug.log',
            },
        },
        'loggers': {
            'django': {
                'handlers': ['file'],
                'level': 'INFO',
                'propagate': True,
            },
        },
    }
```

---

**Backend Development Tips:**

- Always test WebSocket functionality after character model changes
- Use Django's built-in admin interface for debugging data issues
- Monitor Redis memory usage in production
- Implement proper error handling for Discord API failures
- Use database transactions for complex character updates
