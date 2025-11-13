import type { BunRequest, Server } from 'bun';
import type { z } from 'zod';

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
  ? (request: ValidatedRequest<S>, server: Server<BunRequest>) => any
  : (request: BunRequest, server: Server<BunRequest>) => any;

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
