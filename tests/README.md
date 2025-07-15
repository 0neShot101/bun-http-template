# Tests

This directory contains the test suite for the Bun HTTP template project.

## Structure

- `unit/` - Unit tests for individual components
- `integration/` - Integration tests for the full HTTP server
- `helpers/` - Test utilities and helper functions
- `fixtures/` - Test data and mock responses
- `setup.ts` - Global test configuration

## Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage

# Run specific test file
bun test tests/unit/RouteBuilder.test.ts

# Run tests matching a pattern
bun test --grep "RouteBuilder"
```

## Test Categories

### Unit Tests
- `RouteBuilder.test.ts` - Tests for the route builder class
- `logger.test.ts` - Tests for the logging utility
- `middleware.test.ts` - Tests for middleware functions
- `walkDirectory.test.ts` - Tests for file system utilities

### Integration Tests
- `server.test.ts` - End-to-end server testing

## Test Helpers

The `TestUtils` class provides common testing utilities:
- `createRequest()` - Creates test HTTP requests
- `waitForServer()` - Waits for server to be ready
- `assertResponse()` - Validates HTTP responses
- `createMockLogger()` - Creates mock logger for testing
- `createTempDir()` - Creates temporary directories for tests

## Writing Tests

When writing new tests:

1. Use descriptive test names
2. Group related tests with `describe()` blocks
3. Use appropriate assertions from Bun's test framework
4. Clean up resources in `afterEach()` or `afterAll()` hooks
5. Use the test helpers for common operations

Example test structure:

```typescript
import { describe, expect, it, beforeEach } from 'bun:test';

describe('Component Name', () => {
  beforeEach(() => {
    // Setup code
  });

  describe('method or feature', () => {
    it('should do something specific', () => {
      // Test implementation
      expect(actual).toBe(expected);
    });
  });
});
```
