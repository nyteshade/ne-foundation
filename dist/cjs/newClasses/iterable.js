"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Iterable_elements, _Iterator_mapEach, _Iterator_iterable, _Iterator_iterator;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IteratorExtensions = exports.IterableExtensions = exports.Iterator = exports.Iterable = void 0;
const extension_1 = require("@nejs/extension");
/**
 * The Iterable class is designed to provide a convenient way to create synchronous
 * iterable objects. It can be initialized with either an array or individual elements.
 * This class implements the iterable protocol, allowing instances to be used with
 * `for...of` loops and other standard JavaScript iteration mechanisms.
 */
class Iterable {
    /**
     * Constructs an instance of Iterable. It can be initialized with either an
     * iterable object (such as an array, Set, Map, string, or any object
     * implementing the iterable protocol) or individual elements. If the first
     * argument is an iterable, the class instance is initialized with the
     * elements from the iterable, followed by any additional arguments. If the
     * first argument is not an iterable, all arguments are treated as individual
     * elements.
     *
     * @param {Iterable|*} elementsOrFirstElement - An iterable object or the
     * first element.
     * @param {...*} moreElements - Additional elements if the first argument is
     * not an iterable.
     */
    constructor(elementsOrFirstElement, ...moreElements) {
        /**
         * Private field to store the elements of the iterable.
         * @private
         */
        _Iterable_elements.set(this, []);
        if (elementsOrFirstElement != null &&
            typeof elementsOrFirstElement[Symbol.iterator] === 'function') {
            __classPrivateFieldSet(this, _Iterable_elements, [...elementsOrFirstElement, ...moreElements], "f");
        }
        else {
            __classPrivateFieldSet(this, _Iterable_elements, [elementsOrFirstElement, ...moreElements], "f");
        }
    }
    /**
     * Implements the iterable protocol. When an instance of Iterable is used
     * in a `for...of` loop or spread syntax, this generator function is invoked
     * to yield the elements one by one in a synchronous manner.
     *
     * @returns {Generator} A generator that yields each element of the iterable.
     */
    *[(_Iterable_elements = new WeakMap(), Symbol.iterator)]() {
        for (const element of __classPrivateFieldGet(this, _Iterable_elements, "f")) {
            yield element;
        }
    }
    /**
     * Provides access to the elements as a standard array. Useful for scenarios
     * where array methods and behaviors are needed.
     *
     * @returns {Array} An array containing all the elements of the iterable.
     */
    get asArray() {
        return __classPrivateFieldGet(this, _Iterable_elements, "f");
    }
    /**
     * Ensures that the constructor of this object instance's name
     * is returned if the string tag for this instance is queried
     *
     * @returns {string} the name of the class
     */
    get [Symbol.toStringTag]() {
        return this.constructor.name;
    }
    /**
     * Checks if a given value is an iterable. This method determines if the
     * provided value has a `Symbol.iterator` property that is a generator
     * function. It's a precise way to identify if the value conforms to the
     * iterable protocol using a generator function.
     *
     * Note: This method specifically checks for generator functions. Some
     * iterables might use regular functions that return an iterator, which
     * this method won't identify.
     *
     * @param {*} value - The value to be checked for iterability.
     * @returns {boolean} - Returns true if the value is an iterable implemented
     * using a generator function, false otherwise.
     */
    static isIterable(value) {
        const type = Object.prototype.toString.call(value?.[Symbol.iterator]);
        return type === '[object GeneratorFunction]';
    }
}
exports.Iterable = Iterable;
/**
 * Being able to create a compliant `Iterator` around any type of iterable
 * object. This can be wrapped around any type of object that has a
 * `[Symbol.iterator]` property assigned to a generator function.
 */
