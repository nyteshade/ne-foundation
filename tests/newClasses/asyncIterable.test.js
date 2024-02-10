const { Extensions } = require('../../dist/cjs/index.js')
const AsyncIterable = Extensions.AsyncIterable.class
const Iterable = Extensions.Iterable.class

describe('AsyncIterable', () => {
  test('should create an async iterable from an array of promises', async () => {
    const promises = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];
    const asyncIterable = new AsyncIterable(promises);
    const result = [];

    for await (const item of asyncIterable) {
      result.push(item);
    }

    expect(result).toEqual([1, 2, 3]);
  });

  test('should create an async iterable from individual promises', async () => {
    const asyncIterable = new AsyncIterable(Promise.resolve(1), Promise.resolve(2), Promise.resolve(3));
    const result = [];

    for await (const item of asyncIterable) {
      result.push(item);
    }

    expect(result).toEqual([1, 2, 3]);
  });

  test('isAsyncIterable should return true for async generator function', async () => {
    async function* gen() {
      yield Promise.resolve(1);
    }
    const asyncIterable = new AsyncIterable(gen);

    expect(AsyncIterable.isAsyncIterable(asyncIterable)).toBeTruthy();
  });

  test('isAsyncIterable should return false for non-async iterables', () => {
    const nonAsyncIterable = new Iterable([1, 2, 3]);

    expect(AsyncIterable.isAsyncIterable(nonAsyncIterable)).toBeFalsy();
  });
});
