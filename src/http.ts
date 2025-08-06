import RouteBuilder from '@structures/RouteBuilder';
import logger from '@utils/logger';
import walkDirectory from '@utils/walkDirectory';

import type { MethodHandlers, RegisteredRoute, RoutesMap } from '@typings/server';
import type { BunRequest, Server } from 'bun';

/* == paths == */

const routesDirectory = `${import.meta.dirname}/routes`;

const normalize = (path: string): string => path.replace(/\\/g, '/');

const getEndpoint = (filePath: string): string => {
  const relative = normalize(filePath)
    .replace(normalize(routesDirectory), '')
    .replace(/\.(ts|js)$/i, '')
    .replace(/_/g, ':')
    .replace(/^\/?/, '/');

  const cleaned = relative.replace(/\/?(index|root)$/i, '') || '/';
  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
};

/* == route loader == */

const buildRoutes = async (): Promise<RoutesMap> => {
  const routes: RoutesMap = {
    '/health': () => Response.json({ 'status': 'ok', 'ts': Date.now(), 'up': process.uptime() }),
    '/health/ready': () => Response.json({ 'status': 'ready', 'ts': Date.now() }),
  };

  const routeFiles = await walkDirectory(routesDirectory);

  await Promise.all(
    routeFiles.map(async filePath => {
      try {
        const { 'default': builder } = (await import(filePath)) as {
          default: RouteBuilder;
        };

        const endpoint = getEndpoint(filePath);
        routes[endpoint] = builder.build();

        const verbs =
          typeof routes[endpoint] === 'function' ? 'FN' : Object.keys(routes[endpoint] as MethodHandlers).join(', ');

        logger.info(`↪ [${verbs}] ${endpoint}`);
      } catch (error) {
        logger.error(`Failed to load ${filePath}`, error);
      }
    }),
  );

  routes['*'] = () => Response.json({ 'error': 'Not found' }, { 'status': 404 });

  return routes;
};

/* == route handler == */

const wrapRouteHandler = (handler: RegisteredRoute) => {
  return async (request: BunRequest, server: Server): Promise<Response> => {
    if (typeof handler === 'function') {
      const result = await handler(request, server);
      return result as Response;
    }

    const methodHandler = handler[request.method.toUpperCase()];
    if (methodHandler === undefined) {
      return Response.json({ 'error': 'Method Not Allowed' }, { 'status': 405 });
    }

    const result = await methodHandler(request, server);
    return result as Response;
  };
};

/* == bootstrap == */

export default async (): Promise<void> => {
  const routes = await buildRoutes();
  const bunRoutes: Record<string, (req: BunRequest, server: Server) => Promise<Response>> = {};

  for (const [path, handler] of Object.entries(routes)) {
    if (path === '*') continue;

    bunRoutes[path] = wrapRouteHandler(handler as RegisteredRoute);
  }

  const server = Bun.serve({
    'port': Number(process.env.PORT) || 3000,
    'hostname': process.env.HOST || 'localhost',
    'routes': bunRoutes,
    'fetch': async (request: Request): Promise<Response> => {
      const catchAllHandler = routes['*'] as RegisteredRoute;
      if (typeof catchAllHandler === 'function') {
        const result = await catchAllHandler(request as BunRequest, server);

        return result instanceof Response ? result : Response.json(result);
      }

      return Response.json({ 'error': 'Not found' }, { 'status': 404 });
    },

    error(error: Error): Response {
      logger.error(error, 'Internal Server Error');

      return Response.json({ 'error': 'Internal Server Error' }, { 'status': 500 });
    },
  });

  logger.info(`🚀 http://${server.hostname}:${server.port}   (health → /health)`);

  const gracefulShutdown = (signal: string): void => {
    logger.info(`${signal} received - shutting down`);
    server.stop();
    process.exit(0);
  };

  ['SIGINT', 'SIGTERM'].forEach(signal => process.on(signal, () => gracefulShutdown(signal)));
};
