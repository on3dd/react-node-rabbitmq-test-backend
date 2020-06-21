import logger from '@shared/Logger';
import { LogEmitter } from '@/modules/LogEmitter';

import AppError from '@shared/AppError';
import { workerError } from '@shared/constants';

import amqp from 'amqplib';

import { Worker } from 'worker_threads';

export default class EventLogger<T> {
  private _workerData: T;

  private connection!: amqp.Connection;
  private channel!: amqp.Channel;

  private readonly exchange = 'logs';

  constructor(workerData: T) {
    this._workerData = workerData;
  }

  init = async () => {
    try {
      this.connection = await amqp.connect('amqp://localhost');
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(this.exchange, 'fanout', {
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
    logger.info('Worker went online');
  };

  private onmessage = (evt: LogEmitter.Event) => {
    logger.info('Event:', evt);
    const msg = JSON.stringify(evt);
    this.channel.publish(this.exchange, '', Buffer.from(msg));
  };

  private onerror = (err: Error) => {
    logger.error(`Worker error: ${err.message}`);

    setTimeout(() => {
      if (err.message === workerError) {
        logger.info('Restarting worker...');
        this.run();
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
