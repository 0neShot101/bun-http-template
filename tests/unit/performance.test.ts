import { describe, expect, it } from 'bun:test';

describe('Performance Benchmarks', () => {
  it('should handle route building performance', () => {
    const startTime = performance.now();
    const RouteBuilder = require('../../src/structures/RouteBuilder').default;

    const routes: any[] = [];
    for (let i = 0; i < 1000; i++) {
      const builder = new RouteBuilder()
        .on('get', async () => new Response(`Route ${i}`))
        .on('post', async () => new Response(`Posted to ${i}`));

      routes.push(builder.build());
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(routes).toHaveLength(1000);
    expect(duration).toBeLessThan(1000);

    // eslint-disable-next-line no-console
    console.log(`Created 1000 routes in ${duration.toFixed(2)}ms`);
  });

  it('should handle JSON serialization performance', () => {
    const startTime = performance.now();

    const data = {
      'users': Array.from({ 'length': 10000 }, (_, i) => ({
        'id': i,
        'name': `User ${i}`,
        'email': `user${i}@example.com`,
        'active': i % 2 === 0,
      })),
    };

    const serialized = JSON.stringify(data);
    const deserialized = JSON.parse(serialized);

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(deserialized.users).toHaveLength(10000);
    expect(duration).toBeLessThan(500);

    // eslint-disable-next-line no-console
    console.log(`Serialized/deserialized 10k objects in ${duration.toFixed(2)}ms`);
  });
});
