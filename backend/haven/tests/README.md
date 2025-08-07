# Haven App Testing Documentation

## Overview

This document describes the comprehensive test suite for the Haven character management app. The tests ensure that our API endpoints, CharacterManager service, and serializers work correctly and handle edge cases properly.

## Test Structure

```
haven/tests/
├── __init__.py                 # Test package initialization
├── test_base.py               # Base test utilities and fixtures
├── test_views.py              # API endpoint tests
├── test_character_manager.py  # CharacterManager service tests
├── test_serializers.py        # Serializer validation tests
└── run_tests.py              # Test runner script
```

## Test Categories

### 1. API Endpoint Tests (`test_views.py`)

**Purpose**: Test the CharacterView API endpoints for proper HTTP behavior, authentication, and error handling.

**Test Coverage**:

- ✅ Authentication required for all endpoints
- ✅ GET character by ID (success and failure cases)
- ✅ POST character creation (validation and success)
- ✅ PUT character updates (authorization and validation)
- ✅ DELETE character removal (authorization and cleanup)
- ✅ Error response formatting
- ✅ Permission enforcement (users can't access other users' characters)
- ✅ Chronicle association handling
- ✅ Content type handling (JSON and form data)

**Key Test Methods**:

- `test_authentication_required()` - Ensures all endpoints require auth
- `test_get_character_success()` - Valid character retrieval
- `test_get_character_without_id_fails()` - ID required for GET
- `test_create_character_success()` - Valid character creation
- `test_create_character_missing_name()` - Name validation
- `test_update_character_success()` - Character updates
- `test_delete_character_success()` - Character deletion
- `test_get_other_users_character_fails()` - Permission enforcement

### 2. CharacterManager Tests (`test_character_manager.py`)

**Purpose**: Test the business logic layer that handles all character operations.

**Test Coverage**:

- ✅ Character creation with validation
- ✅ Name and splat requirement validation
- ✅ Character retrieval by ID and user
- ✅ Character updates and deletion
- ✅ Permission enforcement
- ✅ Chronicle association handling
- ✅ Character limit enforcement
- ✅ Duplicate name validation
- ✅ Splat filtering functionality

**Key Test Methods**:

- `test_create_character_success()` - Valid character creation
- `test_create_character_missing_name()` - Name validation
- `test_create_character_invalid_splat()` - Splat validation
- `test_get_character_by_id_success()` - Character retrieval
- `test_update_character_success()` - Character updates
- `test_delete_character_success()` - Character deletion
- `test_create_character_with_chronicle()` - Chronicle association
- `test_create_character_limit_exceeded()` - Character limits

### 3. Serializer Tests (`test_serializers.py`)

**Purpose**: Test data validation, transformation, and serialization for different character types.

**Test Coverage**:

- ✅ Valid data serialization for Human5th and Vampire5th
- ✅ Required field validation
- ✅ Field value range validation
- ✅ Sheet and tracker serializer output
- ✅ Serializer registry completeness
- ✅ Context handling (user, chronicle, member)
- ✅ Character creation and updates via serializers
- ✅ Optional field handling

**Key Test Methods**:

- `test_human5th_serializer_valid_data()` - Human character validation
- `test_vampire5th_serializer_valid_data()` - Vampire character validation
- `test_serializer_missing_required_fields()` - Required field validation
- `test_serializer_invalid_field_values()` - Value range validation
- `test_sheet_serializer_output()` - Sheet data format
- `test_serializer_registry_all_splats()` - Registry completeness
- `test_serializer_field_validation_ranges()` - Range validation

### 4. Base Test Utilities (`test_base.py`)

**Purpose**: Provide common test utilities, fixtures, and helper methods.

**Features**:

- `HavenTestCase` - Base test case with common fixtures
- `HavenAPITestCase` - API test case with authentication setup
- Helper methods for creating test users, chronicles, and members
- `get_valid_character_data()` - Generate valid test character data
- Authentication management for API tests

## Running Tests

### Run All Haven Tests

```bash
cd backend
python manage.py test haven.tests
```

