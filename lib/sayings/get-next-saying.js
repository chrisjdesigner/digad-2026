const sayingQueues = new Map();

function shuffle(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function getNextSaying(scope, sayings) {
  if (!Array.isArray(sayings) || sayings.length === 0) {
    return '';
  }

  const queue = sayingQueues.get(scope);

  if (!queue || queue.length === 0) {
    const nextQueue = shuffle(sayings);
    sayingQueues.set(scope, nextQueue);
    return nextQueue.pop();
  }

  return queue.pop();
}
