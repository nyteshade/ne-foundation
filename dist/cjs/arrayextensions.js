"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayPrototypeExtensions = void 0;
const extension_1 = require("@nejs/extension");
/**
 * The `ArrayPrototypeExtensions` patch extends the prototype of the built-in
 * JavaScript `Array` with additional properties for convenience and improved
 * readability. By applying this patch, all array instances gain new getter
 * properties `first` and `last`, which provide quick access to the first and
 * last elements of the array, respectively. This enhancement simplifies common
 * operations on arrays and makes code more expressive and concise.
 */
exports.ArrayPrototypeExtensions = new extension_1.Patch(Array.prototype, {
    /**
     * Sometimes defining even a short function for the invocation of `find`
     * can be troublesome. This helper function performs that job for you. If
     * the specified element is in the array, `true` will be returned.
     *
     * @param {*} value the value to search for. This value must triple equals
     * the array element in order to return true.
     * @returns true if the exact element exists in the array, false otherwise
     */
    contains(value) {
        return !!this.find(entry => entry === value);
    },
    /**
     * The `findEntry` function searches the entries of the object and returns
     * the `[index, value]` entry array for the first matching value found.
     *
     * @param {function} findFn a function that takes the element to be checked
     * and returns a boolean value
     * @returns if `findFn` returns `true`, an array with two elements, the first
     * being the index, the second being the value, is returned.
     */
    findEntry(findFn) {
        const entries = this.entries();
        const VALUE = 1;
        for (let entry of entries) {
            if (findFn(entry[VALUE])) {
                return entry;
            }
        }
        return undefined;
    },
    /**
     * A getter property that returns the first element of the array. If the
     * array is empty, it returns `undefined`. This property is useful for
     * scenarios where you need to quickly access the first item of an array
     * without the need for additional checks or method calls.
     *
     * @returns {*} The first element of the array or `undefined` if the array
     * is empty.
     */
    get first() {
        return this[0];
    },
    /**
     * A getter property that returns the last element of the array. It
     * calculates the last index based on the array's length. If the array is
     * empty, it returns `undefined`. This property is beneficial when you need
     * to access the last item in an array, improving code readability and
     * avoiding manual index calculation.
     *
     * @returns {*} The last element of the array or `undefined` if the
     * array is empty.
     */
    get last() {
        return this[this.length - 1];
    },
});
//# sourceMappingURL=arrayextensions.js.map