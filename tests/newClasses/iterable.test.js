const { Extensions } = require('../../dist/cjs/index.js')
const Iterable = Extensions.Iterable.class

describe('Iterable', () => {
  test('should create an iterable from an array', () => {
    const array = [1, 2, 3];
    const iterable = new Iterable(array);

    expect([...iterable]).toEqual(array);
  });

  test('should create an iterable from individual elements', () => {
    const iterable = new Iterable(1, 2, 3);

    expect([...iterable]).toEqual([1, 2, 3]);
  });

  test('should work with for...of loop', () => {
    const iterable = new Iterable('a', 'b', 'c');
    const result = [];

    for (const item of iterable) {
      result.push(item);
    }

    expect(result).toEqual(['a', 'b', 'c']);
  });

  test('isIterable should return true for generator function', () => {
    function* gen() {
      yield 1;
    }
    const iterable = new Iterable(gen);

    expect(Iterable.isIterable(iterable)).toBeTruthy();
  });

  test('isIterable should return false for non-iterables', () => {
    const nonIterable = {};

    expect(Iterable.isIterable(nonIterable)).toBeFalsy();
  });
});
