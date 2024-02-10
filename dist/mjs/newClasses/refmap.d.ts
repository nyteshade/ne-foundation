/**
 * RefMap class extends the standard Map object to manage a collection of
 * WeakRef values mapped to strong keys. It provides additional functionality
 * such as objectification of values and various utility methods.
 *
 * Unlike standard Maps or Objects, RefMap stores weak references to objects,
 * allowing them to be garbage-collected if there are no other references to
 * them. This behavior is different from Maps and standard Objects, which
 * maintain strong references to their elements.
 *
 * @extends Map
 */
export class RefMap extends Map<any, any> {
    constructor(...args: any[]);
    /**
     * Method to control whether the RefMap should objectify its values. When
     * objectifying, primitive values (number, string, boolean, bigint) are
     * converted to their respective object types, which allows them to be used as
     * WeakRef targets.
     *
     * @param {boolean} setObjectification - Flag to enable or disable
     * objectification.
     * @returns {RefMap} - The current RefMap instance to allow method chaining.
     */
    objectifying(setObjectification?: boolean): RefMap;
    /**
     * Setting this value to true, will cause all set values to the Map to
     * be analyzed for validity as a candidate to be wrapped in a `WeakRef`
     * object. If true, and if possible, the object will be turned into an
     * `Object` variant first.
     *
     * @param {boolean} value - The new state to set for objectifyValues.
     */
    set objectifyValues(value: boolean);
    /**
     * Returns the state indicating whether or not `RefMap` will attempt to
     * convert non-valid primitives into targets that are valid input for
     * new `WeakRef` object instances. If this value is `false` then no
     * *objectification* will occur.
     *
     * @returns {boolean} The current state of objectifyValues.
     */
    get objectifyValues(): boolean;
    /**
     * The function converts a JavaScript Map object into a regular JavaScript
     * object, handling invalid keys by converting them to strings.
     *
     * @returns {object} an object; keys that are not either a `String` or a
     * `Symbol` will be converted to a string.
     */
    asObject(): object;
    /**
     * The `get` function retrieves a value from a map and returns it, or returns a
     * default value if the value is null or undefined. The actual retrieved value
     * is a dereferenced `WeakRef`. If the result is `undefined` and this is not the
     * expected response, it is likely the value has been garbage collected.
     *
     * @param {any} key - The key parameter is the key of the value you want to
     * retrieve from the data structure.
     * @param {any} defaultValue - The `defaultValue` parameter is the value that
     * will be returned if the key does not exist in the map or if the value
     * associated with the key has been garbage collected (i.e., it no longer
     * exists).
     * @returns The method is returning the value associated with the given key.
     * If the value is not found or if it has been garbage collected (deref()
     * returns null), then the defaultValue is returned.
     */
    get(key: any, defaultValue: any): any;
    /**
     * Overrides the set method of `Map`. Adds a value to the `RefMap`,
     * converting it to a `WeakRef`. Throws an error if the value is not a
     * valid `WeakRef` target (e.g., `null`, `undefined`, or a registered
     * `symbol`). If {@link objectifyValues} is enabled, an attempt to convert
     * primitives to their object variants will be made. These are `numbers`,
     * `strings`, `boolean` values and `bigint`s.
     *
     * @param {*} key - The `key` to be set on the `RefMap`
     * @param {*} value - The value to be associated with the `key`
     * @throws {TypeError} If the value is not a valid WeakRef target.
     */
    set(key: any, value: any): void;
    /**
     * Sets multiple values at a single time. The format is an array of array
     * or rather an array of {@link Object.entries} (for example,
     * `[[key1,value1], [key2,value2]]`). For each entry pair, if the length
     * is not 2, either missing a key or value, it will be skipped.
     *
     * @param {Iterable} values - An iterable of values to add to the RefMap.
     * @throws {TypeError} If the supplied values are falsey or non-iterable.
     * @returns {RepMap} returns `this` to allow for chaining
     */
    setAll(entries: any): RepMap;
    /**
     * Removes all elements from the RefMap that have been garbage collected
     * (i.e., their WeakRef no longer points to an object).
     *
     * @returns {RefMap} - The current RefMap instance to allow method chaining.
     */
    clean(): RefMap;
    /**
     * Executes a provided function once for each value in the RefMap. The callback
     * function receives the dereferenced value, the value again (as RefMap doesn't
     * use keys), and the RefMap itself. This method provides a way to iterate over
     * and apply operations to the values stored in the RefMap, taking into account
     * that they are weak references and may have been garbage-collected.
     *
     * @param {Function} forEachFn - Function to execute for each element. It
     * takes three arguments: element, element (again, as RefMap has no key), and
     * the RefMap itself.
     * @param {*} thisArg - Value to use as `this` when executing `forEachFn`.
     */
    entries(): Iterator;
    /**
     * Iterate over the items in the map and pass them to the supplied
     * function ala `Map.prototype.forEach`. Note however, there are no
     * indexes on Maps and as such, the index parameter of the callback
     * will always be the value's key. Subsequently the `array` or third
     * parameter will receive the map instance rather than an array.
     *
     * @param {function} forEachFn the function to use for each element in
     * the set.
     * @param {object} thisArg the `this` argument to be applied to each
     * invocation of the `forEachFn` callback. Note, this value is unable
     * to be applied if the `forEachFn` is a big arrow function
     */
    forEach(forEachFn: Function, thisArg: object): void;
    /**
     * Returns an iterator for the values in the RefMap. Each value is
     * dereferenced from its WeakRef before being returned. This method allows
     * iterating over he set's values, similar to how one would iterate over
     * values in a standard Map or Array, but with the understanding that the
     * values are weakly referenced and may no longer exist (in which case
     * they are skipped).
     *
     * @returns {Iterator} An iterator for the values.
     */
    values(): Iterator;
    /**
     * Determines whether an element with the specified value exists in the
     * `RefMap`. For non-objectified sets, this method checks if the dereferenced
     * values of the map include the specified value.
     *
     * For objectified sets, strict is set to false which uses loose
     * equality to allow for things like `Object(5)` to equal `5`. This is important
     * because otherwise primitives could not be weakly referenced. In the grand
     * scheme of things, this is only useful if the objectified value is the
     * one being referenced.
     *
     * @param {*} value - The value to check for presence in the RefMap.
     * @param {boolean} strict - if `true`, the default, then the supplied value
     * is hard compared to the dereferenced value (`===`). If `false`, then a
     * loose comparison is used (`==`)
     * @returns {boolean} - True if an element with the specified value exists
     * in the RefMap, false otherwise.
     */
    hasValue(value: any, strict?: boolean): boolean;
    /**
     * The `filter` function filters the entries of a `RefMap` object based on
     * a given filter function. The dereferenced entries of the values of the map
     * will be passed to the function rather than a `WeakRef` itself.
     *
     * A new resulting entry set will be generated and a new `RefMap` will be made
     * from these entries and returned. Note that this function never returns
     * `null`
     *
     * @param {function} filterFn - The `filterFn` parameter is a function that
     * will be used to filter the entries in the `RefMap`. It will be called with
     * three arguments: the value of the current entry, the key of the current
     * entry, and the `RefMap` itself. The function should return `true`
     * @param {object} thisArg - The `thisArg` parameter is an optional argument
     * that specifies the value to be used as `this` when executing the
     * `filterFn` function. It allows you to explicitly set the context in which
     * the `filterFn` function is called. If `thisArg` is not provided, `this
     * @returns {array} The `filter` method is returning an array of filtered map
     * entries
     */
    filter(filterFn: Function, thisArg: object): array;
    /**
     * The `find` function iterates over a map and calls a given function on
     * each value, returning the first value for which the function returns
     * a truthy value.
     *
     * The function signature of `findFn` is
     * ```
     * function findFn(value, key, map)
     * ```
     * 'value' is passed to findFn up to two times; first with the `WeakRef`
     * value, second with the result of {@link WeakRef.deref}. If `findFn`
     * returns true for either of these the dereferenced value will be
     * returned from the call to {@link RefMap.find}.
     * `key` represents the key object that the value is mapped to.
     * `map` is simply a reference to `this` map.
     *
     * @param findFn - `findFn` is a function that will be called for each
     * element in the map. It takes three arguments: `ref`, `key`, and `map`;
     * where `ref` is the value of the current element in the map, `key` is
     * the key of the current element, and `map` is a reference to the instance
     * being searched.
     * @param thisArg - The `thisArg` parameter is the value to be used as
     * the `this` value when executing the `findFn` function. It allows you
     * to specify the context in which the `findFn` function should be called.
     * @returns the first dereferenced value that satisfies the condition
     * specified by the `findFn` function. If no value satisfies the condition,
     * it returns `null`.
     */
    find(findFn: any, thisArg: any): any;
    /**
     * Creates a new array or `RefMap` with the results of calling a provided
     * function on every element in the calling `RefMap`. This method dereferences
     * each value, applies the `mapFn`, and collects the results. If `toRefMap` is
     * `true`, a new `RefMap` is returned; otherwise, an array. This method
     * differs from `Array.map` in handling weak references and the potential to
     * return a new `RefMap` instead of an array.
     *
     * @param {Function} mapFn - Function that produces an element of the new
     * array or `RefMap`, taking three arguments.
     * @param {*} thisArg - Value to use as this when executing mapFn.
     * @param {boolean} toRefMap - Determines if the output should be a new
     * `RefMap` (`true`) or an array (`false`).
     * @param {boolean} mirrorObjectification - If `true` and `toRefMap` is
     * `true`, the new `RefMap` mirrors the objectification setting of the
     * original.
     * @returns {Array|RefMap} - A new array or `RefMap` with each element being
     * the result of the `mapFn`.
     */
    map(mapFn: Function, thisArg: any, toRefMap: boolean, mirrorObjectification: boolean): any[] | RefMap;
    /**
     * The function returns an iterator that iterates over the entries of an object,
     * dereferencing any weak references.
     *
     * @returns {Iterator} A new iterator object is being returned.
     */
    [Symbol.iterator](): Iterator;
    #private;
}
export const RefMapExtensions: Extension;
import { Iterator } from './iterable.js';
import { Extension } from '@nejs/extension';
