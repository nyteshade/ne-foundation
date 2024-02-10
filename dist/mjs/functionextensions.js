import { Patch } from '@nejs/extension';
import { ObjectExtensions } from './objectextensions.js';
const { getStringTag } = ObjectExtensions.patches;
/**
 * The `FunctionExtensions` class is a patch applied to the built-in JavaScript
 * `Function` constructor. It extends `Function` with additional utility methods
 * for determining the specific type or nature of function-like objects. These
 * methods allow developers to distinguish between classes, regular functions,
 * async functions, and arrow functions in a more intuitive and straightforward
 * manner. This class is part of the `@nejs/extension` library and enhances the
 * capabilities of function handling and introspection in JavaScript.
 */
export const FunctionExtensions = new Patch(Function, {
    /**
     * Determines if a given value is an asynchronous function. It checks if the
     * value is an instance of `Function` and if its string representation
     * includes the keyword 'Async'. This method is particularly useful for
     * identifying async functions.
     *
     * @param {*} value - The value to be checked.
     * @returns {boolean} Returns `true` if the value is an async function,
     * otherwise `false`.
     */
    isAsync(value) {
        const stringTag = /(\w+)]/g.exec(Object.prototype.toString.call(value))[1];
        return (value instanceof Function &&
            stringTag.includes('Async'));
    },
    /**
     * The function checks if a given value is an async generator function
     *
     * @param {any} value - The `value` parameter is the value that we want to
     * check if it is a generator function.
     * @returns {boolean} `true` if the value is an instance of a function and
     * its string tag is 'AsyncGeneratorFunction', otherwise it returns `false`.
     */
    isAsyncGenerator(value) {
        const stringTag = getStringTag(value);
        return (value instanceof Function &&
            stringTag == 'AsyncGeneratorFunction');
    },
    /**
     * Checks if a given value is an arrow function. It verifies if the value is
     * an instance of `Function`, if its string representation includes the '=>'
     * symbol, and if it lacks a prototype, which is a characteristic of arrow
     * functions in JavaScript.
     *
     * @param {*} value - The value to be checked.
     * @returns {boolean} Returns `true` if the value is an arrow function,
     * otherwise `false`.
     */
    isBigArrow(value) {
        return (value instanceof Function &&
            String(value).includes('=>') &&
            !String(value).startsWith('bound') &&
            !Reflect.has(value, 'prototype'));
    },
    /**
     * Determines if a given value is a bound function. Bound functions are
     * created using the `Function.prototype.bind` method, which allows setting
     * the `this` value at the time of binding. This method checks if the value
     * is an instance of `Function`, if its string representation starts with
     * 'bound', and if it lacks a `prototype` property. These characteristics
     * are indicative of bound functions in JavaScript.
     *
     * @param {*} value - The value to be checked, typically a function.
     * @returns {boolean} Returns `true` if the value is a bound function,
     * otherwise `false`. Bound functions have a specific format in their
     * string representation and do not have their own `prototype` property.
     */
    isBound(value) {
        return (value instanceof Function &&
            String(value).startsWith('bound') &&
            !Reflect.has(value, 'prototype'));
    },
    /**
     * Determines if a given value is a class. It checks if the value is an
     * instance of `Function` and if its string representation includes the
     * keyword 'class'. This method is useful for distinguishing classes from
     * other function types in JavaScript.
     *
     * @param {*} value - The value to be checked.
     * @returns {boolean} Returns `true` if the value is a class, otherwise
     * `false`.
     */
    isClass(value) {
        return value instanceof Function && !!/^class\s/.exec(String(value));
    },
    /**
     * Checks if a given value is a regular function. This method verifies if
     * the value is an instance of `Function`, which includes regular functions,
     * classes, and async functions but excludes arrow functions.
     *
     * @param {*} value - The value to be checked.
     * @returns {boolean} Returns `true` if the value is a regular function,
     * otherwise `false`.
     */
    isFunction(value) {
        return value instanceof Function && !Function.isClass(value);
    },
    /**
     * The function checks if a given value is a generator function
     *
     * @param {any} value - The `value` parameter is the value that we want to
     * check if it is a generator function.
     * @returns {boolean} `true` if the value is an instance of a function and
     * its string tag is 'GeneratorFunction', otherwise it returns `false`.
     */
    isGenerator(value) {
        const stringTag = getStringTag(value);
        return (value instanceof Function &&
            stringTag == 'GeneratorFunction');
    },
});
export const FunctionPrototypeExtensions = new Patch(Function.prototype, {
    /**
     * Determines if a given value is an asynchronous function. It checks if the
     * value is an instance of `Function` and if its string representation
     * includes the keyword 'Async'. This method is particularly useful for
     * identifying async functions.
     *
     * @returns {boolean} Returns `true` if the value is an async function,
     * otherwise `false`.
     */
    get isAsync() {
        return Function.isAsync(this);
    },
    /**
     * The function checks if a given value is an async generator function
     *
     * @returns {boolean} `true` if the value is an instance of a function and
     * its string tag is 'AsyncGeneratorFunction', otherwise it returns `false`.
     */
    get isAsyncGenerator() {
        return Function.isAsyncGenerator(this);
    },
    /**
     * Checks if a given value is an arrow function. It verifies if the value is
     * an instance of `Function`, if its string representation includes the '=>'
     * symbol, and if it lacks a prototype, which is a characteristic of arrow
     * functions in JavaScript.
     *
     * @returns {boolean} Returns `true` if the value is an arrow function,
     * otherwise `false`.
     */
    get isBigArrow() {
        return Function.isBigArrow(this);
    },
    /**
     * Determines if a given value is a bound function. Bound functions are
     * created using the `Function.prototype.bind` method, which allows setting
     * the `this` value at the time of binding. This method checks if the value
     * is an instance of `Function`, if its string representation starts with
     * 'bound', and if it lacks a `prototype` property. These characteristics
     * are indicative of bound functions in JavaScript.
     *
     * @returns {boolean} Returns `true` if the value is a bound function,
     * otherwise `false`. Bound functions have a specific format in their
     * string representation and do not have their own `prototype` property.
     */
    get isBound() {
        return Function.isBound(this);
    },
    /**
     * Determines if a given value is a class. It checks if the value is an
     * instance of `Function` and if its string representation includes the
     * keyword 'class'. This method is useful for distinguishing classes from
     * other function types in JavaScript.
     *
     * @returns {boolean} Returns `true` if the value is a class, otherwise
     * `false`.
     */
    get isClass() {
        return Function.isClass(this);
    },
    /**
     * Checks if a given value is a regular function. This method verifies if
     * the value is an instance of `Function`, which includes regular functions,
     * classes, and async functions but excludes arrow functions.
     *
     * @returns {boolean} Returns `true` if the value is a regular function,
     * otherwise `false`.
     */
    get isFunction() {
        return Function.isFunction(this);
    },
    /**
     * The function checks if a given value is a generator function
     *
     * @returns {boolean} `true` if the value is an instance of a function and
     * its string tag is 'GeneratorFunction', otherwise it returns `false`.
     */
    get isGenerator() {
        return Function.isGenerator(this);
    },
});
//# sourceMappingURL=functionextensions.js.map