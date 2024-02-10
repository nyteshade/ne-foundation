"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeakRefExtensions = void 0;
const extension_1 = require("@nejs/extension");
exports.WeakRefExtensions = new extension_1.Patch(WeakRef, {
    /**
     * A static method to check if a given value is a valid target for a WeakRef.
     *
     * @param {*} value - The value to check for validity as a WeakRef target.
     * @returns {boolean} - True if the value is a valid WeakRef target,
     * false otherwise.
     */
    isValidReference(value) {
        return !((typeof value === 'symbol' && Symbol.keyFor(value) === undefined) ||
            (typeof value !== 'object' && typeof value !== 'symbol') ||
            (value === null || value === undefined));
    },
});
//# sourceMappingURL=weakrefextensions.js.map