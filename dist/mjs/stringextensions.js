import { Patch } from '@nejs/extension';
/**
 * `StringExtensions` is a patch for the JavaScript built-in `String` class. It
 * adds utility methods to the `String` class without modifying the global namespace
 * directly. This patch includes methods for key validation, object type checking,
 * and retrieving the string tag of an object. These methods are useful for
 * enhancing the capabilities of the standard `String` class with additional
 * utility functions.
 */
export const StringExtensions = new Patch(String, {
    /**
     * The `isString` method does exactly what one would it expect. It returns
     * true if the string matches typeof or instanceof as a string.
     *
     * @param {*} value checks to see if the `value` is a string
     * @returns {boolean} `true` if it is a `String`, `false` otherwise
     */
    isString(value) {
        if (value && (typeof value === 'string' || value instanceof String)) {
            return value.length > 0;
        }
        return false;
    },
});
//# sourceMappingURL=stringextensions.js.map