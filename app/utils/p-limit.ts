// Source: https://github.com/sindresorhus/p-limit/blob/main/index.js

import Queue from './yocto-queue';

export interface LimitFunction {
  /**
	The number of promises that are currently running.
	*/
  readonly activeCount: number;

  /**
	The number of promises that are waiting to run (i.e. their internal `fn` was not called yet).
	*/
  readonly pendingCount: number;

  /**
	Discard pending promises that are waiting to run.
	This might be useful if you want to teardown the queue at the end of your program's lifecycle or discard any function calls referencing an intermediary state of your app.
	Note: This does not cancel promises that are already running.
	*/
  clearQueue: () => void;

  /**
	@param fn - Promise-returning/async function.
	@param arguments - Any arguments to pass through to `fn`. Support for passing arguments on to the `fn` is provided in order to be able to avoid creating unnecessary closures. You probably don't need this optimization unless you're pushing a lot of functions.
	@returns The promise returned by calling `fn(...arguments)`.
	*/
  <Arguments extends unknown[], ReturnType>(
    fn: (...arguments: Arguments) => PromiseLike<ReturnType> | ReturnType,
    ...arguments: Arguments
  ): Promise<ReturnType>;
}

/**
Run multiple promise-returning & async functions with limited concurrency.
@param concurrency - Concurrency limit. Minimum: `1`.
@returns A `limit` function.
*/
export default function pLimit(concurrency: number): () => LimitFunction {
  if (
    !(
      (Number.isInteger(concurrency) ||
        concurrency === Number.POSITIVE_INFINITY) &&
      concurrency > 0
    )
  ) {
    throw new TypeError('Expected `concurrency` to be a number from 1 and up');
  }

  const queue = new Queue();
  let activeCount = 0;

  const next = () => {
    activeCount--;

    if (queue.size > 0) {
      queue.dequeue()();
    }
  };

  const run = async (fn, resolve, args) => {
    activeCount++;

    const result = (async () => fn(...args))();

    resolve(result);

    try {
      await result;
    } catch {}

    next();
  };

  const enqueue = (fn, resolve, args) => {
    queue.enqueue(run.bind(undefined, fn, resolve, args));

    (async () => {
      // This function needs to wait until the next microtask before comparing
      // `activeCount` to `concurrency`, because `activeCount` is updated asynchronously
      // when the run function is dequeued and called. The comparison in the if-statement
      // needs to happen asynchronously as well to get an up-to-date value for `activeCount`.
      await Promise.resolve();

      if (activeCount < concurrency && queue.size > 0) {
        queue.dequeue()();
      }
    })();
  };

  const generator = (fn, ...args) =>
    new Promise((resolve) => {
      enqueue(fn, resolve, args);
    });

  Object.defineProperties(generator, {
    activeCount: {
      get: () => activeCount,
    },
    pendingCount: {
      get: () => queue.size,
    },
    clearQueue: {
      value: () => {
        queue.clear();
      },
    },
  });

  return generator;
}
