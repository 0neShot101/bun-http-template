import { logger } from '@utils/logger';

import http from './http';

http().catch(error => {
  logger.error(`Failed to start server: ${error}`);
  process.exit(1);
});
