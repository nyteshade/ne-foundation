const { Patches } = require('../dist/cjs/index.js')
const SetPrototypeExtensions = Patches.get(Set.prototype)

describe('SetPrototypeExtensions', () => {
  let testSet;

  beforeEach(() => {
    SetPrototypeExtensions.apply()
    testSet = new Set();
    Object.assign(testSet, SetPrototypeExtensions);
  });

  afterEach(() => {
    SetPrototypeExtensions.revert()
  });

  // Test concat
  test('concat merges multiple iterables', () => {
    testSet.add(1);
    testSet.concat([2, 3], new Set([4, 5]));
    expect([...testSet]).toEqual([1, 2, 3, 4, 5]);
  });

  test('contains performs a loose has() check', () => {
    testSet.concat('Sally', 'Jane', 'Mariah')
    expect(testSet.has(Object('Sally'))).toBe(false)
    expect(testSet.contains(Object('Sally'))).toBe(true)
  });

  // Test every
  test('every checks if all elements pass a test', () => {
    testSet.add(2);
    testSet.add(4);
    expect(testSet.every(element => element % 2 === 0)).toBeTruthy();
    testSet.add(3);
    expect(testSet.every(element => element % 2 === 0)).toBeFalsy();
  });

  // Test find
  test('find returns the first element that satisfies the provided function', () => {
    testSet.add(1);
    testSet.add(2);
    testSet.add(3);
    expect(testSet.find(element => element > 1)).toBe(2);
  });

  // Test findLast
  test('findLast returns the last element that satisfies the provided function', () => {
    testSet.add(1);
    testSet.add(2);
    testSet.add(3);
    expect(testSet.findLast(element => element < 3)).toBe(2);
  });

  // Test length
  test('length returns the number of elements', () => {
    testSet.add(1);
    testSet.add(2);
    expect(testSet.length).toBe(2);
  });

  // Test map
  test('map applies a function to each element', () => {
    testSet.add(1);
    testSet.add(2);
    const mapped = testSet.map(element => element * 2);
    expect(mapped).toEqual([2, 4]);
  });

  // Test reduce
  test('reduce applies a function against an accumulator', () => {
    testSet.add(1);
    testSet.add(2);
    testSet.add(3);
    const result = testSet.reduce((acc, value) => acc + value, 0);
    expect(result).toBe(6);
  });

  // Test some
  test('some tests whether any element passes the provided function', () => {
    testSet.add(1);
    testSet.add(2);
    testSet.add(3);
    expect(testSet.some(element => element % 2 === 0)).toBeTruthy();
    expect(testSet.some(element => element > 5)).toBeFalsy();
  });

  // Add additional tests for error handling and edge cases
});