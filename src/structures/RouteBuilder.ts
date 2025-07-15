import EventEmitter from '@3xpo/events';

import type { Event, Middleware, MiddlewareMap, RouteHandler, RouteMethod } from '@typings/routing';
import type { BunRequest, Server } from 'bun';

/**
 * Utility function to normalize values into readonly arrays.
 * @template T - The type of the value(s) to convert
 * @param value - A single value, array of values, or undefined
 * @returns A readonly array containing the value(s), or empty array if undefined
 */
const toArray = <T>(value: T | T[] | undefined): readonly T[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

/**
 * A sophisticated HTTP route builder that extends EventEmitter to provide
 * type-safe route registration with middleware support and event-driven architecture.
 *
 * @template E - Event interface extending the base Event type for route methods
 *
 * @example Basic usage
 * ```typescript
 * const route = new RouteBuilder();
 *
 * route.on('get', async (req) => {
 *   return Response.json({ message: 'Hello World!' });
 * });
 *
 * const routeTable = route.build();
 * ```
 *
 * @example With middleware
 * ```typescript
 * const authMiddleware = (req) => {
 *   if (!req.headers.get('authorization')) {
 *     return new Response('Unauthorized', { status: 401 });
 *   }
 * };
 *
 * const route = new RouteBuilder({
 *   get: authMiddleware,
 *   post: [authMiddleware, validationMiddleware]
 * });
 * ```
 */
export default class RouteBuilder<E extends Event = Event> extends EventEmitter<E> {
  private readonly handlers = new Map<keyof E, RouteHandler>();

  private readonly middlewarePerMethod: Record<RouteMethod, readonly Middleware[]> = {
    'get': [],
    'post': [],
    'put': [],
    'delete': [],
    'patch': [],
    'head': [],
    'options': [],
  };

  /**
   * Creates a new RouteBuilder instance with optional middleware configuration.
   *
   * @param middlewareMap - Optional mapping of HTTP methods to middleware functions.
   *                       Each method can have a single middleware function or an array of functions.
   *                       Middleware executes before the main route handler in the order specified.
   *
   * @example
   * ```typescript
   * const route = new RouteBuilder({
   *   get: authMiddleware,
   *   post: [authMiddleware, validationMiddleware],
   *   put: [authMiddleware, validationMiddleware, rateLimitMiddleware]
   * });
   * ```
   */
  constructor(middlewareMap?: MiddlewareMap) {
    super();

    if (middlewareMap) {
      (Object.keys(middlewareMap) as RouteMethod[]).forEach(method => {
        this.middlewarePerMethod[method] = toArray(middlewareMap[method]);
      });
    }
  }

  /**
   * Registers a route handler for a specific HTTP method.
   * Overrides EventEmitter's on method to provide type safety and prevent duplicate registrations.
   *
   * @template M - The HTTP method type, must be a key of the Event interface
   * @param method - The HTTP method to handle ('get', 'post', 'put', 'delete', etc.)
   * @param listener - The route handler function that processes requests for this method
   * @returns The RouteBuilder instance for method chaining
   * @throws {Error} When a handler for the specified method is already registered
   *
   * @example
   * ```typescript
   * route
   *   .on('get', async (req) => Response.json({ users: [] }))
   *   .on('post', async (req) => {
   *     const body = await req.json();
   *     return Response.json({ created: body }, { status: 201 });
   *   });
   * ```
   */
  public override on<M extends keyof E>(method: M, listener: E[M]): this {
    if (this.handlers.has(method)) {
      throw new Error(`Handler for ${String(method).toUpperCase()} already defined.`);
    }

    this.handlers.set(method, listener as RouteHandler);
    return super.on(method as any, listener);
  }

  /**
   * Builds a route table object optimized for Bun.serve integration.
   * Combines all registered handlers with their middleware into uppercase HTTP method keys.
   *
   * The execution flow for each request:
   * 1. Execute middleware functions in sequence
   * 2. If middleware returns a Response, short-circuit and return it
   * 3. If middleware returns false, return 403 Forbidden
   * 4. If all middleware passes (returns void/true), execute the main handler
   * 5. Wrap non-Response handler results in Response.json()
   *
   * @returns Object with uppercase HTTP method keys (GET, POST, etc.) mapped to route handlers
   *
   * @example Basic usage with Bun.serve
   * ```typescript
   * const userRoutes = new RouteBuilder();
   * userRoutes.on('get', async () => ({ users: [] }));
   *
   * const server = Bun.serve({
   *   fetch(req) {
   *     const url = new URL(req.url);
   *     if (url.pathname === '/users') {
   *       const handlers = userRoutes.build();
   *       const handler = handlers[req.method.toUpperCase()];
   *       return handler ? handler(req) : new Response('Method Not Allowed', { status: 405 });
   *     }
   *     return new Response('Not Found', { status: 404 });
   *   }
   * });
   * ```
   *
   * @example Route table structure
   * ```typescript
   * // Returns object like:
   * {
   *   GET: (req) => Promise<Response>,
   *   POST: (req) => Promise<Response>,
   *   PUT: (req) => Promise<Response>
   * }
   * ```
   */
  public build(): { [K in Uppercase<keyof E & string>]: RouteHandler } {
    const routeTable = {} as {
      [K in Uppercase<keyof E & string>]: RouteHandler;
    };

    for (const [method, handler] of this.handlers) {
      const upperCaseMethod = (method as string).toUpperCase() as Uppercase<keyof E & string>;

      const middlewareSequence = this.middlewarePerMethod[method as RouteMethod];

      routeTable[upperCaseMethod] = async (request: BunRequest, server: Server) => {
        for (const middlewareFunction of middlewareSequence) {
          const middlewareResult = await middlewareFunction(request, server);

          if (middlewareResult instanceof Response) return middlewareResult;
          if (middlewareResult === false) {
            return new Response(null, { 'status': 403 });
          }
        }

        const handlerResult = await handler(request, server);
        return handlerResult instanceof Response ? handlerResult : Response.json(handlerResult);
      };
    }

    return routeTable;
  }
}
