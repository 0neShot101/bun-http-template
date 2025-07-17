import { beforeEach, describe, expect, it } from 'bun:test';

import RouteBuilder from '../../src/structures/RouteBuilder';

describe('RouteBuilder', () => {
  let builder: RouteBuilder;

  beforeEach(() => {
    builder = new RouteBuilder();
  });

  describe('constructor', () => {
    it('should create a new RouteBuilder instance', () => {
      expect(builder).toBeInstanceOf(RouteBuilder);
    });

    it('should accept middleware configuration', () => {
      const middleware = () => {};
      const builderWithMiddleware = new RouteBuilder({ 'get': middleware });

      expect(builderWithMiddleware).toBeInstanceOf(RouteBuilder);
    });
  });

  describe('schema validation', () => {
    it('should define body schema validation', () => {
      const builderWithSchema = builder.schema('post', zod => ({
        'body': zod.object({
          'name': zod.string(),
          'age': zod.number(),
        }),
      }));

      expect(builderWithSchema).toBeInstanceOf(RouteBuilder);
    });

    it('should throw error when defining schemas twice for same method', () => {
      builder.schema('post', zod => ({
        'body': zod.object({ 'name': zod.string() }),
      }));

      expect(() => {
        builder.schema('post', zod => ({
          'body': zod.object({ 'email': zod.string() }),
        }));
      }).toThrow('Schemas for POST already defined.');
    });
  });

  describe('HTTP method handlers', () => {
    it('should register GET handler', () => {
      const handler = async () => new Response('GET response');
      builder.on('get', handler);

      const routes = builder.build();
      expect(typeof routes).toBe('object');
      expect(Object.keys(routes)).toContain('GET');
    });

    it('should register POST handler with schema', () => {
      const builderWithSchema = builder
        .schema('post', zod => ({
          'body': zod.object({
            'name': zod.string(),
            'email': zod.string().email(),
          }),
        }))
        .on('post', async (req: any) => {
          return Response.json({ 'created': req.body });
        });

      const routes = builderWithSchema.build();
      expect(Object.keys(routes)).toContain('POST');
    });

    it('should throw error when registering handler twice for same method', () => {
      const handler1 = async () => new Response('First');
      const handler2 = async () => new Response('Second');

      builder.on('get', handler1);

      expect(() => {
        builder.on('get', handler2);
      }).toThrow('Handler for GET already defined.');
    });
  });

  describe('schema validation middleware', () => {
    it('should validate request body and return 400 for invalid data', async () => {
      const builderWithSchema = builder
        .schema('post', zod => ({
          'body': zod.object({
            'name': zod.string(),
            'age': zod.number(),
          }),
        }))
        .on('post', async () => new Response('Success'));

      const routes = builderWithSchema.build();

      // Create a mock request with invalid body
      const mockRequest = {
        'url': 'http://localhost/test',
        'method': 'POST',
        'json': async () => ({ 'name': 'John', 'age': 'not-a-number' }),
        'headers': new Map(),
      } as any;

      const mockServer = {} as any;
      const response = await (routes as any).POST(mockRequest, mockServer);

      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData.error).toBe('Body validation failed');
      expect(responseData.issues).toBeDefined();
    });

    it('should handle invalid JSON in request body', async () => {
      const builderWithSchema = builder
        .schema('post', zod => ({
          'body': zod.object({
            'name': zod.string(),
          }),
        }))
        .on('post', async () => new Response('Success'));

      const routes = builderWithSchema.build();

      // Create a mock request with invalid JSON
      const mockRequest = {
        'url': 'http://localhost/test',
        'method': 'POST',
        'json': async () => {
          throw new Error('Invalid JSON in request body');
        },
        'headers': new Map(),
      } as any;

      const mockServer = {} as any;
      const response = await (routes as any).POST(mockRequest, mockServer);

      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData.error).toBe('Invalid JSON in request body');
    });

    it('should pass validation and call handler with valid data', async () => {
      let receivedData: any = null;

      const builderWithSchema = builder
        .schema('post', zod => ({
          'body': zod.object({
            'name': zod.string(),
            'age': zod.number(),
          }),
        }))
        .on('post', async (req: any) => {
          receivedData = req.body;
          return Response.json({ 'success': true });
        });

      const routes = builderWithSchema.build();

      // Create a mock request with valid data
      const validData = { 'name': 'John Doe', 'age': 30 };
      const mockRequest = {
        'url': 'http://localhost/test',
        'method': 'POST',
        'json': async () => validData,
        'headers': new Map(),
      } as any;

      const mockServer = {} as any;
      const response = await (routes as any).POST(mockRequest, mockServer);

      expect(response.status).toBe(200);
      expect(receivedData).toEqual(validData);
    });

    it('should validate query parameters', async () => {
      const builderWithSchema = builder
        .schema('get', zod => ({
          'query': zod.object({
            'limit': zod.string().transform(Number),
            'page': zod.string().transform(Number),
          }),
        }))
        .on('get', async (req: any) => Response.json({ 'query': req.query }));

      const routes = builderWithSchema.build();

      // Create a mock request with valid query params
      const mockRequest = {
        'url': 'http://localhost/test?limit=10&page=1',
        'method': 'GET',
        'headers': new Map(),
        'json': async () => ({}),
      } as any;

      const mockServer = {} as any;
      const response = await (routes as any).GET(mockRequest, mockServer);

      expect(response.status).toBe(200);
      const responseData = await response.json();
      expect(responseData.query.limit).toBe(10);
      expect(responseData.query.page).toBe(1);
    });
  });

  describe('middleware integration', () => {
    it('should apply custom middleware before schema validation', async () => {
      let middlewareCalled = false;
      const customMiddleware = () => {
        middlewareCalled = true;
      };

      const builderWithMiddleware = new RouteBuilder({ 'post': customMiddleware })
        .schema('post', zod => ({
          'body': zod.object({
            'name': zod.string(),
          }),
        }))
        .on('post', async () => new Response('Success'));

      const routes = builderWithMiddleware.build();
      const mockRequest = {
        'url': 'http://localhost/test',
        'method': 'POST',
        'json': async () => ({ 'name': 'John' }),
        'headers': new Map(),
      } as any;
      const mockServer = {} as any;

      await (routes as any).POST(mockRequest, mockServer);
      expect(middlewareCalled).toBe(true);
    });

    it('should handle middleware that returns early response', async () => {
      const authMiddleware = () => new Response('Unauthorized', { 'status': 401 });

      const builderWithMiddleware = new RouteBuilder({ 'post': authMiddleware })
        .schema('post', zod => ({
          'body': zod.object({
            'name': zod.string(),
          }),
        }))
        .on('post', async () => new Response('Success'));

      const routes = builderWithMiddleware.build();
      const mockRequest = {
        'url': 'http://localhost/test',
        'method': 'POST',
        'json': async () => ({ 'name': 'John' }),
        'headers': new Map(),
      } as any;
      const mockServer = {} as any;

      const response = await (routes as any).POST(mockRequest, mockServer);
      expect(response.status).toBe(401);
      expect(await response.text()).toBe('Unauthorized');
    });
  });

  describe('edge cases', () => {
    it('should handle no handlers gracefully', () => {
      const routes = builder.build();
      expect(typeof routes).toBe('object');
      expect(Object.keys(routes)).toHaveLength(0);
    });

    it('should handle schema validation errors gracefully', async () => {
      const builderWithSchema = builder
        .schema('post', zod => ({
          'body': zod.object({
            'name': zod.string(),
          }),
        }))
        .on('post', async () => new Response('Success'));

      const routes = builderWithSchema.build();

      // Create a mock request that will cause a validation error
      const mockRequest = {
        'url': 'http://localhost/test',
        'method': 'POST',
        'json': async () => {
          throw new Error('Some unexpected error');
        },
        'headers': new Map(),
      } as any;

      const mockServer = {} as any;
      const response = await (routes as any).POST(mockRequest, mockServer);

      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData.error).toBe('Invalid JSON in request body');
    });

    it('should handle routes without schemas', async () => {
      const builderWithoutSchema = builder.on('get', async () => {
        return Response.json({ 'message': 'No validation' });
      });

      const routes = builderWithoutSchema.build();

      const mockRequest = {
        'url': 'http://localhost/test',
        'method': 'GET',
        'headers': new Map(),
        'json': async () => ({}),
      } as any;

      const mockServer = {} as any;
      const response = await (routes as any).GET(mockRequest, mockServer);

      expect(response.status).toBe(200);
      const responseData = await response.json();
      expect(responseData.message).toBe('No validation');
    });
  });
});
