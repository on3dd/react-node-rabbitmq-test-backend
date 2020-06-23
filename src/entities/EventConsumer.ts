import amqp from 'amqplib';
import io from 'socket.io';

import { Logger } from 'winston';

import AppError from '@shared/AppError';
import ErrorHandler from '@shared/ErrorHandler';

export default class EventConsumer {
  private _server: io.Server;
  private _logger: Logger;
  private _errorHandler: ErrorHandler;

  private _connection!: amqp.Connection;
  private _channel!: amqp.Channel;
  private _queue!: amqp.Replies.AssertQueue;

  private readonly exchange = 'logs';

  constructor(_server: io.Server, logger: Logger, errorHandler: ErrorHandler) {
    this._server = _server;
    this._logger = logger;
    this._errorHandler = errorHandler;
  }

  init = async () => {
    try {
      await this.initRMQ();
    } catch (err) {
      this._errorHandler.handleError(err);
    }

    try {
      await this.initWS();
    } catch (err) {
      this._errorHandler.handleError(err);
    }
  };

  private initRMQ = async () => {
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

  private initWS = () => {
    return new Promise<void>((resolve) => {
      this._server.listen(8000);

      this._server.on('connection', (client) => {
        this._logger.info('Client connected');

        client.on('disconnect', () => {
          this._logger.warn('Client disconnected');
        });
      });

      resolve();
    });
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
      this._server.emit('message', message);
    }
  };
}
