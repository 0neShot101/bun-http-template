# Bun HTTP Template

A modern, type-safe HTTP server template built with Bun, TypeScript, Zod schema validation, and custom routing architecture.

## Features

- 🚀 **Bun Runtime** - Fast, modern JavaScript runtime with built-in bundler and test runner
- 📁 **File-based Routing** - Automatic route discovery and registration
- 🛡️ **Type Safety** - Full TypeScript support with strict type checking
- ✅ **Schema Validation** - Runtime request validation with Zod and automatic type inference
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

### Key Dependencies

- **Bun** - JavaScript runtime and package manager
- **TypeScript** - Static type checking
- **Zod** - Schema validation and type inference
- **Pino** - Fast, low overhead logging
- **@3xpo/events** - Type-safe event emitter

### Installation

```bash
# Clone the repository
git clone https://github.com/0neShot101/bun-http-template.git
cd bun-http-template

# Install dependencies
bun install

# Start development server
bun run dev
```

The server will start on `http://localhost:3000` with hot reload enabled.

### Quick Example

Create a new route with schema validation:

```typescript
// src/routes/example.ts
import RouteBuilder from '@structures/RouteBuilder';

export default new RouteBuilder()
  .schema('post', (z) => ({
    body: z.object({
      message: z.string().min(1),
      priority: z.enum(['low', 'medium', 'high']).default('medium')
    })
  }))
  .on('post', async (req) => {
    // req.body is fully typed!
    const { message, priority } = req.body;
    return Response.json({ 
      received: message, 
      priority,
      timestamp: new Date().toISOString()
    });
  });
```

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
│   ├── schema.ts       # Schema validation types
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

### Schema Validation

Use Zod schemas to validate incoming requests with full type safety:

```typescript
// src/routes/users.ts
import RouteBuilder from '@structures/RouteBuilder';

const createUserSchema = {
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().min(18)
  }),
  query: z.object({
    source: z.string().optional()
  })
};

export default new RouteBuilder()
  .schema('post', (z) => createUserSchema)
  .on('post', async (req) => {
    // req.body and req.query are now fully typed!
    const { name, email, age } = req.body; // TypeScript knows these types
    const { source } = req.query;
    
    return Response.json({ 
      created: { name, email, age },
      source: source || 'direct'
    });
  });
```

**Validation Features:**
- **Body Validation** - Validate JSON request bodies
- **Query Parameters** - Validate URL query parameters  
- **Headers** - Validate request headers
- **Automatic Errors** - Returns 400 with detailed error messages
- **Type Safety** - Full TypeScript inference for validated data

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
})
.schema('post', (z) => ({
  body: z.object({
    title: z.string(),
    content: z.string()
  })
}))
.on('get', async (req) => {
  // Handler code
})
.on('post', async (req) => {
  // req.body is typed as { title: string, content: string }
  const { title, content } = req.body;
  return Response.json({ created: { title, content } });
});
```

**Middleware runs in this order:**
1. Route-level middleware (from constructor)
2. Schema validation middleware (automatically added)
3. Route handler

## Schema Validation

The template includes powerful runtime validation using [Zod](https://zod.dev/) with full TypeScript integration.

### Defining Schemas

Define validation schemas for any HTTP method using the `schema()` method:

```typescript
import RouteBuilder from '@structures/RouteBuilder';

export default new RouteBuilder()
  .schema('post', (z) => ({
    // Validate request body
    body: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      age: z.number().min(18).max(120)
    }),
    // Validate query parameters
    query: z.object({
      includeProfile: z.boolean().optional(),
      format: z.enum(['json', 'xml']).default('json')
    }),
    // Validate headers
    headers: z.object({
      'x-api-key': z.string().min(10)
    })
  }))
  .on('post', async (req) => {
    // All validated data is now available with full type safety
    const { name, email, age } = req.body;
    const { includeProfile, format } = req.query;
    const apiKey = req.headers['x-api-key'];
    
    return Response.json({ success: true });
  });
```

### Validation Features

- **Automatic Type Inference** - Request objects are automatically typed based on schemas
- **Runtime Validation** - Invalid requests return 400 with detailed error messages
- **Multiple Parts** - Validate body, query parameters, and headers independently
- **Zod Integration** - Use any Zod validation features (transforms, refinements, etc.)
- **Error Handling** - Graceful error responses with validation details

### Advanced Schema Usage

```typescript
// Complex validation with transforms and custom validations
.schema('post', (z) => ({
  body: z.object({
    email: z.string().email().transform(val => val.toLowerCase()),
    tags: z.array(z.string()).min(1).max(5),
    metadata: z.record(z.string(), z.any()).optional(),
    publishedAt: z.string().datetime().transform(val => new Date(val))
  }).refine(data => {
    // Custom validation logic
    return data.tags.every(tag => tag.length > 0);
  }, { message: "Tags cannot be empty" })
}))
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
