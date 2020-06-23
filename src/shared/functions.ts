import io from 'socket.io';
import { Logger } from 'winston';
import ErrorHandler from '@shared/ErrorHandler';
import { workerError } from '@shared/constants';
import EventLogger from '@/entities/EventLogger';
import EventConsumer from '@/entities/EventConsumer';

export const getRandomInt = () => {
  return Math.floor(Math.random() * 1_000_000_000_000);
};

export const initLogger = async (
  logger: Logger,
  errorHandler: ErrorHandler,
) => {
  const eventLogger = new EventLogger<typeof workerError>(
    workerError,
    logger,
    errorHandler,
  );

  await eventLogger.init();
  await eventLogger.run();
};

export const initConsumer = async (
  server: io.Server,
  logger: Logger,
  errorHandler: ErrorHandler,
) => {
  const eventConsumer = new EventConsumer(
    server,
    logger,
    errorHandler,
  );

  await eventConsumer.init();
  await eventConsumer.run();
};
