const { workerData, parentPort } = require('worker_threads');

const produceEvent = () => {
  const chance = Math.random();

  if (chance < 0.025)
    return {
      event: 'Vladimir Putin elected president of the Russian Federation.',
      priority: 2,
    };

  if (chance < 0.05)
    return {
      event: 'UFO just flew by.',
      priority: 1,
    };

  if (chance < 0.1)
    return {
      event: 'As always nothing happens.',
      priority: 0,
    };

  if (chance < 0.2)
    return {
      event: 'Nothing is happening again.',
      priority: 0,
    };

  return { event: 'Nothing happens.', priority: 0 };
};

const produceEventTimerId = setInterval(() => {
  const obj = {
    ...produceEvent(),
    date: new Date(),
  };

  parentPort.postMessage(obj);
}, 1000);

const errorTimerId = setInterval(() => {
  clearInterval(produceEventTimerId);
  clearInterval(errorTimerId);

  throw new Error(workerData);
}, 5000);
