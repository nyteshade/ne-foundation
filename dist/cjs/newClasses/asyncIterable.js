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
var _AsyncIterable_elements, _AsyncIterator_asyncIterable, _AsyncIterator_asyncIterator;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncIteratorExtensions = exports.AsyncIterableExtensions = exports.AsyncIterator = exports.AsyncIterable = void 0;
const extension_1 = require("@nejs/extension");
/**
 * The AsyncIterable class extends the concept of Iterable to asynchronous
 * operations. It allows creating iterable objects where each element can be
 * an asynchronous entity, like a Promise. This class is particularly useful
 * when dealing with asynchronous data sources, such as API responses, file
 * reading in chunks, or any other data that is not immediately available but
 * arrives over time.
 */
class AsyncIterable {
    /**
     * Constructs an instance of AsyncIterable. Similar to Iterable, it can be
     * initialized with either an iterable object, an async generator function,
     * or individual elements. The elements can be promises, direct values, or a
     * mix of both. If the first argument is an iterable or an async generator
     * function, the instance is initialized with the elements from the iterable
     * or the generated elements from the async generator function, followed by
     * any additional arguments. If the first argument is not an iterable or an
     * async generator function, all arguments are treated as individual elements.
     *
     * @param {Iterable|AsyncGeneratorFunction|Promise|*} elementsOrFirstElement -
     * An iterable object, an async generator function, a Promise, or the first
     * element.
     * @param {...Promise|*} moreElements - Additional elements if the first
     * argument is not an iterable or an async generator function.
     */
    constructor(elementsOrFirstElement, ...moreElements) {
        /**
         * Private field to store the elements of the async iterable.
         * @private
         */
        _AsyncIterable_elements.set(this, []);
        if (elementsOrFirstElement != null &&
            (typeof elementsOrFirstElement[Symbol.iterator] === 'function' ||
                typeof elementsOrFirstElement[Symbol.asyncIterator] === 'function')) {
            __classPrivateFieldSet(this, _AsyncIterable_elements, [...elementsOrFirstElement, ...moreElements], "f");
        }
        else if (typeof elementsOrFirstElement === 'function' &&
            elementsOrFirstElement.constructor.name === 'AsyncGeneratorFunction') {
            __classPrivateFieldSet(this, _AsyncIterable_elements, elementsOrFirstElement(), "f");
        }
        else {
            __classPrivateFieldSet(this, _AsyncIterable_elements, [elementsOrFirstElement, ...moreElements], "f");
        }
    }
    /**
     * Implements the async iterable protocol. When an instance of AsyncIterable
     * is used in a `for await...of` loop, this async generator function is
     * invoked. It yields each element as a Promise, allowing asynchronous
     * iteration. Elements that are not Promises are automatically wrapped in
     * a resolved Promise to ensure consistency.
     *
     * @returns {AsyncGenerator} An async generator that yields each element as
     * a Promise.
     */
    async *[(_AsyncIterable_elements = new WeakMap(), Symbol.asyncIterator)]() {
        for await (const element of __classPrivateFieldGet(this, _AsyncIterable_elements, "f")) {
            // No need to wrap as a promise here since `for await...of` can handle
            // both Promises and non-Promise values.
            yield element;
        }
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
     * Checks if a given value is an async iterable. This method determines if
     * the provided value has a `Symbol.asyncIterator` property that is an async
     * generator function. It's a precise way to identify if the value conforms
     * to the async iterable protocol using an async generator function.
     *
     * Note: This method specifically checks for async generator functions. Some
     * async iterables might use regular async functions that return an async
     * iterator, which this method won't identify.
     *
     * @param {*} value - The value to be checked for async iterability.
     * @returns {boolean} - Returns true if the value is an async iterable
     * implemented using an async generator function, false otherwise.
     */
    static isAsyncIterable(value) {
        const type = Object.prototype.toString.call(value?.[Symbol.asyncIterator]);
        return type === '[object AsyncGeneratorFunction]';
    }
}
exports.AsyncIterable = AsyncIterable;
/**
 * Being able to create a compliant `AsyncIterator` around any type of
 * iterable object. This can be wrapped around any type of object that
 * has a `[Symbol.asyncIterator]` property assigned to a generator
 * function.
 */
class AsyncIterator {
    /**
     * Creates a new `AsyncIterator` object instance.
     *
     * @param {object|AsyncGeneratorFunction} asyncIterable any object that has a
     * `[Symbol.asyncIterable]` property assigned to a generator function or an
     * async generator function itself.
     */
    constructor(asyncIterable) {
        /**
         * The object from which its iterator functionality is derived.
         *
         * @type {object}
         * @private
         */
        _AsyncIterator_asyncIterable.set(this, null);
        /**
         * The results of a call to the iterable's `[Symbol.asyncIterator]`
         * generator function.
         *
         * @type {object}
         * @private
         */
        _AsyncIterator_asyncIterator.set(this, null);
        if (typeof asyncIterable === 'function' &&
            asyncIterable.constructor.name === 'AsyncGeneratorFunction') {
            __classPrivateFieldSet(this, _AsyncIterator_asyncIterable, asyncIterable(), "f");
        }
        else if (!asyncIterable ||
            !Reflect.has(asyncIterable, Symbol.asyncIterator)) {
            throw new TypeError('Value used to instantiate AsyncIterator is not an async iterable');
        }
        else {
            __classPrivateFieldSet(this, _AsyncIterator_asyncIterable, asyncIterable, "f");
        }
        __classPrivateFieldSet(this, _AsyncIterator_asyncIterator, __classPrivateFieldGet(this, _AsyncIterator_asyncIterable, "f")[Symbol.asyncIterator](), "f");
    }
    /**
     * Returns a new `Array` derived from the iterable this object
     * wraps.
     *
     * @returns {array} a new `Array` generated from the wrapped
     * iterable. The method is generated from using an async for of
     * loop.
     */
    async asArray() {
        const array = [];
        for await (const value of this) {
            array.push(value);
        }
        return array;
    }
    /**
     * Returns the actual iterable object passed to the constructor that
     * created this instance.
     *
     * @returns {object} the object containing the `[Symbol.iterator]`
     */
    get asyncIterable() {
        return __classPrivateFieldGet(this, _AsyncIterator_asyncIterable, "f");
    }
    /**
     * The function retrieves the next value in the iterator. If the
     * the iterator has run its course, `reset()` can be invoked to
     * reset the pointer to the beginning of the iteration.
     *
     * @returns {any} the next value
     */
    async next() {
        const result = await __classPrivateFieldGet(this, _AsyncIterator_asyncIterator, "f").next();
        if (result.done) {
            return { value: undefined, done: true };
        }
        else {
            return { value: result.value, done: false };
        }
    }
    /**
     * Resets the async iterator to the beginning allowing it to be
     * iterated over again.
     */
    async reset() {
        __classPrivateFieldSet(this, _AsyncIterator_asyncIterator, __classPrivateFieldGet(this, _AsyncIterator_asyncIterable, "f")[Symbol.asyncIterator](), "f");
    }
    /**
     * The existence of this symbol on the object instances, indicates that
     * it can be used in `for(.. of ..)` loops and its values can be
     * extracted from calls to `Array.from()`
     *
     * @returns {AsyncIterable} this is returned since this object is already
     * conforming to the expected JavaScript AsyncIterator interface
     */
    [(_AsyncIterator_asyncIterable = new WeakMap(), _AsyncIterator_asyncIterator = new WeakMap(), Symbol.asyncIterator)]() {
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
exports.AsyncIterator = AsyncIterator;
exports.AsyncIterableExtensions = new extension_1.Extension(AsyncIterable);
exports.AsyncIteratorExtensions = new extension_1.Extension(AsyncIterator);
//# sourceMappingURL=asyncIterable.js.map