# Haven Character API Views

This directory contains the REST API implementation for character management in the Haven app.

## What Was Implemented

### 1. Main Views (`views.py`)

- **CharacterView**: Simple APIView for character CRUD operations
  - `get()`: List all characters or get specific character by ID (sheet data only)
  - `post()`: Create new character
  - `put()`: Update existing character
  - `delete()`: Delete character

### 2. URL Configuration (`urls.py`)

- Simple URL patterns for character operations
- Integrated with main project URLs at `/api/`

### 3. Key Features

#### Simple APIView Design

- Single APIView class handling all character operations
- Method-based routing (GET, POST, PUT, DELETE)
- No complex ViewSets or routers - just simple, direct endpoints

#### Authentication & Security

- All endpoints require authentication (`IsAuthenticated` permission)
- CharacterManager handles all permission checks
- Database transactions for all write operations
- Proper error handling and logging

#### Error Handling

- Custom exception handling for CharacterManagerException
- Proper HTTP status codes
- Consistent error response format
- Conditional logging based on error.log flag
- All exceptions are logged and messages returned

#### Data Handling

- Sheet data only (tracker data is handled by Gateway)
- Validation delegated to CharacterManager (including splat filters)
- Type-safe request data extraction
- Proper handling of DRF request objects

### 4. Integration with CharacterManager

- All business logic delegated to CharacterManager
- No direct model access in views
- Proper exception propagation and handling
- CharacterManager handles all validation (splats, permissions, etc.)

### 5. Public Endpoints Only

- Simplified functionality for public use
- No stats or discipline endpoints (those belong in /bot/)
- Focus on essential CRUD operations
- Sheet data only (no tracker/deserializer options)

## API Endpoints

### Character Operations

- `GET /api/character/` - List characters with optional filtering
- `POST /api/character/` - Create character
- `GET /api/character/{id}/` - Get character by ID (sheet data)
- `PUT /api/character/{id}/` - Update character
- `DELETE /api/character/{id}/` - Delete character

## Features

### Query Parameters (GET /api/character/)

- `splat_filter`: Filter by character splats (comma-separated)
- `is_sheet`: Filter by sheet status
- `chronicle_id`: Filter by chronicle

### Request/Response

- All GET operations return sheet serializer data
- POST/PUT accept character data in request body
- Required fields: name, splat
- Consistent error response format

### Error Handling

- 400: Bad Request (validation errors, missing parameters)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (permission denied)
- 404: Not Found (character not found)
- 409: Conflict (duplicate character names, etc.)
- 500: Internal Server Error (unexpected errors)

## Design Philosophy

### Simplicity

- Single APIView instead of complex ViewSets
- Direct method routing instead of action decorators
- Essential functionality only

### Validation Delegation

- CharacterManager handles all validation
- Splat filter validation in CharacterManager
- Permission checks in CharacterManager
- Business rules in CharacterManager

### Public API Focus

- Only operations needed for public use
- No internal/admin functionality
- Sheet data only (tracker data via Gateway)
- No utility endpoints (stats/disciplines in /bot/)

### Error Handling

- All exceptions logged appropriately
- CharacterManagerException properly handled
- Consistent error response format
- Proper HTTP status codes

## Integration

The views are fully integrated with the existing Haven architecture:

- Uses existing CharacterManager for all operations
- Respects authentication system
- Follows existing error handling patterns
- Uses existing serializers through CharacterManager
- Maintains data consistency and business rules

This implementation provides a clean, simple REST API for character management that follows the principle of delegating all business logic to the CharacterManager while providing only the essential public functionality needed.
