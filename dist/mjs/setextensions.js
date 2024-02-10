import { Patch } from '@nejs/extension';
export const SetPrototypeExtensions = new Patch(Set.prototype, {
    /**
     * Merges multiple iterables into the set. Each element from the iterables
     * is added to the set, ensuring uniqueness of all elements. This method
     * mutates the original set.
     *
     * @param {...Iterable} iterables - One or more iterable objects (like Set
     * or Array) whose elements will be added to the set.
     */
    concat(...iterables) {
        for (const iterable of iterables) {
            if (typeof iterable === 'string' ||
                !Reflect.has(iterable, Symbol.iterator)) {
                this.add(iterable);
                continue;
            }
            for (const element of iterable) {
                this.add(element);
            }
        }
    },
    /**
     * Checks to see if any value within the `Set` loosely equals the supplied
     * value.
     *
     * @param {*} value any value that might be loosely equal to an item in the
     * set, as opposed to {@link Set.has} which is the equivalent of a strict or
     * triple equals (`===`) check
     * @returns {boolean} `true` if any value within the set is loosely equal to
     * the supplied value, `false` otherwise
     */
    contains(value) {
        for (const element of this) {
            if (value == element) {
                return true;
            }
        }
        return false;
    },
    /**
     * Checks if every element in the set passes the test implemented by the
     * provided function. The function is called with each element of the set.
     * Note: Since sets do not have indices, the index parameter is always NaN.
     *
     * @param {Function} everyFn - The function to test each element. Receives
     * the element, index (always NaN), and the set itself.
     * @param {Object} [thisArg] - Optional. Value to use as `this` when executing
     * `everyFn`.
     * @throws {TypeError} If `everyFn` is not a function.
     * @returns {boolean} True if every element passes the test, false otherwise.
     */
    every(everyFn, thisArg) {
        if (typeof everyFn !== 'function') {
            throw new TypeError(`everyFn must be a function! Received ${String(everyFn)}`);
        }
        let found = 0;
        for (const element of this) {
            if (everyFn.call(thisArg, element, NaN, this)) {
                found++;
            }
        }
        return (found === this.size);
    },
    /**
     * Finds the first element in the set satisfying the provided testing
     * function. If no elements satisfy the testing function, undefined is
     * returned. The function is called with each element of the set.
     * Note: Since sets do not have indices, the index parameter is always NaN.
     *
     * @param {Function} findFn - The function to execute on each element. It
     * receives the element, index (always NaN), and the set itself.
     * @param {Object} [thisArg] - Optional. Value to use as `this` when executing
     * `findFn`.
     * @throws {TypeError} If `findFn` is not a function.
     * @returns {*} The first element that satisfies `findFn`, or undefined.
     */
    find(findFn, thisArg) {
        if (typeof findFn !== 'function') {
            throw new TypeError(`findFn must be a function! Received ${String(findFn)}`);
        }
        for (const element of this) {
            const match = findFn.call(thisArg, element, NaN, this);
            if (match) {
                return element;
            }
        }
        return undefined;
    },
    /**
     * Finds the last element in the set satisfying the provided testing function.
     * If no elements satisfy the testing function, undefined is returned. The
     * function is called with each element of the set in reverse order.
     * Note: Since sets do not have indices, the index parameter is always NaN.
     *
     * @param {Function} findFn - The function to execute on each element. It
     * receives the element, index (always NaN), and the set itself.
     * @param {Object} [thisArg] - Optional. Value to use as `this` when executing
     * `findFn`.
     * @throws {TypeError} If `findFn` is not a function.
     * @returns {*} The last element that satisfies `findFn`, or undefined.
     */
    findLast(findFn, thisArg) {
        if (typeof findFn !== 'function') {
            throw new TypeError(`findFn must be a function! Received ${String(findFn)}`);
        }
        const found = [];
        for (const element of this) {
            const match = findFn.call(thisArg, element, NaN, this);
            if (match) {
                found.push(element);
            }
        }
        if (found.length) {
            return found[found.length - 1];
        }
        return undefined;
    },
    /**
     * A getter property that returns the number of elements in the set.
     * This is an alias for the `size` property of the set.
     *
     * @returns {number} The number of elements in the set.
     */
    get length() {
        return this.size;
    },
    /**
     * Creates a new array populated with the results of calling the provided
     * function on every element in the set. The function is called with each
     * element of the set. Note: Since sets do not have indices, the index
     * parameter is always NaN.
     *
     * @param {Function} mapFn - The function to execute on each element. It
     * receives the element, index (always NaN), and the set itself.
     * @param {Object} [thisArg] - Optional. Value to use as `this` when executing
     * `mapFn`.
     * @throws {TypeError} If `mapFn` is not a function.
     * @returns {Array} A new array with each element being the result of the
     * `mapFn`.
     */
    map(mapFn, thisArg) {
        if (typeof mapFn !== 'function') {
            throw new TypeError(`mapFn must be a function! Received ${String(mapFn)}`);
        }
        const transformed = [];
        for (const element of this) {
            transformed.push(mapFn.call(thisArg, element, NaN, this));
        }
        return transformed;
    },
    /**
     * Applies a function against an accumulator and each element in the set to
     * reduce it to a single value. The function is called with each element of
     * the set. Note: Since sets do not have indices, the index parameter is
     * always NaN.
     *
     * @param {Function} reduceFn - The function to execute on each element. It
     * receives the accumulator, element, index (always NaN), and the set itself.
     * @param {*} initialValue - The initial value to start reducing from.
     * @param {Object} [thisArg] - Optional. Value to use as `this` when executing
     * `reduceFn`.
     * @throws {TypeError} If `reduceFn` is not a function.
     * @returns {*} The reduced value.
     */
    reduce(reduceFn, initialValue, thisArg) {
        if (typeof reduceFn !== 'function') {
            throw new TypeError(`reduceFn must be a Function! Received ${String(reduceFn)}`);
        }
        let accumulator = initialValue;
        for (const element of this) {
            accumulator = reduceFn.call(thisArg, accumulator, element, NaN, this);
        }
        return accumulator;
    },
    /**
     * Tests whether at least one element in the set passes the test implemented
     * by the provided function. The function is called with each element of the
     * set. Note: Since sets do not have indices, the index parameter is always NaN.
     *
     * @param {Function} someFn - The function to test each element. It receives
     * the element, index (always NaN), and the set itself.
     * @param {Object} [thisArg] - Optional. Value to use as `this` when executing
     * `someFn`.
     * @throws {TypeError} If `someFn` is not a function.
     * @returns {boolean} True if at least one element passes the test, false
     * otherwise.
     */
    some(someFn, thisArg) {
        if (typeof someFn !== 'function') {
            throw new TypeError(`someFn must be a function! Received ${String(someFn)}`);
        }
        for (const element of this) {
            if (someFn.call(thisArg, element, NaN, this)) {
                return true;
            }
        }
        return false;
    },
});
//# sourceMappingURL=setextensions.js.map