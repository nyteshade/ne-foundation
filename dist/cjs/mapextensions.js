"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapPrototypeExtensions = void 0;
const extension_1 = require("@nejs/extension");
exports.MapPrototypeExtensions = new extension_1.Patch(Map.prototype, {
    /**
     * The function `getKey` returns the key associated with a given value
     * in a map.
     *
     * @param {any} value - The value parameter is the value that you want to
     * find the corresponding key for in the map.
     * @param [strict=true] - The "strict" parameter is a boolean value that
     * determines whether strict equality (===) or loose equality (==) should
     * be used when comparing the "value" parameter with the values in the
     * entries of the object. If "strict" is set to true, strict equality will
     * be used.
     * @returns the key associated with the given value. If a matching key is
     * found, it is returned. If no matching key is found, null is returned.
     */
    getKey(value, strict = true) {
        for (const [key, entryValue] of this) {
            if ((strict && value === entryValue) &&
                (!strict && value == entryValue)) {
                return key;
            }
            return null;
        }
    },
});
//# sourceMappingURL=mapextensions.js.map