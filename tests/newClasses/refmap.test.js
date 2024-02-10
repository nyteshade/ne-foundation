const { Extensions } = require('../../dist/cjs/index.js')
const RefMap = Extensions.RefMap.class

describe('RefMap', () => {
  let refMap;

  beforeEach(() => {
    refMap = new RefMap();
  });

  // Test the constructor
  test('should create an empty RefMap', () => {
    expect(refMap.size).toBe(0);
  });

  // Test objectifying behavior
  test('should toggle objectify values', () => {
    refMap.objectifying(true);
    expect(refMap.objectifyValues).toBe(true);
    refMap.objectifying(false);
    expect(refMap.objectifyValues).toBe(false);
  });

  // Test set and get methods
  test('should set and get weakly referenced values', () => {
    const obj = {};
    refMap.set('key', obj);
    expect(refMap.get('key')).toBe(obj);
    expect(refMap.size).toBe(1);
  });

  // Test handling of primitives
  test('should handle primitives when objectifying is true', () => {
    refMap.objectifying(true);
    refMap.set('number', 123);
    expect(typeof refMap.get('number')).toBe('object');
  });

  // Test error handling
  test('should throw error for invalid values in set', () => {
    expect(() => refMap.set('key', undefined)).toThrow(TypeError);
  });

  // Test asObject method
  test('asObject should return a regular object', () => {
    const obj = {};
    refMap.set('key', obj);
    const regularObject = refMap.asObject();
    expect(typeof regularObject).toBe('object');
    expect(regularObject.key).toBe(obj);
  });

  // Test hasValue method
  test('hasValue should correctly determine the presence of a value', () => {
    const obj = {};
    refMap.set('key', obj);
    expect(refMap.hasValue(obj)).toBe(true);
    expect(refMap.hasValue({})).toBe(false);
  });

  // Test forEach method
  test('forEach should iterate over values', () => {
    const mockCallback = jest.fn();
    const obj = {};
    refMap.set('key', obj);
    refMap.forEach(mockCallback);
    expect(mockCallback.mock.calls.length).toBe(1);
  });
});
