/**
 * `SymbolExtensions` is a patch for the JavaScript built-in `Symbol` class. It
 * adds utility methods to the `Symbol` class without modifying the global namespace
 * directly. This patch includes methods for key validation, object type checking,
 * and retrieving the string tag of an object. These methods are useful for
 * enhancing the capabilities of the standard `Symbol` class with additional
 * utility functions.
 */
export const SymbolExtensions: Patch;
import { Patch } from '@nejs/extension';