class Iterator {
    /**
     * Creates a new `Iterator` object instance.
     *
     * @param {object} iterable any object that has a `[Symbol.iterator]`
     * property assigned to a generator function.
     * @param {function} mapEach when provided `mapEach` is a callback that
     * takes an entry as input and receives one as output.
     */
    constructor(iterable, mapEach) {
        /**
         * A private function that when provided has the following signature:
         * `function mapEach(entry) -> entry`. This allows any changes to be made
         * to each element, conditionally and programmatically, as needed before
         * they are returned to the called code.
         */
        _Iterator_mapEach.set(this, undefined
        /**
         * Creates a new `Iterator` object instance.
         *
         * @param {object} iterable any object that has a `[Symbol.iterator]`
         * property assigned to a generator function.
         * @param {function} mapEach when provided `mapEach` is a callback that
         * takes an entry as input and receives one as output.
         */
        );
        /**
         * The object from which its iterator functionality is derived.
         *
         * @type {object}
         * @private
         */
        _Iterator_iterable.set(this, null);
        /**
         * The results of a call to the iterable's `[Symbol.iterator]`
         * generator function.
         *
         * @type {object}
         * @private
         */
        _Iterator_iterator.set(this, null);
        if (!iterable || !Reflect.has(iterable, Symbol.iterator)) {
            throw new TypeError('Value used to instantiate Iterator is not iterable');
        }
        __classPrivateFieldSet(this, _Iterator_iterable, iterable, "f");
        __classPrivateFieldSet(this, _Iterator_iterator, iterable[Symbol.iterator](), "f");
        __classPrivateFieldSet(this, _Iterator_mapEach, typeof mapEach === 'function' ? mapEach : undefined, "f");
    }
    /**
     * Returns a new `Array` derived from the iterable this object
     * wraps.
     *
     * @returns {array} a new `Array` generated from the wrapped
     * iterable. The method is generated from `Array.from()`
     */
    get asArray() {
        return Array.from(__classPrivateFieldGet(this, _Iterator_iterable, "f"));
    }
    /**
     * Returns the actual iterable object passed to the constructor that
     * created this instance.
     *
     * @returns {object} the object containing the `[Symbol.iterator]`
     */
    get iterable() {
        return __classPrivateFieldGet(this, _Iterator_iterable, "f");
    }
    /**
     * The function retrieves the next value in the iterator. If the
     * the iterator has run its course, `reset()` can be invoked to
     * reset the pointer to the beginning of the iteration.
     *
     * @returns {any} the next value
     */
    next() {
        const input = __classPrivateFieldGet(this, _Iterator_iterator, "f").next();
        let output = input;
        if (output.done) {
            return { value: undefined, done: true };
        }
        else {
            if (__classPrivateFieldGet(this, _Iterator_mapEach, "f") && typeof __classPrivateFieldGet(this, _Iterator_mapEach, "f") === 'function') {
                output.value = __classPrivateFieldGet(this, _Iterator_mapEach, "f").call(this, input.value);
            }
            return { value: output.value, done: false };
        }
    }
    /**
     * Resets the iterator to the beginning allowing it to be
     * iterated over again.
     */
    reset() {
        __classPrivateFieldSet(this, _Iterator_iterator, __classPrivateFieldGet(this, _Iterator_iterable, "f")[Symbol.iterator](), "f");
    }
    /**
     * The existence of this symbol on the object instances, indicates that
     * it can be used in `for(.. of ..)` loops and its values can be
     * extracted from calls to `Array.from()`
     *
     * @returns {Iterator} this is returned since this object is already
     * conforming to the expected JavaScript Iterator interface
     */
    [(_Iterator_mapEach = new WeakMap(), _Iterator_iterable = new WeakMap(), _Iterator_iterator = new WeakMap(), Symbol.iterator)]() {
        return this;
    }
    /**
     * Ensures that the constructor of this object instance's name
     * is returned if the string tag for this instance is queried
     *
     * @returns {string} the name of the class
     */
    get [Symbol.toStringTag]() {
        return this.constructor.name;
    }
}
exports.Iterator = Iterator;
exports.IterableExtensions = new extension_1.Extension(Iterable);
exports.IteratorExtensions = new extension_1.Extension(Iterator);
//# sourceMappingURL=iterable.js.map