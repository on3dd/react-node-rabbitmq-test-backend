import './LoadEnv'; // Must be the first import
import app from '@server';
import logger from '@shared/Logger';
import EventLogger from '@shared/EventLogger';
import ErrorHandler from '@shared/ErrorHandler';
import { workerError } from '@shared/constants';
import Consumer from '@entities/Consumer';

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

  const consumer = new Consumer(logger);

  await consumer.init();
  await consumer.run();
});

process.on('unhandledRejection', (reason: string, p: Promise<any>) => {
  throw reason;
});

process.on('uncaughtException', (error: Error) => {
  errorHandler.handleError(error);
  if (!errorHandler.isTrustedError(error)) process.exit(1);
});
