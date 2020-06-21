import './LoadEnv'; // Must be the first import
import app from '@server';
import logger from '@shared/Logger';
import EventLogger from '@shared/EventLogger';
import ErrorHandler from '@shared/ErrorHandler';
import { workerError } from '@shared/constants';

const errorHandler = new ErrorHandler();

// Start the server
const port = Number(process.env.PORT || 3000);
app.listen(port, async () => {
  logger.info('Express server started on port: ' + port);

  const eventLogger = new EventLogger<typeof workerError>(
    workerError,
    logger,
    errorHandler,
  );

  await eventLogger.init();
  await eventLogger.run();
});

process.on('unhandledRejection', (reason: string, p: Promise<any>) => {
  // I just caught an unhandled promise rejection,
  // since we already have fallback handler for unhandled errors (see below),
  // let throw and let him handle that
  throw reason;
});

process.on('uncaughtException', (error: Error) => {
  errorHandler.handleError(error);
  if (!errorHandler.isTrustedError(error)) process.exit(1);
});
