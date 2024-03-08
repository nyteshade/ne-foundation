export class Callable {
  /**
   * Constructs a `Callable` object that wraps a function or an object's method
   * with a `Proxy` to enable custom behavior when the function is called.
   *
   * @param {Object} object - The object to which the callable is bound.
   * @param {Function|string} callablePropertyOrFunction - The function or the
   *        name of the method in the object to be called.
   * @throws {Error} If the first parameter is not an object or if the specified
   *         callable is not a function or a valid method of the object.
   * @returns {Proxy} A proxy that wraps the callable for custom behavior.
   *
   * @example
   * // For a method in an object
   * const obj = {
   *   greet() {
   *     console.log('Hello, world!');
   *   }
   * };
   * const callable = new Callable(obj, 'greet');
   * callable(); // Outputs: Hello, world!
   *
   * @example
   * // For a standalone function
   * function greet() {
   *   console.log('Hello, world!');
   * }
   * const callable = new Callable({}, greet);
   * callable(); // Outputs: Hello, world!
   */
  constructor(object, callablePropertyOrFunction) {
    this.targetFunction = undefined;

    // Validate that the first parameter is an object
    if (Object(object) !== object) {
      throw new Error('Supplied object parameter must be an object.');
    }

    // Determine if the callable is a function or a method of the object
    if (typeof callablePropertyOrFunction !== 'function') {
      // Attempt to retrieve the method from the object
      this.targetFunction = object[callablePropertyOrFunction];
      if (!this.targetFunction) {
        throw new Error('Cannot find function to invoke when object is called.');
      }
    } else {
      // Directly use the provided function
      this.targetFunction = callablePropertyOrFunction;
    }

    // Store the object to bind the callable to
    this.handler = object;

    // Create and return a proxy that wraps the callable
    return new Proxy((...args) => this.targetFunction.apply(
      this.handler,
      args
    ), this.#proxyTraps(this.handler, this.targetFunction));
  }

  #proxyTraps(handler, actualCallable) {
    return {
      /**
       * Traps the `get` operation on the proxy object.
       *
       * This trap is invoked when a property is accessed on the proxy object.
       * It uses the `Reflect.get` method to retrieve the property value from
       * the `handler` object, ensuring that the correct rules of JavaScript
       * property access are followed, such as invoking getters if they exist.
       *
       * @param {Object} target - The target object for the proxy (unused).
       * @param {string|Symbol} property - The name or Symbol of the property
       *                                   to get.
       * @param {Object} receiver - The proxy or an object that inherits from
       *                            the proxy.
       * @returns {*} The value of the property from the `handler` object.
       *
       * @example
       * // Assuming `callableProxy` is an instance of a class that uses this
       * // proxy trap and `handler` has a property `exampleProperty`:
       * const value = callableProxy.exampleProperty;
       * // `value` is the value of `exampleProperty` from `handler`.
       */
      get(_, property, receiver) {
        return Reflect.get(handler, property, receiver);
      },

      /**
       * Traps the `set` operation on the proxy object.
       *
       * This trap is invoked when a property value is set on the proxy object.
       * It uses the `Reflect.set` method to accurately assign the value to the
       * `handler` object, ensuring that the correct rules of JavaScript are
       * followed, such as invoking setters if they exist.
       *
       * @param {Object} target - The target object for the proxy (unused).
       * @param {string} property - The name of the property to set.
       * @param {*} value - The new value to set on the property.
       * @param {Object} receiver - The proxy or an object that inherits from the
       *                            proxy.
       * @returns {boolean} True if the property was successfully set, false
       *                    otherwise.
       *
       * @example
       * // Assuming `callableProxy` is an instance of a class that uses this
       * // proxy trap and `handler` is the object being proxied:
       * callableProxy.someProperty = 'newValue';
       * // This sets `someProperty` on `handler` to 'newValue'.
       */
      set(_, property, value, receiver) {
        return Reflect.set(handler, property, value, receiver);
      },

      /**
       * Traps the `in` operator to check for property existence.
       *
       * This trap is invoked when the `in` operator is used to determine if a
       * property exists on the proxy object. It delegates the operation to the
       * `handler` object to check for the property's existence.
       *
       * @param {Object} target - The target object for the proxy.
       * @param {string} property - The name of the property to check for.
       * @returns {boolean} True if the property exists on the `handler` object,
       *                    false otherwise.
       *
       * @example
       * // Assuming `callableProxy` is an instance of a class that uses this
       * // proxy trap and `handler` has a property `exampleProperty`:
       * const hasProperty = 'exampleProperty' in callableProxy;
       * // `hasProperty` is true if `exampleProperty` exists on `handler`.
       */
      has(_, property) {
        return Reflect.has(handler, property);
      },

      /**
       * Traps the `deleteProperty` operation on the proxy object.
       *
       * This trap is invoked when a property is attempted to be deleted from
       * the proxy object using the `delete` operator. It delegates the deletion
       * to the `handler` object's property.
       *
       * @param {Object} target - The target object for the proxy.
       * @param {string} property - The name of the property to delete.
       * @returns {boolean} True if the property was successfully deleted,
       *                     false otherwise.
       *
       * @example
       * // Assuming `callableProxy` is an instance of a class that uses this
       * // proxy trap and `handler` has a property `exampleProperty`:
       * delete callableProxy.exampleProperty;
       * // The `exampleProperty` is deleted from `handler`.
       */
      deleteProperty(target, property) {
        return Reflect.deleteProperty(this.handler, property);
      },

      /**
       * Traps the `Function.prototype.apply` method calls on the proxy object.
       * This trap is invoked when the proxy is called as a function using the
       * `apply` method. It delegates the call to the actual callable function
       * or method stored in the `actualCallable` variable, using the provided
       * `thisArg` as the `this` value, or the `handler` if `thisArg` is not
       * provided.
       *
       * @param {Object} target - The target object for the proxy.
       * @param {Object} thisArg - The `this` argument for the call.
       * @param {Array} argumentsList - The list of arguments for the call.
       * @returns {*} The result of calling the `actualCallable`.
       *
       * @example
       * // Assuming `callableProxy` is an instance of a class that uses this
       * // proxy trap and `myFunction` is the `actualCallable`:
       * const result = callableProxy.apply(null, [arg1, arg2]);
       * // `result` is the return value of `myFunction(arg1, arg2)`.
       */
      apply(_, thisArg, argumentsList) {
        return actualCallable.call(handler || thisArg, ...argumentsList);
      },

      /**
       * Traps the `new` operator to create an instance of the `actualCallable`.
       * This trap is invoked when the proxy is used with the `new` operator.
       *
       * @param {Object} target - The target object for the proxy.
       * @param {Array} argumentsList - The list of arguments to pass to the
       *                                constructor of `actualCallable`.
       * @param {Function} newTarget - The constructor that was originally called.
       * @returns {Object} An instance of `actualCallable` created with the given
       *                   arguments.
       *
       * @example
       * // Assuming `callableProxy` is an instance of a class that uses this
       * // proxy trap and `MyClass` is the `actualCallable`:
       * const instance = new callableProxy(arg1, arg2);
       * // `instance` is an instance of `MyClass` created with `arg1` and `arg2`.
       */
      construct(_, argumentsList, newTarget) {
        return new actualCallable(...argumentsList);
      },

      /**
       * Traps the `Object.getPrototypeOf()` method to retrieve the prototype of
       * the proxy's handler object.
       *
       * This trap is called when `Object.getPrototypeOf()` is invoked on the
       * proxy object. It allows access to the prototype of the handler object,
       * which can be useful for checking inheritance or accessing prototype
       * methods.
       *
       * @param {Object} target - The target object for the proxy.
       * @returns {Object} The prototype of the handler object.
       *
       * @example
       * // Assuming `callableProxy` is an instance of a class that uses this
       * // proxy trap and `handler` is the internal handler object:
       * const handlerPrototype = Object.getPrototypeOf(callableProxy);
       * // `handlerPrototype` will be the prototype of the `handler` object.
       */
      getPrototypeOf(_) {
        return Reflect.getPrototypeOf(handler);
      },

      /**
       * Traps the `Object.setPrototypeOf()` method to set the prototype of the
       * proxy's handler object.
       *
       * This trap is called when `Object.setPrototypeOf()` is invoked on the
       * proxy object. It allows changing the prototype of the handler object
       * to a new object, effectively changing the inheritance chain.
       *
       * @param {Object} target - The target object for the proxy.
       * @param {Object} prototype - The new prototype object.
       * @returns {boolean} A boolean indicating whether the prototype was
       * successfully set.
       *
       * @example
       * // Assuming `callableProxy` is an instance of a class that uses this
       * // proxy trap and `handler` is the internal handler object:
       * const newProto = { someMethod() {} };
       * const result = Object.setPrototypeOf(callableProxy, newProto);
       * // `result` will be `true` if the prototype was successfully set.
       */
      setPrototypeOf(_, prototype) {
        return Reflect.setPrototypeOf(handler, prototype);
      },

      /**
       * Traps the `Object.isExtensible()` method to determine if the proxy's
       * handler object is extensible, meaning properties can still be added to it.
       *
       * This trap is called when `Object.isExtensible()` is invoked on the
       * proxy object. It allows checking whether new properties can be added
       * to the handler object or not.
       *
       * @param {Object} target - The target object for the proxy.
       * @returns {boolean} A boolean indicating whether the handler object
       * is extensible.
       *
       * @example
       * // Assuming `callableProxy` is an instance of a class that uses this
       * // proxy trap and `handler` is the internal handler object:
       * const canExtend = Object.isExtensible(callableProxy);
       * // `canExtend` will be `true` if properties can still be added to
       * // the `handler` object.
       */
      isExtensible(target) {
        return Reflect.isExtensible(handler);
      },

      /**
       * Traps the `Object.preventExtensions()` method to prevent new properties
       * from being added to the proxy's handler object.
       *
       * This trap is called when `Object.preventExtensions()` is invoked on
       * the proxy object. It ensures that no new properties can be added to
       * the handler object, effectively making it non-extensible.
       *
       * @param {Object} target - The target object for the proxy.
       * @returns {boolean} A boolean indicating whether the handler object
       * was successfully made non-extensible.
       *
       * @example
       * // Assuming `callableProxy` is an instance of a class that uses this
       * // proxy trap and `handler` is the internal handler object:
       * const result = Object.preventExtensions(callableProxy);
       * // `result` will be `true` if `handler` was successfully made
       * // non-extensible.
       */
      preventExtensions(target) {
        return Reflect.preventExtensions(handler);
      },

      /**
       * Traps the `Object.getOwnPropertyDescriptor()` method to retrieve the
       * property descriptor for a specific property on the proxy target.
       *
       * This trap is called when `Object.getOwnPropertyDescriptor()` is
       * invoked on the proxy object. It allows the retrieval of the
       * descriptor for a specific property, which includes attributes like
       * value, writability, enumerability, and configurability.
       *
       * @param {Object} target - The target object for the proxy.
       * @param {string | Symbol} property - The name or Symbol of the property
       * whose descriptor is to be retrieved.
       * @returns {PropertyDescriptor | undefined} The property descriptor of
       * the specified property if it exists on the target object, otherwise
       * `undefined`.
       *
       * @example
       * // Assuming `callableProxy` is an instance of a class that uses this
       * // proxy trap and `handler` is the internal handler object:
       * const descriptor = Object.getOwnPropertyDescriptor(
       *   callableProxy,
       *   'prop'
       * );
       * // `descriptor` will contain the property descriptor of 'prop' if it
       * // exists on the `handler` object.
       */
      getOwnPropertyDescriptor(target, property) {
        return Object.getOwnPropertyDescriptor(target, property);
      },

      /**
       * Defines a property on the proxy handler object.
       *
       * This trap is called internally by Object.defineProperty() and similar
       * methods when they are invoked on the proxy object. It allows the
       * definition of new properties or modification of existing ones on the
       * proxy's handler object.
       *
       * @param {Object} target - The target object for the proxy.
       * @param {string | Symbol} property - The name or Symbol of the property
       * to define.
       * @param {Object} descriptor - The descriptor for the property being
       * defined or modified. This object must follow the ECMAScript standard
       * for property descriptors.
       * @returns {boolean} A boolean indicating whether or not the property
       * was successfully defined.
       *
       * @example
       * // Assuming `callableProxy` is an instance of a class that uses this
       * // proxy trap and `handler` is the internal handler object:
       * Object.defineProperty(callableProxy, 'newProp', {
       *   value: 42,
       *   writable: true,
       *   enumerable: true,
       *   configurable: true
       * });
       * // The property 'newProp' is now defined on the `handler` object with
       * // the value 42.
       */
      defineProperty(target, property, descriptor) {
        return Reflect.defineProperty(handler, property, descriptor);
      },

      /**
       * Traps the `ownKeys` operation which is called when Object.keys(),
       * Object.getOwnPropertyNames(), or Object.getOwnPropertySymbols() are
       * used. This method intercepts these calls and returns the list of
       * own property keys of the proxy target.
       *
       * @param {Object} target - The target object for the proxy.
       * @returns {Array} An array of the target object's own property keys.
       *
       * @example
       * // Assuming `callableInstance` is an instance of a class that uses
       * // this proxy trap:
       * const keys = Object.keys(callableInstance);
       * // `keys` will contain all own property keys of `callableInstance`.
       */
      ownKeys(target) {
        return Reflect.ownKeys(handler);
      }
    }
  }

  /**
   * A getter for the default string description of the object, which is used
   * in the object-to-string conversion process. It is accessed internally
   * by the `Object.prototype.toString` method.
   *
   * @returns {string} The name of the object if available, the name of the
   * constructor if the object name is not available, or the string 'Callable'
   * as a default value.
   *
   * @example
   * // If the object has a name property
   * const callable = new Callable();
   * callable.object = { name: 'MyCallable' };
   * console.log(Object.prototype.toString.call(callable));
   * // expected output: "[object MyCallable]"
   *
   * @example
   * // If the object does not have a name property, but its constructor does
   * const callable = new Callable();
   * callable.object = new (class SomeCallable {});
   * console.log(Object.prototype.toString.call(callable));
   * // expected output: "[object SomeCallable]"
   *
   * @example
   * // If neither the object nor its constructor have a name property
   * const callable = new Callable();
   * console.log(Object.prototype.toString.call(callable));
   * // expected output: "[object Callable]"
   */
  get [Symbol.toStringTag]() {
    return this.object?.name ?? this.object?.constructor.name ?? 'Callable';
  }
}