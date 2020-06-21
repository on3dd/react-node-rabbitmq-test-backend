// import logger from '@shared/Logger';
import { Logger } from 'winston';
import { LogEmitter } from '@/modules/LogEmitter';

import AppError from '@shared/AppError';
import { workerError } from '@shared/constants';
import ErrorHandler from '@shared/ErrorHandler';

import amqp from 'amqplib';

import { Worker } from 'worker_threads';

export default class EventLogger<T> {
  private _workerData: T;
  private _logger: Logger;
  private _errorHandler: ErrorHandler;

  private _connection!: amqp.Connection;
  private _channel!: amqp.Channel;

  private readonly exchange = 'logs';

  constructor(workerData: T, logger: Logger, errorHandler: ErrorHandler) {
    this._workerData = workerData;
    this._logger = logger;
    this._errorHandler = errorHandler;
  }

  init = async () => {
    try {
      this._connection = await amqp.connect('amqp://localhost');
      this._channel = await this._connection.createChannel();

      await this._channel.assertExchange(this.exchange, 'fanout', {
        durable: false,
      });
    } catch (err) {
      throw new AppError('Error initializing init rabbitmq server', err, false);
    }
  };

  run = () => {
    return new Promise<void>((resolve) => {
      const worker = new Worker('./src/workers/log_emitter.js', {
        workerData: this._workerData,
      });

      worker.on('online', this.ononline);
      worker.on('message', this.onmessage);
      worker.on('error', this.onerror);
      worker.on('exit', this.onexit);

      resolve();
    });
  };

  private ononline = () => {
    this._logger.info('Worker went online');
  };

  private onmessage = (evt: LogEmitter.Event) => {
    this._logger.info('Event:', evt);

    const msg = JSON.stringify(evt);
    this._channel.publish(this.exchange, '', Buffer.from(msg));
  };

  private onerror = (err: Error) => {
    this._errorHandler.handleError(err);

    setTimeout(async () => {
      if (err.message === workerError) {
        this._logger.info('Restarting worker...');
        await this.run();
      }
    }, 1000);
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
