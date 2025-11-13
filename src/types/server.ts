import type { HandlerReturn } from '@typings/routing';
import type { BunRequest, Server } from 'bun';

/* == HTTP primitives == */
export type SimpleRouteHandler = (request: BunRequest, server: Server<BunRequest>) => HandlerReturn;

/* == HTTP method handlers == */
export type MethodHandlers = Record<string, SimpleRouteHandler>;

/* == Registered route type == */
export type RegisteredRoute = SimpleRouteHandler | MethodHandlers;
export type RoutesMap = Record<string, RegisteredRoute>;
