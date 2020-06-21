const { workerData, parentPort } = require('worker_threads');

const produceEvent = () => {
  const chance = Math.random();

  if (chance < 0.025)
    return 'Vladimir Putin elected president of the Russian Federation.';
  if (chance < 0.05) return 'UFO just flew by.';
  if (chance < 0.1) return 'As always nothing happens.';
  if (chance < 0.2) return 'Nothing is happening again.';

  return 'Nothing happens.';
};

const timerId = setInterval(() => {
  const obj = {
    event: produceEvent(),
    date: new Date(),
  };

  parentPort.postMessage(obj);
}, 1000);

const errorTimerId = setInterval(() => {
  throw new Error(workerData);
}, 5000);
