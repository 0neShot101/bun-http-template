# Bun HTTP Template

A modern, type-safe HTTP server template built with Bun, TypeScript, and custom routing architecture.

## Features

- 🚀 **Bun Runtime** - Fast, modern JavaScript runtime with built-in bundler and test runner
- 📁 **File-based Routing** - Automatic route discovery and registration
- 🛡️ **Type Safety** - Full TypeScript support with strict type checking
- 🔧 **Middleware Support** - Composable middleware system with route-level configuration
- 📊 **Structured Logging** - Production-ready logging with Pino
- 🐳 **Docker Ready** - Containerized deployment with multi-stage builds
- 🧪 **Comprehensive Testing** - Unit and integration tests with Bun's test runner
- 🔍 **Code Quality** - ESLint, Prettier, and TypeScript configuration
- ⚡ **Hot Reload** - Development server with automatic restart

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0
- Node.js >= 18 (for some development tools)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd bun-http-template

# Install dependencies
bun install

# Start development server
bun run dev
```

The server will start on `http://localhost:3000` with hot reload enabled.

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server with hot reload |
| `bun run build` | Build the application for production |
| `bun run start` | Start the production server |
| `bun run test` | Run all tests |
| `bun run test:watch` | Run tests in watch mode |
| `bun run test:coverage` | Run tests with coverage report |
| `bun run lint` | Run ESLint |
| `bun run lint:fix` | Run ESLint and fix issues |
| `bun run format` | Format code with Prettier |
| `bun run type-check` | Run TypeScript type checking |
| `bun run docker:build` | Build Docker image |
| `bun run docker:run` | Run Docker container |

## Project Structure

```
src/
├── index.ts              # Application entry point
├── http.ts              # HTTP server setup and route loading
├── middleware/          # Middleware functions
│   └── logging.ts       # Request logging middleware
├── routes/             # File-based routes
│   └── index.ts        # Root route handler
├── structures/         # Core classes and builders
│   └── RouteBuilder.ts # Route definition and middleware builder
├── types/              # TypeScript type definitions
│   ├── routing.ts      # Route and middleware types
│   └── server.ts       # Server configuration types
└── utils/              # Utility functions
    ├── logger.ts       # Logging configuration
    └── walkDirectory.ts # File system utilities

tests/                  # Test suite
├── unit/              # Unit tests
├── integration/       # Integration tests
├── helpers/           # Test utilities
├── fixtures/          # Test data and mocks
└── setup.ts           # Test configuration
```

## Routing

This template uses a file-based routing system where each file in the `src/routes/` directory automatically becomes a route.

### Creating Routes

Create a new file in `src/routes/` and export a `RouteBuilder` instance:

```typescript
// src/routes/users.ts
import RouteBuilder from '@structures/RouteBuilder';

export default new RouteBuilder()
  .on('get', async (req) => {
    return Response.json({ users: [] });
  })
  .on('post', async (req) => {
    const body = await req.json();
    return Response.json({ created: body });
  });
```

### Route Parameters

Use underscores in filenames to create parameterized routes:

- `src/routes/users/_id.ts` → `/users/:id`
- `src/routes/posts/_slug/comments.ts` → `/posts/:slug/comments`

### Middleware

Apply middleware per route or per HTTP method:

```typescript
import RouteBuilder from '@structures/RouteBuilder';
import authMiddleware from '@middleware/auth';
import validation from '@middleware/validation';

export default new RouteBuilder({
  // Apply to all methods
  '*': [authMiddleware],
  // Apply only to POST
  'post': validation
}).on('get', async (req) => {
  // Handler code
});
```

## Testing

The project includes a comprehensive test suite using Bun's built-in test runner.

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/unit/RouteBuilder.test.ts

# Run tests with coverage
bun test --coverage

# Watch mode for development
bun test --watch
```

### Test Structure

- **Unit Tests** - Test individual components in isolation
- **Integration Tests** - Test the complete HTTP server functionality
- **Test Helpers** - Utilities for creating requests, assertions, and mocks
- **Fixtures** - Sample data and configurations for testing

### Writing Tests

```typescript
import { describe, expect, it } from 'bun:test';

describe('Component', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

## Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
```

## Docker

### Build and Run

```bash
# Build the image
bun run docker:build

# Run the container
bun run docker:run
```

## Development

### Code Quality

This project enforces code quality through:

- **TypeScript** - Static type checking
- **ESLint** - Code linting with TypeScript rules
- **Prettier** - Code formatting
- **Bun Test** - Unit and integration testing

### Pre-commit Hooks

Run quality checks before committing:

```bash
bun run lint:fix
bun run format
bun run type-check
bun run test
```

## API Endpoints

### Health Checks

- `GET /health` - Basic health check
- `GET /health/ready` - Readiness probe

### Default Routes

- `GET /` - Hello world endpoint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.