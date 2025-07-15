import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { setTimeout } from 'timers/promises';

export interface Logger {
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
  debug(...args: unknown[]): void;
  trace(...args: unknown[]): void;
}

export class TestUtils {
  /**
   * Creates a Request with default JSON headers.
   */
  static createRequest(url: string, options: any = {}): Request {
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'bun-test',
    };

    const headers = new Headers(defaultHeaders);

    if (options.headers) for (const [k, v] of Object.entries(options.headers)) headers.set(k, v as string);

    return new Request(url, { ...options, headers });
  }

  /**
   * Polls `url` until it responds OK or `timeout` elapses.
   * Rejects on timeout.
   */
  static async waitForServer(url: string, timeout = 5_000, interval = 100): Promise<void> {
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
      try {
        const res = await fetch(url);

        if (res.ok) return;
      } catch {
        // ignore, retry
      }

      await setTimeout(interval);
    }

    throw new Error(`Server at ${url} did not respond within ${timeout}ms`);
  }

  /**
   * Simple spy factory for logger methods.
   */
  static createMockLogger(): Logger {
    const makeSpy = () => {
      const fn = (..._args: unknown[]) => {};

      return fn;
    };

    return {
      'info': makeSpy(),
      'warn': makeSpy(),
      'error': makeSpy(),
      'debug': makeSpy(),
      'trace': makeSpy(),
    };
  }

  /**
   * Verifies status and content‐type header.
   */
  static async assertResponse(
    response: Response,
    expectedStatus = 200,
    expectedContentType = 'application/json',
  ): Promise<void> {
    if (response.status !== expectedStatus)
      throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);

    const ct = response.headers.get('content-type') || '';

    if (ct.includes(expectedContentType) === false)
      throw new Error(`Expected content-type to include ` + `${expectedContentType}, got ${ct}`);
  }

  /**
   * Creates a unique temp directory and a `.gitkeep` inside.
   */
  static async createTempDir(prefix = 'bun-test'): Promise<string> {
    const base = await fs.realpath(os.tmpdir());
    const name = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const dir = path.join(base, name);

    await fs.mkdir(dir, { 'recursive': true });
    await fs.writeFile(path.join(dir, '.gitkeep'), '');
    return dir;
  }
}

export const testConfig = {
  'testHost': process.env.TEST_HOST || 'localhost',
  'testPort': Number(process.env.TEST_PORT) || 3001,

  get 'testUrl'(): string {
    return `http://${this.testHost}:${this.testPort}`;
  },
};
