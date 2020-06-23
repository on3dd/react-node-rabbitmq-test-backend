import amqp from 'amqplib';

import { Logger } from 'winston';

import AppError from '@shared/AppError';

export default class Consumer {
  private _logger: Logger;

  private _connection!: amqp.Connection;
  private _channel!: amqp.Channel;
  private _queue!: amqp.Replies.AssertQueue;

  private readonly exchange = 'logs';

  constructor(logger: Logger) {
    this._logger = logger;
  }

  init = async () => {
    try {
      this._connection = await amqp.connect('amqp://localhost');
      this._channel = await this._connection.createChannel();

      await this._channel.assertExchange(this.exchange, 'fanout', {
        durable: false,
      });

      this._queue = await this._channel.assertQueue('', {
        exclusive: true,
      });

      await this._channel.bindQueue(this._queue.queue, this.exchange, '');

      this._logger.info('Consumer started up successfully');
    } catch (err) {
      throw new AppError('Error initializing rabbitmq server', err, false);
    }
  };

  run = async () => {
    try {
      await this._channel.consume(this._queue.queue, this.onmessage, {
        noAck: true,
      });
    } catch (err) {
      throw new AppError('Error running rabbitmq server', err, false);
    }
  };

  private onmessage = (msg: amqp.ConsumeMessage | null) => {
    if (msg && msg.content) {
      const message = msg.content.toString();
      this._logger.info(`Received message: ${message}`);
    }
  };
}
