import { describe, expect, it } from 'bun:test';

describe('Logging Middleware', () => {
  it('should import without errors', async () => {
    const { 'default': loggingMiddleware } = await import('../../src/middleware/logging');

    expect(loggingMiddleware).toBeDefined();
    expect(typeof loggingMiddleware).toBe('function');
  });

  it('should accept request and server parameters', async () => {
    const { 'default': loggingMiddleware } = await import('../../src/middleware/logging');

    const mockRequest = new Request('http://localhost/test') as any;
    const mockServer = {} as any;

    expect(() => {
      loggingMiddleware(mockRequest, mockServer);
    }).not.toThrow();
  });
});
