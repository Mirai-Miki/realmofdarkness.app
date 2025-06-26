# Realm of Darkness Frontend

The React frontend for the Realm of Darkness platform, providing character sheet management and real-time collaboration for World of Darkness tabletop RPGs.

## Tech Stack

- **React 19** with functional components and hooks
- **Material-UI (MUI)** for component library and theming
- **React Router** for client-side routing
- **WebSocket integration** for real-time updates via Django Channels
- **Create React App** for build tooling

## Development

### Quick Start

Run the development environment from the project root:

```bash
# Windows
dev.bat

# Linux/macOS
./dev.sh
```

This automatically starts both backend and frontend servers. The frontend will be available at http://localhost:3000.

### Frontend Only

To run just the frontend (requires backend running separately):

```bash
cd frontend
./dev.bat or ./dev.sh
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Sheet/          # Character sheet components
│   ├── Sheet5th/       # V5-specific sheet components
│   ├── CharacterCards/ # Character card displays
│   ├── Commands/       # Discord command interfaces
│   ├── dashboard/      # Dashboard components
│   └── Trackers/       # Health/willpower trackers
├── routes/             # Page-level route components
│   ├── v5/            # Vampire: The Masquerade V5 pages
│   ├── 20th/          # V20 edition pages
│   ├── CoD/           # Chronicles of Darkness pages
│   └── Character/     # Character management pages
├── gateway/           # WebSocket connection management
├── structures/        # Data models and API clients
├── utility/           # Helper functions and utilities
├── constants/         # Application constants
└── setupProxy.js      # API proxy configuration
```

## Key Features

### Character Sheet System

- **Multi-game support**: V5, V20, Chronicles of Darkness
- **Real-time collaboration**: Live updates via WebSockets
- **Responsive design**: Works on desktop and mobile
- **Auto-save**: Changes saved automatically

### Discord Integration

- **OAuth login**: Login with Discord account
- **Server sync**: Characters linked to Discord servers
- **Live updates**: Sheet changes reflected in Discord bot

### API Integration

- **RESTful API**: Standard CRUD operations
- **WebSocket API**: Real-time updates and notifications
- **Proxy setup**: Development proxy to Django backend (port 8080)

## Development Guidelines

### Component Organization

- **Reusable components** in `/components/`
- **Page components** in `/routes/`
- **Business logic** in `/structures/`
- **Utilities** in `/utility/`

### State Management

- React Context for global state (ClientProvider, AlertProvider)
- Local state with useState/useReducer for component state
- WebSocket connection managed in gateway/

### API Communication

- REST API calls via utility functions
- WebSocket messages for real-time features
- Error handling with AlertProvider

## Scripts

| Command                | Description               |
| ---------------------- | ------------------------- |
| `npm start`            | Start development server  |
| `npm test`             | Run test suite            |
| `npm run build`        | Build for production      |
| `npm run format`       | Format code with Prettier |
| `npm run format:check` | Check code formatting     |
| `npm run lint`         | Run ESLint                |

## Configuration

### Proxy Setup

The `setupProxy.js` file proxies API and media requests to the Django backend:

- `/api/*` → `http://localhost:8080/api/*`
- `/media/*` → `http://localhost:8080/media/*`

### Environment

The frontend connects to:

- **Backend API**: http://localhost:8080 (development)
- **WebSocket**: ws://localhost:8080/ws/ (for real-time features)

## Common Development Tasks

### Adding New Character Sheet Fields

1. Update the character model in `/structures/`
2. Create/update form components in `/components/Sheet*/`
3. Add validation and save logic
4. Test real-time sync functionality

### Creating New Game System Support

1. Add new route structure in `/routes/[game]/`
2. Create game-specific components in `/components/`
3. Update constants and utilities as needed
4. Ensure WebSocket integration works

### Debugging WebSocket Issues

- Check browser Network tab for WebSocket connection
- Monitor console for connection/disconnection events
- Verify backend WebSocket routing is correct
