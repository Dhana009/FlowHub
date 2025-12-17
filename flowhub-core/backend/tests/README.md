# Flow 2 Item Creation - Test Suite

## Overview

Comprehensive test suite for Flow 2: Item Creation, covering all 5 validation layers, error precedence, adaptive prefix matching, two-phase commit file uploads, race conditions, and performance requirements.

## Test Structure

```
tests/
├── unit/
│   └── services/
│       ├── validationService.test.js    # 5-layer validation tests
│       ├── itemService.test.js          # Business logic & two-phase commit
│       ├── fileService.test.js          # File upload & rollback
│       └── categoryService.test.js      # Category normalization
├── integration/
│   ├── itemRoutes.test.js               # Full API endpoint tests
│   ├── error-precedence.test.js         # Error precedence chain
│   ├── adaptive-prefix-matching.test.js # Short name matching
│   ├── race-conditions.test.js          # Concurrent requests
│   └── performance.test.js              # Response time & load tests
├── helpers/
│   ├── dbHelper.js                       # MongoDB Memory Server setup
│   ├── testUtils.js                      # Test utilities
│   └── mockData.js                      # Mock data generators
└── fixtures/
    └── items.json                       # Test data fixtures
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Coverage Goals

- **Global Coverage**: 80% (branches, functions, lines, statements)
- **Services Coverage**: 85% (critical business logic)

## Key Test Scenarios

### 1. Validation Layers (5-Layer Sequential)
- ✅ Layer 1: Authentication (401)
- ✅ Layer 2: Schema Validation (422)
- ✅ Layer 3: File Validation (413/415)
- ✅ Layer 4: Business Rules (400)
- ✅ Layer 5: Duplicate Detection (409)

### 2. Error Precedence
Tests that errors are returned in correct order:
- 401 > 422 > 413 > 415 > 400 > 409

### 3. Adaptive Prefix Matching
- Names < 3 chars: Full name match
- Names 3-4 chars: 2-3 char prefix
- Names >= 5 chars: 4 char prefix

### 4. Two-Phase Commit File Upload
- Phase 1: Upload to temp location
- Phase 2: Move to permanent after item creation
- Rollback: Clean up temp files on failure

### 5. Race Conditions
- Concurrent duplicate item creation
- Database transaction integrity
- Unique index enforcement

### 6. Performance
- Response time < 1000ms for simple items
- Concurrent load handling (10+ requests)
- Memory leak prevention

## Test Data

### Mock Data Generators
- `generateMockUser()` - Creates test users
- `generateMockItem()` - Creates test items
- `generateAuthToken()` - Creates JWT tokens
- `createMockFile()` - Creates file buffers
- `createLargeFile()` - Creates files >5MB
- `createInvalidFile()` - Creates invalid file types

### Fixtures
- `items.json` - Predefined test item data

## Database Setup

Tests use **MongoDB Memory Server** for isolated, in-memory database testing:
- No external MongoDB required
- Automatic cleanup after tests
- Fast test execution

## Writing New Tests

### Unit Test Template
```javascript
describe('ServiceName - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should do something', async () => {
    // Arrange
    const input = { ... };
    
    // Act
    const result = await service.method(input);
    
    // Assert
    expect(result).toMatchObject({ ... });
  });
});
```

### Integration Test Template
```javascript
describe('API Endpoint Tests', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    await setupTestDB();
    testUser = await generateMockUser();
    authToken = generateAuthToken(testUser);
  });

  afterAll(async () => {
    await cleanupTestDB();
  });

  test('should handle request', async () => {
    const response = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${authToken}`)
      .send(itemData)
      .expect(201);
  });
});
```

## Debugging Tests

### Run Single Test File
```bash
npm test -- itemService.test.js
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="should create item"
```

### Enable Debug Logging
```bash
DEBUG=1 npm test
```

## CI/CD Integration

Tests are designed to run in CI/CD pipelines:
- No external dependencies
- Fast execution (< 30s for full suite)
- Coverage reporting
- Exit codes for failure detection

## Notes

- All tests use isolated database instances
- File uploads use memory storage in tests
- Authentication tokens are auto-generated
- Test data is cleaned up automatically
