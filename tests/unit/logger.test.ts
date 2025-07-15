import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

describe('Logger', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    if (originalEnv) {
      process.env.NODE_ENV = originalEnv;
    } else {
      delete process.env.NODE_ENV;
    }

    delete require.cache[require.resolve('../../src/utils/logger')];
  });

  it('should create a logger instance', async () => {
    const { 'default': logger } = await import('../../src/utils/logger');

    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('should handle different log levels', async () => {
    const { 'default': logger } = await import('../../src/utils/logger');

    expect(() => {
      logger.info('Test info message');
      logger.error('Test error message');
      logger.warn('Test warning message');
      logger.debug('Test debug message');
    }).not.toThrow();
  });

  it('should handle object logging', async () => {
    const { 'default': logger } = await import('../../src/utils/logger');

    const testObject = {
      'key': 'value',
      'number': 42,
      'nested': {
        'prop': 'test',
      },
    };

    expect(() => {
      logger.info(testObject, 'Test object message');
    }).not.toThrow();
  });

  it('should handle error objects', async () => {
    const { 'default': logger } = await import('../../src/utils/logger');

    const testError = new Error('Test error');

    expect(() => {
      logger.error(testError, 'Test error logging');
    }).not.toThrow();
  });

  it('should work in production environment', async () => {
    process.env.NODE_ENV = 'production';

    const { 'default': logger } = await import('../../src/utils/logger');

    expect(() => {
      logger.info('Production test message');
    }).not.toThrow();
  });

  it('should work in development environment', async () => {
    process.env.NODE_ENV = 'development';

    const { 'default': logger } = await import('../../src/utils/logger');

    expect(() => {
      logger.info('Development test message');
    }).not.toThrow();
  });
});
