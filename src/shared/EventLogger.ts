const { Worker } = require('worker_threads');

export default class EventLogger {
  run = () => {
    const worker = new Worker('./src/workers/log_emitter.js');

    worker.on('message', (msg: any) => console.log(JSON.stringify(msg)));
    worker.on('error', (err: Error) => console.error(err));
    worker.on('exit', (code: number) => {
      if (code !== 0) throw new Error(`Worker stopped with exit code ${code}`);
    });
  };
}
