import morgan, { StreamOptions } from 'morgan';
import logger from '../utils/logger';

// Stream to write HTTP logs to Winston
const stream: StreamOptions = {
  write: (message) => logger.http(message.trim()),
};

// Define custom tokens for more detailed logging
morgan.token('user-id', (req: any) => {
  return req.user?.id || 'anonymous';
});

morgan.token('user-email', (req: any) => {
  return req.user?.email || 'N/A';
});

// Define log format
const format = process.env.NODE_ENV === 'production'
  ? ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms'
  : ':method :url :status :response-time ms - :user-id';

// Create and export the middleware
export const requestLogger = morgan(format, { stream });

// Skip logging in test environment
export const skipTestEnv = {
  skip: () => process.env.NODE_ENV === 'test',
};

// Create request logger middleware with test environment skip
export const httpLogger = morgan(format, {
  ...skipTestEnv,
  stream,
});
