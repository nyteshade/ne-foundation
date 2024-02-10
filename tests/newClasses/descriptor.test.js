const { Extensions } = require('../../dist/cjs/index.js')
const Descriptor = Extensions.Descriptor.class

describe('Descriptor', () => {
  describe('constructor', () => {
    test('should create a Descriptor from a property descriptor', () => {
      const obj = { a: 1 };
      const desc = new Descriptor(Object.getOwnPropertyDescriptor(obj, 'a'));
      expect(desc.isData).toBe(true);
      expect(desc.value).toBe(1);
    });

    test('should throw an error for invalid descriptors', () => {
      expect(() => new Descriptor(5)).toThrow();
    });
  });

  describe('isAccessor', () => {
    test('should return true for accessor descriptors', () => {
      const getter = () => {};
      const setter = (value) => {};
      const obj = {};
      Object.defineProperty(obj, 'prop', { get: getter, set: setter });
      const desc = new Descriptor(obj, 'prop');
      expect(desc.isAccessor).toBe(true);
    });

    test('should return false for data descriptors', () => {
      const obj = { a: 1 };
      const desc = new Descriptor(obj, 'a');
      expect(desc.isAccessor).toBe(false);
    });
  });

  describe('isData', () => {
    test('should return true for data descriptors', () => {
      const obj = { a: 1 };
      const desc = new Descriptor(obj, 'a');
      expect(desc.isData).toBe(true);
    });

    test('should return false for accessor descriptors', () => {
      const obj = {};
      Object.defineProperty(obj, 'prop', {
        get: () => {},
        set: (value) => {}
      });
      const desc = new Descriptor(obj, 'prop');
      expect(desc.isData).toBe(false);
    });
  });

  describe('isDescriptor', () => {
    test('should return true for valid descriptors', () => {
      const desc = new Descriptor({ value: 10 });
      expect(desc.isDescriptor).toBe(true);
    });

    test('should throw an error for invalid descriptors', () => {
      expect(() => new Descriptor({})).toThrow()
    });
  });

  describe('getters and setters', () => {
    let desc;

    beforeEach(() => {
      desc = new Descriptor({ value: 10, writable: true, enumerable: true, configurable: true });
    });

    test('configurable getter and setter', () => {
      expect(desc.configurable).toBe(true);
      desc.configurable = false;
      expect(desc.configurable).toBe(false);
    });

    test('enumerable getter and setter', () => {
      expect(desc.enumerable).toBe(true);
      desc.enumerable = false;
      expect(desc.enumerable).toBe(false);
    });

    test('writable getter and setter', () => {
      expect(desc.writable).toBe(true);
      desc.writable = false;
      expect(desc.writable).toBe(false);
    });

    test('value getter and setter', () => {
      expect(desc.value).toBe(10);
      desc.value = 20;
      expect(desc.value).toBe(20);
    });
  });

  describe('applyTo', () => {
    test('should apply descriptor to an object', () => {
      const obj = {};
      const desc = new Descriptor({
        configurable: true,
        enumerable: true,
        value: 10,
        writable: true
      });
      desc.applyTo(obj, 'a');
      expect(obj.a).toBe(10);
    });

    test('should throw error for non-object or invalid key', () => {
      const desc = new Descriptor({ value: 10 });
      expect(() => desc.applyTo(123, 'a')).toThrow();
      expect(() => desc.applyTo({}, null)).toThrow();
    });
  });

  describe('static methods', () => {
    describe('getData', () => {
      test('should return the value of a data property', () => {
        const obj = { a: 10 };
        expect(Descriptor.getData(obj, 'a')).toBe(10);
      });

      test('should return undefined for non-data properties', () => {
        const obj = {};
        Object.defineProperty(obj, 'prop', {
          get: () => 20,
          set: (value) => {}
        });
        expect(Descriptor.getData(obj, 'prop')).toBeNull();
      });
    });

    describe('getAccessor', () => {
      test('should return value of getter', () => {
        const obj = {
          get prop() { return 20 }
        };
        const accessedValue = Descriptor.getAccessor(obj, 'prop');
        expect(accessedValue).toBe(20)
      });

      test('should return value getter when dependent on an adajcent value', () => {
        const obj = {
          age: 21,
          get canDrink() { return this.age >= 21 }
        };
        const accessedValue = Descriptor.getAccessor(obj, 'canDrink');
        expect(accessedValue).toBe(true)
      });

      test('should return null for non-accessor properties', () => {
        const obj = { a: 10 };
        expect(Descriptor.getAccessor(obj, 'a')).toBeNull();
      });
    });

    describe('for', () => {
      test('should return a descriptor for a given object property', () => {
        const obj = { a: 10 };
        const descriptor = Descriptor.for(obj, 'a');
        expect(descriptor.value).toBe(10);
        expect(descriptor.writable).toBe(true);
        expect(descriptor.enumerable).toBe(true);
        expect(descriptor.configurable).toBe(true);
      });

      test('should return null for invalid inputs', () => {
        expect(Descriptor.for(null, 'a')).toBeNull();
        expect(Descriptor.for({}, Symbol())).toBeNull();
      });
    });

    describe('accessor', () => {
      test('should create an accessor descriptor', () => {
        const getter = () => 'get';
        const setter = (value) => { /* Do nothing */ };
        const descriptor = Descriptor.accessor(getter, setter);
        expect(descriptor.get).toBe(getter);
        expect(descriptor.set).toBe(setter);
        expect(descriptor.enumerable).toBe(false);
        expect(descriptor.configurable).toBe(false);
      });

      // Additional tests for variations in enumerable and configurable
    });

    describe('data', () => {
      test('should create a data descriptor', () => {
        const value = 10;
        const descriptor = Descriptor.data(value);
        expect(descriptor.value).toBe(value);
        expect(descriptor.writable).toBe(true);
        expect(descriptor.enumerable).toBe(false);
        expect(descriptor.configurable).toBe(false);
      });

      // Additional tests for variations in writable, enumerable, and configurable
    });

  });

  describe('Symbol methods', () => {
    test('Symbol.for("nodejs.util.inspect.custom") should return custom inspect info', () => {
      const desc = new Descriptor({ value: 10 });
      expect(typeof desc[Symbol.for('nodejs.util.inspect.custom')]).toBe('function');
    });

    test('Symbol.toPrimitive should handle different hints', () => {
      const dataDesc = new Descriptor({ value: 10 });
      const accessorDesc = new Descriptor({
        age: 18,
        get canDrink() { return this.age >= 21 },
        set canDrink(value) {
          if (value)
            this.age = Math.max(21, this.age)
          else
            this.age = Math.min(20, this.age)
        },
      }, 'canDrink')

      expect(dataDesc[Symbol.toPrimitive]('string')).toBe('Data (value)');
      dataDesc.writable = true
      expect(dataDesc[Symbol.toPrimitive]('string')).toBe('Data (value, writable)')
      expect(isNaN(dataDesc[Symbol.toPrimitive]('number'))).toBe(true);

      expect(accessorDesc[Symbol.toPrimitive]('string')).toBe(
        'Accessor (getter, setter)'
      )
      expect(accessorDesc[Symbol.toPrimitive]('number')).toBe(NaN)
      expect(accessorDesc.boundGet()).toBe(false)
      expect(accessorDesc.hasObject).toBe(true)
      expect(accessorDesc.set).toBeTruthy()
      accessorDesc.boundSet?.(true)
      expect(accessorDesc.boundGet()).toBe(true)
    });
  });

  describe('static properties', () => {
    test('SHARED_KEYS should contain expected keys', () => {
      expect(Descriptor.SHARED_KEYS).toEqual(['configurable', 'enumerable']);
    });

    test('ACCESSOR_KEYS should contain expected keys', () => {
      expect(Descriptor.ACCESSOR_KEYS).toEqual(['get', 'set']);
    });

    test('DATA_KEYS should contain expected keys', () => {
      expect(Descriptor.DATA_KEYS).toEqual(['value', 'writable']);
    });
  });

});
