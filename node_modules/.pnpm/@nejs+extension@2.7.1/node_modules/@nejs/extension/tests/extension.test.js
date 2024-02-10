const {
  Extension,
  Errors: {
    CannotBeExtendedError,
    MissingOwnerValue
  }
} = require('../dist/cjs/index.js')

describe('Extension class tests', () => {
  let originalObject;
  let extension;

  // Function to reset the object before each test
  const resetObject = () => {
    originalObject = { originalKey: 'originalValue' };
  };

  beforeEach(() => {
    resetObject();
  });

  test('successfully extends an object', () => {
    extension = new Extension('newKey', 'newValue', originalObject);
    extension.apply();

    expect(originalObject.newKey).toBe('newValue');
  });

  test('throws error when trying to extend a non-configurable property', () => {
    Object.defineProperty(originalObject, 'nonConfigurableKey', {
      value: 'immutableValue',
      configurable: false,
    });

    expect(() => {
      new Extension('nonConfigurableKey', 'newValue', originalObject);
    }).toThrow(CannotBeExtendedError);
  });

  test('reverts to the original state after extension and reversion', () => {
    extension = new Extension('newKey', 'newValue', originalObject);
    extension.apply();
    expect(originalObject.newKey).toBe('newValue');

    extension.revert();
    expect(originalObject.newKey).toBeUndefined();
    expect(originalObject).toEqual({ originalKey: 'originalValue' });
  });

  // Additional tests for other scenarios...
});
