import './LoadEnv'; // Must be the first import
import app from '@server';
import logger from '@shared/Logger';
import ErrorHandler from '@shared/ErrorHandler';
import { initLogger, initConsumer } from '@shared/functions';

const server = require('http').createServer(app);
const webSocketServer = require('socket.io')(server);

const errorHandler = new ErrorHandler();

// Start the server
const port = Number(process.env.PORT || 3000);
app.listen(port, async () => {
  logger.info('Express server started on port: ' + port);

  await initLogger(logger, errorHandler);
  await initConsumer(webSocketServer, logger, errorHandler);
});

process.on('unhandledRejection', (reason: string, p: Promise<any>) => {
  throw reason;
});

process.on('uncaughtException', (error: Error) => {
  errorHandler.handleError(error);
  if (!errorHandler.isTrustedError(error)) process.exit(1);
});
