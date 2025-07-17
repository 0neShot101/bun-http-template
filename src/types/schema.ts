import type { BunRequest, Server } from 'bun';
import type { z } from 'zod';

/* == Core & Public Types == */

/** Basic event map for the EventEmitter. */
export type Event = Record<string, (...args: any[]) => any>;

/** Supported HTTP methods for the route builder. */
export type RouteMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options';

/** A basic route handler function. */
export type RouteHandler = (request: BunRequest, server: Server) => any;

/**
 * A middleware function. It can return a Response to halt the request,
 * false for a 403 Forbidden, or nothing to continue to the next function.
 */
export type Middleware = (
  request: BunRequest,
  server: Server,
) => Promise<void | Response | boolean> | void | Response | boolean;

/** A map of HTTP methods to their corresponding middleware. */
export type MiddlewareMap = Partial<Record<RouteMethod, Middleware | Middleware[]>>;

/** Defines the shape for Zod validation schemas for different parts of a request. */
export interface ValidationSchemas {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
  headers?: z.ZodSchema;
}

/** A BunRequest object that has been decorated with validated, type-safe data. */
export type ValidatedRequest<S extends ValidationSchemas> = BunRequest & ValidatedData<S>;

/**
 * A responsive route handler type. If a schema is defined, it receives a
 * decorated `ValidatedRequest`. Otherwise, it receives a standard `BunRequest`.
 */
export type TypedRouteHandler<S extends ValidationSchemas | undefined> = S extends ValidationSchemas
  ? (request: ValidatedRequest<S>, server: Server) => any
  : (request: BunRequest, server: Server) => any;

/* == Internal Types for Inference == */

/** Infers the actual data type from a Zod schema. */
type InferValidation<S> = S extends z.ZodTypeAny ? z.infer<S> : never;

/** Creates a typed data object from a set of validation schemas. */
type ValidatedData<S extends ValidationSchemas> = {
  body: InferValidation<S['body']>;
  query: InferValidation<S['query']>;
  headers: InferValidation<S['headers']>;
  params: InferValidation<S['params']>;
};
