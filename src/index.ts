import './LoadEnv'; // Must be the first import
import app from '@server';
import logger from '@shared/Logger';
import EventLogger from '@shared/EventLogger';
import ErrorHandler from '@shared/ErrorHandler';
import { workerError } from '@shared/constants';

// Start the server
const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  logger.info('Express server started on port: ' + port);

  const eventLogger = new EventLogger<typeof workerError>(workerError);
  eventLogger.run();
});

const errorHandler = new ErrorHandler();

process.on('uncaughtException', (error: Error) => {
  errorHandler.handleError(error);
  if (!errorHandler.isTrustedError(error)) process.exit(1);
});
