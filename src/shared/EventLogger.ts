import logger from '@shared/Logger';
import { LogEmitter } from '@/modules/LogEmitter';

import AppError from '@shared/AppError';
import { workerError } from '@shared/constants';

const { Worker } = require('worker_threads');

export default class EventLogger<T> {
  private _workerData: T;

  constructor(workerData: T) {
    this._workerData = workerData;
  }

  run = () => {
    const worker = new Worker('./src/workers/log_emitter.js', {
      workerData: this._workerData,
    });

    worker.on('online', this.ononline);
    worker.on('message', this.onmessage);
    worker.on('error', this.onerror);
    worker.on('exit', this.onexit);
  };

  private ononline = () => {
    logger.info('Worker went online');
  };

  private onmessage = (evt: LogEmitter.Event) => {
    logger.info('Got an event:', evt);
  };

  private onerror = (err: Error) => {
    logger.error(`Got an worker error: ${err.message}`);

    if (err.message === workerError) {
      logger.info('Restarting worker...');
      this.run();
    }
  };

  private onexit = (code: number) => {
    if (code !== 0)
      throw new AppError(
        workerError,
        `Worker stopped with exit code ${code}`,
        true,
      );
  };
}
