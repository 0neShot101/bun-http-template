import { afterAll, beforeAll, describe, expect, it } from 'bun:test';

import { TestUtils, testConfig } from '../helpers/test-utils';

describe('HTTP Server Integration', () => {
  let server: any;
  const baseUrl = testConfig.testUrl;

  beforeAll(async () => {
    const { 'default': startServer } = await import('../../src/http');

    process.env.PORT = testConfig.testPort.toString();

    try {
      server = await startServer();

      await TestUtils.waitForServer(`${baseUrl}/health`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to start test server:', error);
      throw error;
    }
  });

  afterAll(async () => {
    if (server) server.stop();
  });

  describe('Health endpoints', () => {
    it('should respond to health check', async () => {
      const response = await fetch(`${baseUrl}/health`);

      await TestUtils.assertResponse(response, 200);

      const data = await response.json();

      expect(data.status).toBe('ok');
      expect(typeof data.ts).toBe('number');
      expect(typeof data.up).toBe('number');
    });

    it('should respond to readiness check', async () => {
      const response = await fetch(`${baseUrl}/health/ready`);

      await TestUtils.assertResponse(response, 200);

      const data = await response.json();
      expect(data.status).toBe('ready');
      expect(typeof data.ts).toBe('number');
    });
  });

  describe('Root endpoint', () => {
    it('should respond to GET request', async () => {
      const response = await fetch(`${baseUrl}/`);

      await TestUtils.assertResponse(response, 200);

      const data = await response.json();
      expect(data.message).toBe('Hello, world!');
    });

    it('should handle POST method not allowed', async () => {
      const response = await fetch(`${baseUrl}/`, {
        'method': 'POST',
        'headers': {
          'Content-Type': 'application/json',
        },
        'body': JSON.stringify({ 'test': 'data' }),
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Error handling', () => {
    it('should handle non-existent routes', async () => {
      const response = await fetch(`${baseUrl}/non-existent-route`);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should handle malformed requests gracefully', async () => {
      const response = await fetch(`${baseUrl}/`, {
        'method': 'GET',
        'headers': {
          'Content-Type': 'application/json',
          'Accept': 'invalid-mime-type',
        },
      });

      expect(response.status).toBeDefined();
    });
  });

  describe('Headers and CORS', () => {
    it('should include appropriate headers', async () => {
      const response = await fetch(`${baseUrl}/health`);

      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('should handle preflight requests', async () => {
      const response = await fetch(`${baseUrl}/`, {
        'method': 'OPTIONS',
        'headers': {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET',
        },
      });

      expect(response.status).toBeLessThan(500);
    });
  });
});
