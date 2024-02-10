/**
 * RefSet class extends the standard Set object to manage a collection of
 * WeakRef objects. It provides additional functionality such as objectification
 * of values and various utility methods.
 *
 * Unlike standard Sets or Arrays, RefSet stores weak references to objects,
 * allowing them to be garbage-collected if there are no other references to
 * them. This behavior is different from Arrays and standard Sets, which
 * maintain strong references to their elements.
 *
 * @extends Set
 */
export class RefSet extends Set<any> {
    constructor(values?: readonly any[] | null | undefined);
    constructor(iterable?: Iterable<any> | null | undefined);
    /**
     * Method to control whether the RefSet should objectify its values. When
     * objectifying, primitive values (number, string, boolean, bigint) are
     * converted to their respective object types, which allows them to be used as
     * WeakRef targets.
     *
     * @param {boolean} setObjectification - Flag to enable or disable
     * objectification.
     * @returns {RefSet} - The current RefSet instance to allow method chaining.
     */
    objectifying(setObjectification?: boolean): RefSet;
    /**
     * Setting this value to true, will cause all added values to the Set to
     * be analyzed for validity as a candidate to be wrapped in a `WeakRef`
     * object. If true, and if possible, the object will be turned into an
     * `Object` variant first. This will also enable less rigid variable
     * comparison in the `.has()` method (i.e. `==` instead of `===`).
     *
     * @param {boolean} value - The new state to set for objectifyValues.
     */
    set objectifyValues(value: boolean);
    /**
     * Returns the state indicating whether or not `RefSet` will attempt to
     * convert non-valid primitives into targets that are valid input for
     * new `WeakRef` object instances. If this value is `false` then no
     * *objectification* will occur.
     *
     * @returns {boolean} The current state of objectifyValues.
     */
    get objectifyValues(): boolean;
    /**
     * Overrides the add method of Set. Adds a value to the RefSet, converting it
     * to a WeakRef. Throws an error if the value is not a valid WeakRef target
     * (e.g., null, undefined, or a registered symbol). If `objectifyValues` is
     * enabled, an attempt to convert primitives to their object variants will be
     * made. These are numbers, strings, boolean values and big integers.
     *
     * @param {*} value - The value to be added to the RefSet.
     * @throws {TypeError} If the value is not a valid WeakRef target.
     */
    add(value: any): void;
    /**
     * Adds multiple values to the RefSet. The supplied `values` should be
     * iterable and truthy. This function defers to `.add()` for its logic so
     * each value from the supplied collection of values will also be subject
     * to the criteria of that function.
     *
     * @param {Iterable} values - An iterable of values to add to the RefSet.
     * @throws {TypeError} If the supplied values are falsey or non-iterable.
     */
    addAll(values: Iterable<any>): void;
    /**
     * Removes all elements from the RefSet that have been garbage collected
     * (i.e., their WeakRef no longer points to an object).
     *
     * @returns {RefSet} - The current RefSet instance to allow method chaining.
     */
    clean(): RefSet;
    /**
     * Executes a provided function once for each value in the RefSet. The callback
     * function receives the dereferenced value, the value again (as RefSet doesn't
     * use keys), and the RefSet itself. This method provides a way to iterate over
     * and apply operations to the values stored in the RefSet, taking into account
     * that they are weak references and may have been garbage-collected.
     *
     * @param {Function} forEachFn - Function to execute for each element. It
     * takes three arguments: element, element (again, as RefSet has no key), and
     * the RefSet itself.
     * @param {*} thisArg - Value to use as `this` when executing `forEachFn`.
     */
    entries(): any[][];
    /**
     * Iterate over the items in the set and pass them to the supplied
     * function ala `Array.prototype.forEach`. Note however, there are no
     * indexes on Sets and as such, the index parameter of the callback
     * will always be `NaN`. Subsequently the `array` or third parameter
     * will receive the set instance rather than an array.
     *
     * @param {function} forEachFn the function to use for each element in
     * the set.
     * @param {object} thisArg the `this` argument to be applied to each
     * invocation of the `forEachFn` callback. Note, this value is unable
     * to be applied if the `forEachFn` is a big arrow function
     */
    forEach(forEachFn: Function, thisArg: object): void;
    /**
     * Returns an iterator for the values in the RefSet. Each value is
     * dereferenced from its WeakRef before being returned. This method allows
     * iterating over he set's values, similar to how one would iterate over
     * values in a standard Set or Array, but with the understanding that the
     * values are weakly referenced and may no longer exist (in which case
     * they are skipped).
     *
     * @returns {Iterator} An iterator for the values.
     */
    values(): Iterator<any, any, undefined>;
    /**
     * Returns an iterator for the keys of the RefSet. In RefSet, keys and
     * values are identical, so this method behaves the same as `values()`. It
     * provides compatibility with the standard Set interface and allows use in
     * contexts where keys are expected, despite RefSet not differentiating
     * between keys and values.
     *
     * @returns {Iterator} An iterator for the keys.
     */
    keys(): Iterator<any, any, undefined>;
    /**
     * Checks if the RefSet contains a value that is equal to the specified
     * value. This method is used primarily in objectified RefSets to determine
     * the presence of a value, taking into account objectification. It differs
     * from the `has` method in that it's tailored for sets that have
     * transformed their primitive values into objects, whereas `has` is more
     * general-purpose.
     *
     * @param {*} value - The value to search for in the RefSet.
     * @returns {boolean} - True if the RefSet contains the value, false otherwise.
     */
    contains(value: any): boolean;
    /**
     * Creates a new array with all elements that pass the test implemented by
     * the provided function. This method iterates over each element,
     * dereferences it, and applies the filter function. Unlike Array `filter`,
     * the callback receives the dereferenced value and not an index or array,
     * reflecting the non-indexed nature of RefSet. Useful for selectively
     * creating arrays from the set based on certain conditions, especially when
     * dealing with weak references.
     *
     * @param {Function} filterFn - Function to test each element of the RefSet.
     * The function receives the dereferenced value.
     * @param {*} thisArg - Value to use as `this` when executing `filterFn`.
     * @returns {Array} - A new array with the elements that pass the test.
     */
    filter(filterFn: Function, thisArg: any): any[];
    /**
     * Returns the value of the first element in the RefSet that satisfies the
     * provided testing function. Similar to Array `find`, this method iterates
     * over the RefSet, dereferencing each value and applying the testing
     * function. The non-indexed nature of RefSet is considered, as the
     * callback does not receive an index. This method is useful for finding a
     * specific element based on a condition.
     *
     * @param {*} thisArg - Value to use as this when executing findFn.
     * @returns {*} - The value of the first element in the RefSet that satisfies
     * the testing function, or undefined if none found.
     * @returns {any} the dereferenced value if found, or undefined otherwise
     */
    find(findFn: any, thisArg: any): any;
    /**
     * Creates a new array or `RefSet` with the results of calling a provided
     * function on every element in the calling `RefSet`. This method dereferences
     * each value, applies the `mapFn`, and collects the results. If `toRefSet` is
     * `true`, a new `RefSet` is returned; otherwise, an array. This method
     * differs from `Array.map` in handling weak references and the potential to
     * return a new `RefSet` instead of an array.
     *
     * @param {Function} mapFn - Function that produces an element of the new
     * array or `RefSet`, taking three arguments.
     * @param {*} thisArg - Value to use as this when executing mapFn.
     * @param {boolean} toRefSet - Determines if the output should be a new
     * `RefSet` (`true`) or an array (`false`).
     * @param {boolean} mirrorObjectification - If `true` and `toRefSet` is
     * `true`, the new `RefSet` mirrors the objectification setting of the
     * original.
     * @returns {Array|RefSet} - A new array or `RefSet` with each element being
     * the result of the `mapFn`.
     */
    map(mapFn: Function, thisArg: any, toRefSet: boolean, mirrorObjectification: boolean): any[] | RefSet;
    #private;
}
export const RefSetExtensions: Extension;
import { Extension } from '@nejs/extension';
