import pino from 'pino';

const loggerOptions =
  process.env.NODE_ENV === 'production'
    ? {
        'level': 'info',
      }
    : {
        'transport': {
          'target': 'pino-pretty',
          'options': {
            'colorize': true,
            'translateTime': 'SYS:yyyy-mm-dd HH:MM:ss',
            'ignore': 'pid,hostname',
            'singleLine': false,
          },
        },
        'level': 'debug',
      };

export const logger = pino(loggerOptions);
