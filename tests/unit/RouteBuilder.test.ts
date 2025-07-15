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

  describe('HTTP method handlers', () => {
    it('should register GET handler', () => {
      const handler = async () => new Response('GET response');

      builder.on('get', handler);

      const routes = builder.build();
      expect(typeof routes).toBe('object');
      expect(typeof routes.GET).toBe('function');
    });

    it('should register POST handler', () => {
      const handler = async () => new Response('POST response');

      builder.on('post', handler);

      const routes = builder.build();
      expect(typeof routes.POST).toBe('function');
    });
  });

  describe('multiple handlers', () => {
    it('should register multiple HTTP method handlers', () => {
      const getHandler = async () => new Response('GET response');
      const postHandler = async () => new Response('POST response');

      builder.on('get', getHandler);
      builder.on('post', postHandler);

      const routes = builder.build();
      expect(typeof routes.GET).toBe('function');
      expect(typeof routes.POST).toBe('function');
    });
  });

  describe('middleware integration', () => {
    it('should apply middleware to handlers', async () => {
      let middlewareCalled = false;
      const middleware = () => {
        middlewareCalled = true;
      };

      const handler = async () => new Response('Response with middleware');

      const builderWithMiddleware = new RouteBuilder({ 'get': middleware });
      builderWithMiddleware.on('get', handler);

      const routes = builderWithMiddleware.build();
      const mockRequest = new Request('http://localhost/test') as any;
      const mockServer = {} as any;

      await routes.GET(mockRequest, mockServer);
      expect(middlewareCalled).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle no handlers gracefully', () => {
      const routes = builder.build();

      expect(typeof routes).toBe('object');
      expect(Object.keys(routes)).toHaveLength(0);
    });
  });
});
