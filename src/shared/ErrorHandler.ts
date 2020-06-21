import logger from '@shared/Logger';
import AppError from '@shared/AppError';

export default class ErrorHandler {
  public handleError(err: Error) {
    // console.log(err);
    logger.error(err.message);
  }

  public isTrustedError(error: Error) {
    if (error instanceof AppError) {
      return error.isOperational;
    }

    return false;
  }
}
