const { Extensions } = require('../../dist/cjs/index.js')
const RefSet = Extensions.RefSet.class

describe('RefSet', () => {
  let refSet;

  beforeEach(() => {
    refSet = new RefSet();
  });

  describe('objectification behavior', () => {
    test('should objectify primitive values when objectification is enabled', () => {
      refSet.objectifying(true).add(123)

      expect([...refSet].length).toBe(1);
      expect(typeof [...refSet][0]).toBe('object');
    });

    test('should not objectify primitive values when objectification is disabled', () => {
      expect(() => refSet.objectifying(false).add(123)).toThrow()
    });
  });

  describe('add method', () => {
    test('should add non-null objects and non-registered symbols', () => {
      const obj = {};
      const symbol = Symbol('test');
      refSet.add(obj);
      refSet.add(symbol);

      expect(refSet.has(obj)).toBeTruthy();
      expect(refSet.has(symbol)).toBeTruthy();
    });

    test('should throw for null, undefined, and registered symbols', () => {
      expect(() => refSet.add(null)).toThrow(TypeError);
      expect(() => refSet.add(undefined)).toThrow(TypeError);
      expect(() => refSet.add(Symbol.for('test'))).toThrow(TypeError);
    });
  });

  describe('addAll method', () => {
    test('should add all elements from an iterable', () => {
      const values = [1, 2, 3];
      refSet.objectifying().addAll(values);

      expect(refSet.size).toBe(values.length);
    });

    test('should throw for non-iterable values', () => {
      expect(() => refSet.addAll(null)).toThrow(TypeError);
    });
  });

});

