import { TestUtils } from './helpers/test-utils';

export const testSetup = () => {
  process.env.NODE_ENV = 'test';

  const mockLogger = TestUtils.createMockLogger();

  return { mockLogger };
};

export const testTeardown = () => {
  delete process.env.NODE_ENV;
};

export default {
  'setup': testSetup,
  'teardown': testTeardown,
};
