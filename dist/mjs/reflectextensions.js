import { Patch } from '@nejs/extension';
import { ObjectExtensions } from './objectextensions.js';
const { isObject } = ObjectExtensions.patches;
/**
 * The `ReflectExtensions` class is a patch applied to the built-in JavaScript
 * `Reflect` object. It extends `Reflect` with additional utility methods that
 * enhance its capabilities. These methods provide more advanced ways of
 * interacting with object properties, such as checking for the presence of
 * multiple keys at once (`hasAll`) or verifying if at least one specified key
 * exists in an object (`hasSome`). This class is part of the `@nejs/extension`
 * library and is designed to offer these extended functionalities in a way
 * that is consistent with the existing `Reflect` API, making it intuitive for
 * developers who are already familiar with standard reflection methods in
 * JavaScript.
 */
export const ReflectExtensions = new Patch(Reflect, {
    /**
     * The function checks if an object has all the specified keys.
     *
     * @param object - The `object` parameter is the object that we want to
     * check if it has all the specified keys.
     * @param keys - The `keys` parameter is a rest parameter, which means
     * it can accept any number of arguments. In this case, it is expected
     * to receive multiple keys as arguments.
     * @returns a boolean value.
     */
    hasAll(object, ...keys) {
        return Object.isObject(object) && (keys.flat(Infinity)
            .map(key => Reflect.has(object, key))
            .every(has => has));
    },
    /**
     * Fetches all descriptors of an object, including those mapped to a
     * symbol descriptor value.
     *
     * @param {object} object the object from whose descriptors need to be
     * retrieved.
     * @returns {object} with keys mapped to object descriptors
     * @throws {TypeError} if the supplied `object` is null or not an object
     * a TypeError exception will be thrown
     */
    ownDescriptors(object) {
        if (!isObject(object)) {
            throw new TypeError('The supplied object must be non-null and an object');
        }
        const result = {};
        const keys = Reflect.ownKeys(object);
        for (const key of keys) {
            result[key] = Object.getOwnPropertyDescriptor(key);
        }
        return result;
    },
    /**
     * The function checks if an object has at least one of the specified keys.
     *
     * @param object - The `object` parameter is the object that we want to check
     * for the presence of certain keys.
     * @param keys - The `keys` parameter is a rest parameter, which means it can
     * accept any number of arguments. These arguments are the keys that we want
     * to check if they exist in the `object`.
     * @returns The function `hasSome` returns a boolean value indicating whether
     * at least one of the keys provided as arguments exists in the given object.
     */
    hasSome(object, ...keys) {
        return isObject(object) && (keys.flat(Infinity)
            .map(key => Reflect.has(object, key))
            .some(has => has));
    },
    /**
     * Retrieves an array of [key, descriptor] pairs for each property of the
     * provided object. This method is akin to `Object.entries` but includes
     * property descriptors instead of the property values. It's useful for cases
     * where you need detailed information about properties, including their
     * configurability, enumerability, and accessors.
     *
     * @param {object} object - The object whose property entries are to be
     * retrieved.
     * @returns {Array} An array of [key, descriptor] pairs, where each pair
     * consists of the property name (key) and its descriptor. Returns an empty
     * array if the input is not a valid object.
     */
    entries(object) {
        if (!object || typeof object !== 'object') {
            return [];
        }
        return Reflect.ownKeys(object).map(key => [
            key, Object.getOwnPropertyDescriptor(object, key)
        ]);
    },
    /**
     * Retrieves an array of values from the property descriptors of the given
     * object. This method works similarly to `Object.values` but operates on
     * property descriptors instead. It's useful when you need the values of
     * properties including getters, setters, and other descriptor-specific
     * attributes.
     *
     * @param {object} object - The object whose property values are to be
     * retrieved.
     * @returns {Array} An array of values extracted from the object's property
     * descriptors. The values correspond to the `value` attribute in each
     * property's descriptor. Returns an empty array if the input is not a valid
     * object.
     */
    values(object) {
        return Reflect.entries.map(([, value]) => value);
    }
});
//# sourceMappingURL=reflectextensions.js.map