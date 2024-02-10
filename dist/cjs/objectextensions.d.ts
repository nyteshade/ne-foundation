/**
 * `ObjectExtensions` is a patch for the JavaScript built-in `Object` class.
 * It adds utility methods to the `Object` class without modifying the global
 * namespace directly. This patch includes methods for key validation, object
 * type checking, and retrieving the string tag of an object. These methods
 * are useful for enhancing the capabilities of the standard `Object` class
 * with additional utility functions.
 */
export const ObjectExtensions: Patch;
export const ObjectPrototypeExtensions: Patch;
import { Patch } from '@nejs/extension';
