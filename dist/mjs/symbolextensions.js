import { Patch } from '@nejs/extension';
/**
 * `SymbolExtensions` is a patch for the JavaScript built-in `Symbol` class. It
 * adds utility methods to the `Symbol` class without modifying the global namespace
 * directly. This patch includes methods for key validation, object type checking,
 * and retrieving the string tag of an object. These methods are useful for
 * enhancing the capabilities of the standard `Symbol` class with additional
 * utility functions.
 */
export const SymbolExtensions = new Patch(Symbol, {
    /**
     * The `isSymbol` method does exactly what one would it expect. It returns
     * true if the string matches typeof or instanceof as a symbol.
     *
     * @param {*} value checks to see if the `value` is a string
     * @returns {boolean} `true` if it is a `Symbol`, `false` otherwise
     */
    isSymbol(value) {
        return value && (typeof value === 'symbol');
    },
    /**
     * Returns true if the supplied value is a Symbol created using
     * `Symbol.for()`.
     *
     * @param {any} value assumption is that the supplied value is of type
     * 'symbol' however, unless `allowOnlySymbols` is set to `true`, `false`
     * will be returned for any non-symbol values.
     * @param {boolean} allowOnlySymbols true if an error should be thrown
     * if the supplied value is not of type 'symbol'
     * @returns true if the symbol is registered, meaning, none of the spec
     * static symbols (`toStringTag`, `iterator`, etc...), and no symbols
     * created by passing a value directly to the Symbol function, such as
     * `Symbol('name')`
     */
    isRegistered(value, allowOnlySymbols = false) {
        if (!Symbol.isSymbol(value)) {
            if (allowOnlySymbols) {
                throw new TypeError('allowOnlySymbols specified; value is not a symbol');
            }
            return false;
        }
        return Symbol.keyFor(value) !== undefined;
    },
    /**
     * A function that returns true if the symbol is not registered, meaning,
     * any of the spec static symbols (`toStringTag`, `iterator`, etc...), and
     * any symbols created by passing a value directly to the `Symbol` function,
     * such as `Symbol('name')`.
     *
     * @param {any} value assumption is that the supplied value is of type
     * 'symbol' however, unless allowOnlySymbols is set to true, false will
     * be returned for any non-symbol values.
     * @param {boolean} allowOnlySymbols true if an error should be thrown
     * if the supplied value is not of type 'symbol'
     * @returns true if the symbol is not registered, meaning, any of the
     * spec static symbols (`toStringTag`, `iterator`, etc...), and any symbols
     * created by passing a value directly to the `Symbol` function, such as
     * `Symbol('name')`
     * @returns true if the `value` in question is both a `symbol` and has
     * returns `undefined` if passed to `Symbol.keyFor`
     */
    isNonRegistered(value, allowOnlySymbols = false) {
        return !Symbol.isRegistered(value, allowOnlySymbols);
    },
});
//# sourceMappingURL=symbolextensions.js.map