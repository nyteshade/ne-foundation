import { Extension } from '@nejs/extension';
/**
 * The Iterable class is designed to provide a convenient way to create synchronous
 * iterable objects. It can be initialized with either an array or individual elements.
 * This class implements the iterable protocol, allowing instances to be used with
 * `for...of` loops and other standard JavaScript iteration mechanisms.
 */
export class Iterable {
    /**
     * Private field to store the elements of the iterable.
     * @private
     */
    #elements = [];
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
        if (elementsOrFirstElement != null &&
            typeof elementsOrFirstElement[Symbol.iterator] === 'function') {
            this.#elements = [...elementsOrFirstElement, ...moreElements];
        }
        else {
            this.#elements = [elementsOrFirstElement, ...moreElements];
        }
    }
    /**
     * Implements the iterable protocol. When an instance of Iterable is used
     * in a `for...of` loop or spread syntax, this generator function is invoked
     * to yield the elements one by one in a synchronous manner.
     *
     * @returns {Generator} A generator that yields each element of the iterable.
     */
    *[Symbol.iterator]() {
        for (const element of this.#elements) {
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
        return this.#elements;
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
/**
 * Being able to create a compliant `Iterator` around any type of iterable
 * object. This can be wrapped around any type of object that has a
 * `[Symbol.iterator]` property assigned to a generator function.
 */
export class Iterator {
    /**
     * A private function that when provided has the following signature:
     * `function mapEach(entry) -> entry`. This allows any changes to be made
     * to each element, conditionally and programmatically, as needed before
     * they are returned to the called code.
     */
    #mapEach = undefined;
    /**
     * Creates a new `Iterator` object instance.
     *
     * @param {object} iterable any object that has a `[Symbol.iterator]`
     * property assigned to a generator function.
     * @param {function} mapEach when provided `mapEach` is a callback that
     * takes an entry as input and receives one as output.
     */
    constructor(iterable, mapEach) {
        if (!iterable || !Reflect.has(iterable, Symbol.iterator)) {
            throw new TypeError('Value used to instantiate Iterator is not iterable');
        }
        this.#iterable = iterable;
        this.#iterator = iterable[Symbol.iterator]();
        this.#mapEach = typeof mapEach === 'function' ? mapEach : undefined;
    }
    /**
     * Returns a new `Array` derived from the iterable this object
     * wraps.
     *
     * @returns {array} a new `Array` generated from the wrapped
     * iterable. The method is generated from `Array.from()`
     */
    get asArray() {
        return Array.from(this.#iterable);
    }
    /**
     * Returns the actual iterable object passed to the constructor that
     * created this instance.
     *
     * @returns {object} the object containing the `[Symbol.iterator]`
     */
    get iterable() {
        return this.#iterable;
    }
    /**
     * The function retrieves the next value in the iterator. If the
     * the iterator has run its course, `reset()` can be invoked to
     * reset the pointer to the beginning of the iteration.
     *
     * @returns {any} the next value
     */
    next() {
        const input = this.#iterator.next();
        let output = input;
        if (output.done) {
            return { value: undefined, done: true };
        }
        else {
            if (this.#mapEach && typeof this.#mapEach === 'function') {
                output.value = this.#mapEach(input.value);
            }
            return { value: output.value, done: false };
        }
    }
    /**
     * Resets the iterator to the beginning allowing it to be
     * iterated over again.
     */
    reset() {
        this.#iterator = this.#iterable[Symbol.iterator]();
    }
    /**
     * The existence of this symbol on the object instances, indicates that
     * it can be used in `for(.. of ..)` loops and its values can be
     * extracted from calls to `Array.from()`
     *
     * @returns {Iterator} this is returned since this object is already
     * conforming to the expected JavaScript Iterator interface
     */
    [Symbol.iterator]() {
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
    /**
     * The object from which its iterator functionality is derived.
     *
     * @type {object}
     * @private
     */
    #iterable = null;
    /**
     * The results of a call to the iterable's `[Symbol.iterator]`
     * generator function.
     *
     * @type {object}
     * @private
     */
    #iterator = null;
}
export const IterableExtensions = new Extension(Iterable);
export const IteratorExtensions = new Extension(Iterator);
//# sourceMappingURL=iterable.js.map