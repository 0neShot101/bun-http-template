import type { BunRequest, Server } from 'bun';

/* == HTTP primitives == */

export type RouteMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options';

/* == Handler & middleware contracts == */

export type HandlerReturn = Response | Promise<Response> | Record<string, unknown> | Promise<Record<string, unknown>>;

/**
 * Function that responds to an HTTP request for its verb.
 */
export type RouteHandler = (req: BunRequest, server: Server<BunRequest>) => HandlerReturn;

/**
 * Middleware:
 * - return `void | true` → continue chain
 * - return `false` → stop with 403
 * - return `Response` → custom reply
 */
export type MiddlewareResult = void | true | false | Response | Promise<void | true | false | Response>;

export type Middleware = (req: BunRequest, server: Server<BunRequest>) => MiddlewareResult;

export type MiddlewareMap = {
  [M in RouteMethod]?: Middleware | Middleware[];
};

/* == Event-emitter map for RouteBuilder == */

export type Event = { [M in RouteMethod]?: RouteHandler };

/**
 * Public shape of a route within the app.
 * (Used mainly for typing the EventEmitter-based RouteBuilder.)
 */
export interface Route {
  middleware: Middleware[];

  on<M extends keyof Event>(event: M, listener: Event[M]): this;

  run<M extends keyof Event>(event: M, req: BunRequest, server: Server<BunRequest>): HandlerReturn;
}