### Run Specific Test Files

```bash
# API endpoint tests only
python manage.py test haven.tests.test_views

# CharacterManager tests only
python manage.py test haven.tests.test_character_manager

# Serializer tests only
python manage.py test haven.tests.test_serializers
```

### Run Specific Test Methods

```bash
# Run a specific test method
python manage.py test haven.tests.test_views.CharacterViewTestCase.test_create_character_success
```

### Using the Custom Test Runner

```bash
cd backend/haven/tests
python run_tests.py
```

## Test Data and Fixtures

### User Fixtures

- `self.user` - Primary test user
- `self.other_user` - Secondary user for permission testing

### Chronicle Fixtures

- `self.chronicle` - Test chronicle owned by primary user
- `self.member` - Primary user's membership in test chronicle

### Character Data

- `get_valid_character_data()` - Generates valid character data with customizable fields
- Default splat: `human5th`
- Default name: `"Test Character"`
- Includes basic profile fields: age, appearance, history

## Test Validation Areas

### 1. Authentication & Authorization

- All endpoints require authentication
- Users can only access their own characters
- Chronicle membership validation
- Permission checks for all operations

### 2. Data Validation

- Required fields (name, splat)
- Field value ranges (humanity 0-10, etc.)
- Splat validation against enum values
- Empty/whitespace validation

### 3. Business Logic

- Character creation limits
- Duplicate name prevention (per user)
- Chronicle association handling
- Character sheet vs tracker data

### 4. Error Handling

- Proper HTTP status codes
- Consistent error response format
- Detailed error messages for validation failures
- Graceful handling of not found scenarios

### 5. Database Operations

- Proper character creation/updates/deletion
- Foreign key relationships (user, chronicle, member)
- Transaction handling
- Data consistency

## Coverage Goals

- **API Endpoints**: 100% of HTTP methods and status codes
- **CharacterManager**: All public methods and error conditions
- **Serializers**: All character types and validation rules
- **Error Handling**: All exception types and edge cases
- **Permissions**: All authorization scenarios

## Best Practices Implemented

1. **Isolated Tests**: Each test is independent and doesn't rely on others
2. **Comprehensive Fixtures**: Reusable test data setup
3. **Permission Testing**: Thorough authorization checking
4. **Error Case Coverage**: Testing both success and failure scenarios
5. **Database Cleanup**: Proper test isolation and cleanup
6. **Type Safety**: Proper type hints and error handling
7. **Documentation**: Clear test descriptions and coverage documentation

## Integration with CI/CD

These tests are designed to be run in continuous integration environments:

- No external dependencies required
- Uses Django's built-in test database
- Fast execution with minimal setup
- Clear pass/fail indicators
- Detailed error reporting

## Maintenance

When adding new features:

1. **New API Endpoints**: Add tests to `test_views.py`
2. **New CharacterManager Methods**: Add tests to `test_character_manager.py`
3. **New Character Types**: Add serializer tests to `test_serializers.py`
4. **New Validation Rules**: Update relevant test files

When modifying existing features:

1. Update existing tests to match new behavior
2. Add regression tests for bugs found
3. Ensure all tests pass before merging changes

## 🚀 **Usage Instructions**

### Run All Haven Tests

```bash
cd backend
python manage.py test haven.tests --verbosity=2
```

### Run Individual Test Files

```bash
python manage.py test haven.tests.test_views
python manage.py test haven.tests.test_character_manager
python manage.py test haven.tests.test_serializers
```

### Run Specific Test Methods

```bash
python manage.py test haven.tests.test_views.CharacterViewTestCase.test_create_character_success
```

## 📋 **Prerequisites**

Before running tests, ensure:

1. Django environment is properly configured
2. Database is accessible for test database creation
3. All haven app dependencies are installed
4. Django settings are configured for testing

## 🔧 **Test Environment Setup**

The tests use Django's built-in testing framework with:

- Isolated test database
- Automatic fixture creation and cleanup
- Authentication token handling
- Chronicle and membership setup
- Character data generation utilities
