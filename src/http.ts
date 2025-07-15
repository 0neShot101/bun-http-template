import RouteBuilder from '@structures/RouteBuilder';
import logger from '@utils/logger';
import walkDirectory from '@utils/walkDirectory';

import type { HandlerReturn } from '@typings/routing';
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

/* == request dispatcher == */

const dispatchRequest = async (request: BunRequest, routes: RoutesMap, server: Server): Promise<HandlerReturn> => {
  const { pathname } = new URL(request.url);
  const registeredRoute: RegisteredRoute = (routes[pathname] ?? routes['*']) as RegisteredRoute;

  if (typeof registeredRoute === 'function') return registeredRoute(request, server);

  const methodHandler = registeredRoute[request.method.toUpperCase()];
  if (methodHandler === undefined) return Response.json({ 'error': 'Method Not Allowed' }, { 'status': 405 });

  return methodHandler(request, server);
};

/* == bootstrap == */

export default async (): Promise<void> => {
  const routes = await buildRoutes();

  const server = Bun.serve({
    'port': Number(process.env.PORT) || 3000,
    'hostname': process.env.HOST || 'localhost',
    'fetch': async request => {
      const result = await dispatchRequest(request as BunRequest, routes, server);

      return result as Response;
    },

    error(error) {
      logger.error('Server error:', error);

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
