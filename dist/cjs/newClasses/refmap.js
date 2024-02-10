"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _RefMap_objectifyValues;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefMapExtensions = exports.RefMap = void 0;
const extension_1 = require("@nejs/extension");
const objectextensions_js_1 = require("../objectextensions.js");
const symbolextensions_js_1 = require("../symbolextensions.js");
const weakrefextensions_js_1 = require("../weakrefextensions.js");
const iterable_js_1 = require("./iterable.js");
const { isObject, isNullDefined, isValidKey } = objectextensions_js_1.ObjectExtensions.patches;
const { isRegistered } = symbolextensions_js_1.SymbolExtensions.patches;
const { isValidReference } = weakrefextensions_js_1.WeakRefExtensions.patches;
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
class RefMap extends Map {
    constructor(...args) {
        super(...args);
        /**
         * Private field to track whether the RefMap should objectify primitive
         * values.
         *
         * @private
         */
        _RefMap_objectifyValues.set(this, false);
    }
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
    objectifying(setObjectification = true) {
        this.objectifyValues = setObjectification;
        return this;
    }
    /**
     * The function converts a JavaScript Map object into a regular JavaScript
     * object, handling invalid keys by converting them to strings.
     *
     * @returns {object} an object; keys that are not either a `String` or a
     * `Symbol` will be converted to a string.
     */
    asObject() {
        const object = {};
        for (const [key, value] of this) {
            const useKey = isValidKey(key) ? key : String(key);
            const useValue = value?.valueOf() || value;
            object[useKey] = useValue;
        }
        return object;
    }
    /**
     * Returns the state indicating whether or not `RefMap` will attempt to
     * convert non-valid primitives into targets that are valid input for
     * new `WeakRef` object instances. If this value is `false` then no
     * *objectification* will occur.
     *
     * @returns {boolean} The current state of objectifyValues.
     */
    get objectifyValues() {
        return __classPrivateFieldGet(this, _RefMap_objectifyValues, "f");
    }
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
    get(key, defaultValue) {
        const value = super.get(key);
        if (!value || !value?.deref()) {
            return defaultValue;
        }
        return value?.deref();
    }
    /**
     * Setting this value to true, will cause all set values to the Map to
     * be analyzed for validity as a candidate to be wrapped in a `WeakRef`
     * object. If true, and if possible, the object will be turned into an
     * `Object` variant first.
     *
     * @param {boolean} value - The new state to set for objectifyValues.
     */
    set objectifyValues(value) {
        __classPrivateFieldSet(this, _RefMap_objectifyValues, !!value, "f");
    }
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
    set(key, value) {
        let useValue = value;
        // Objectify the value if needed
        if (__classPrivateFieldGet(this, _RefMap_objectifyValues, "f") && (typeof useValue === 'number' ||
            typeof useValue === 'string' ||
            typeof useValue === 'boolean' ||
            typeof useValue === 'bigint')) {
            useValue = Object(useValue);
        }
        // Check if the value is an object, and if it's a symbol, ensure it's not registered
        if (typeof useValue === 'symbol' && Symbol.keyFor(useValue) !== undefined) {
            throw new TypeError('RefMap cannot accept registered symbols as values');
        }
        if (typeof useValue !== 'object' && typeof useValue !== 'symbol') {
            throw new TypeError('RefMap values must be objects, non-registered symbols, or objectified primitives');
        }
        // If the value is null or undefined, throw an error
        if (useValue === null || useValue === undefined) {
            throw new TypeError('RefMap values cannot be null or undefined');
        }
        const ref = new WeakRef(useValue);
        super.set(key, ref);
    }
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
    setAll(entries) {
        if (!iterable_js_1.Iterable.isIterable(entries)) {
            throw new TypeError('The supplied list of entries must be an array of arrays in the ' +
                'format [[key1, value1], [key2, value2], ...].');
        }
        const forEach = entry => {
            const [key, value] = entry;
            if (!key || !isObject(value) || !isRegistered(value)) {
                return;
            }
            this.set(key, value);
        };
        for (const entry of entries) {
            forEach(entry);
        }
        return this;
    }
    /**
     * Removes all elements from the RefMap that have been garbage collected
     * (i.e., their WeakRef no longer points to an object).
     *
     * @returns {RefMap} - The current RefMap instance to allow method chaining.
     */
    clean() {
        for (const [key, dereferenced] of this) {
            if (!dereferenced) {
                this.delete(key);
            }
        }
        return this;
    }
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
    entries() {
        const entriesIterator = super.entries();
        const refIterator = new iterable_js_1.Iterator(entriesIterator, (entry) => {
            if (entry) {
                const [key, ref] = entry;
                const value = ref?.deref();
                return [key, value];
            }
            return entry;
        });
        return refIterator;
    }
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
    forEach(forEachFn, thisArg) {
        for (const [key, ref] of super.entries()) {
            const value = ref?.deref();
            if (!value) {
                continue;
            }
            forEachFn.call(thisArg, value, key, this);
        }
    }
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
    values() {
        return new iterable_js_1.Iterator(super.values(), function perItem(value) {
            const dereferenced = value?.deref();
            return dereferenced || value;
        });
    }
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
    hasValue(value, strict = true) {
        if (isNullDefined(value)) {
            return false;
        }
        if (__classPrivateFieldGet(this, _RefMap_objectifyValues, "f")) {
            strict = false;
        }
        for (const [_, dereferenced] of this) {
            if ((strict && value === dereferenced) ||
                (!strict && value == dereferenced)) {
                return true;
            }
        }
        return false;
    }
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
    filter(filterFn, thisArg) {
        const resultingEntries = [];
        for (const [key, dereferenced] of this) {
            if (filterFn.call(thisArg, dereferenced, key, this)) {
                resultingEntries.push([key, dereferenced]);
            }
        }
        return resultingEntries;
    }
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
    find(findFn, thisArg) {
        for (const [key, dereferenced] of this) {
            const ref = super.get(key);
            let result = findFn.call(thisArg, ref, key, map);
            if (!result) {
                result = findFn.call(thisArg, dereferenced, key, map);
            }
            if (result) {
                return dereferenced;
            }
        }
        return null;
    }
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
    map(mapFn, thisArg, toRefMap, mirrorObjectification) {
        if (typeof mapFn !== 'function') {
            throw new TypeError('mapFn must be a function! Received', mapFn);
        }
        const entries = [];
        const errors = [];
        let needsObjectification = mirrorObjectification && this.objectifyValues;
        let detectNeed = mirrorObjectification === undefined;
        let objectify = needsObjectification;
        for (const [key, dereferenced] of this) {
            const [, VALUE] = [0, 1];
            const transformed = mapFn.call(thisArg, [key, dereferenced], key, this);
            if (!isValidReference(transformed[VALUE])) {
                if (isValidReference(Object(transformed[VALUE]))) {
                    needsObjectification = true;
                    if (detectNeed && !objectify) {
                        objectify = true;
                        transformed[VALUE] = Object(transformed[VALUE]);
                    }
                }
            }
            entries.push(transformed);
        }
        if (toRefMap) {
            return new RefMap(entries).objectifying(objectify);
        }
        return entries;
    }
    /**
     * The function returns an iterator that iterates over the entries of an object,
     * dereferencing any weak references.
     *
     * @returns {Iterator} A new iterator object is being returned.
     */
    *[(_RefMap_objectifyValues = new WeakMap(), Symbol.iterator)]() {
        for (const [key, ref] of this.entries()) {
            yield [key, ref];
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
}
exports.RefMap = RefMap;
exports.RefMapExtensions = new extension_1.Extension(RefMap);
//# sourceMappingURL=refmap.js.map