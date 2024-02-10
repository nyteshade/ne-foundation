/**
 * The `FunctionExtensions` class is a patch applied to the built-in JavaScript
 * `Function` constructor. It extends `Function` with additional utility methods
 * for determining the specific type or nature of function-like objects. These
 * methods allow developers to distinguish between classes, regular functions,
 * async functions, and arrow functions in a more intuitive and straightforward
 * manner. This class is part of the `@nejs/extension` library and enhances the
 * capabilities of function handling and introspection in JavaScript.
 */
export const FunctionExtensions: Patch;
export const FunctionPrototypeExtensions: Patch;
import { Patch } from '@nejs/extension';
