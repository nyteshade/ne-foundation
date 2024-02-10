const { Patches } = require('../dist/cjs/index.js')
const ObjectExtensions = Patches.get(Object)

// Apply and revert the patch in the setup and teardown of the tests
beforeAll(() => {
  ObjectExtensions.apply()
})

afterAll(() => {
  ObjectExtensions.revert()
})

describe('ObjectExtensions', () => {

  describe('hasStringTag', () => {
    test('should return true for objects with a string tag', () => {
      let object = { get [Symbol.toStringTag]() { return 'Test' }}

      expect(Object.hasStringTag(object)).toBe(true)
    })

    test('should return false for objects without a string tag', () => {
      expect(Object.hasStringTag({})).toBe(false)
    })

    test('should return false for non-object types', () => {
      expect(Object.hasStringTag(123)).toBe(false)
    })
  })

  describe('getStringTag', () => {
    test('should return the correct string tag for objects', () => {
      expect(Object.getStringTag(new Date())).toBe('Date')
    })

    test('should return function name for functions', () => {
      function testFunction() {}
      expect(Object.getStringTag(testFunction)).toBe('testFunction')
    })

    test('should return the correct type for primitive values', () => {
      expect(Object.getStringTag(null)).toBe('Null')
      expect(Object.getStringTag(undefined)).toBe('Undefined')
      expect(Object.getStringTag(123)).toBe('Number')
    })
  })


  describe('getType', () => {
    test('should return the correct type for objects', () => {
      expect(Object.getType([])).toBe(Array)
      expect(Object.getType({})).toBe(Object)
    })

    test('should return null for Null and undefined for Undefined', () => {
      expect(Object.getType(null)).toBeNull()
      expect(Object.getType(undefined)).toBeUndefined()
    })
  })


  describe('isObject', () => {
    test('should return true for object types', () => {
      expect(Object.isObject({})).toBe(true)
      expect(Object.isObject([])).toBe(true)
    })

    test('should return false for non-object types', () => {
      expect(Object.isObject(123)).toBe(false)
      expect(Object.isObject('string')).toBe(false)
    })
  })

  describe('isPrimitive', () => {
    test('should return true for primitive types', () => {
      expect(Object.isPrimitive(123)).toBe(true)
      expect(Object.isPrimitive('string')).toBe(true)
      expect(Object.isPrimitive(null)).toBe(true)
    })

    test('should return false for non-primitive types', () => {
      expect(Object.isPrimitive({})).toBe(false)
      expect(Object.isPrimitive([])).toBe(false)
      expect(Object.isPrimitive(new Date())).toBe(false)
    })
  })


  describe('isValidKey', () => {
    test('should return true for string and symbol keys', () => {
      expect(Object.isValidKey('key')).toBe(true)
      expect(Object.isValidKey(Symbol('sym'))).toBe(true)
    })

    test('should return false for non-string and non-symbol keys', () => {
      expect(Object.isValidKey(123)).toBe(false)
      expect(Object.isValidKey({})).toBe(false)
      expect(Object.isValidKey(null)).toBe(false)
    })
  })

  describe('stripTo', () => {
    const sourceObject = {
      a: 1,
      b: 2,
      get c() { return this.a + this.b },
      set c(value) { this.a = value }
    }

    test('should strip object to specified keys', () => {
      const stripped = Object.stripTo(sourceObject, ['a', 'b'])
      expect(stripped).toEqual({ a: 1, b: 2 })
      expect(stripped.c).toBeUndefined()
    })

    test('should bind accessors to the source object when specified', () => {
      const stripped = Object.stripTo(sourceObject, ['c'], true)
      expect(stripped.c).toBe(3)
      stripped.c = 5
      expect(sourceObject.a).toBe(5)
    })

    test('should handle non-array keys and invalid objects', () => {
      expect(Object.stripTo(sourceObject, 'not-array')).toEqual({})
      expect(() => Object.stripTo(null, ['a'])).toThrow()
    })
  })
})
