const { Controls: { enableAll, disableAll } } = require('../dist/cjs/index.js')

describe('Enabled extensions', () => {
  beforeEach(() => {
    enableAll()
  });

  afterEach(() => {
    disableAll()
  });

  test('first returns the first element of the array', () => {
    expect([1, 2, 3].first).toBe(1);
  });

  test('last returns the last element of the array', () => {
    expect([1, 2, 3].last).toBe(3);
  });

  test('isObject checks if a value is an object', () => {
    expect(Object.isObject({})).toBe(true);
    expect(Object.isObject(123)).toBe(false);
  });

  test('isAsync identifies async functions', () => {
    async function asyncFunc() {}
    expect(Function.isAsync(asyncFunc)).toBe(true);
    expect(Function.isAsync(() => {})).toBe(false);
  });

  test('hasAll checks if an object has all specified keys', () => {
    const obj = { a: 1, b: 2 };
    expect(Reflect.hasAll(obj, 'a', 'b')).toBe(true);
    expect(Reflect.hasAll(obj, 'a', 'c')).toBe(false);
  });
});
