/**
 * The Extension class, inheriting from the Patch class, is specifically designed
 * for extending properties or methods of a given object. It facilitates the
 * extension process by determining the target key and value for the extension and
 * ensuring the target property is writable and configurable. If these conditions
 * are not met, the class throws a CannotBeExtendedError. This class is useful
 * in scenarios like testing, dynamic behavior adjustments, or managing complex
 * object configurations.
 */
export class Extension extends Patch {
    /**
     * Determines the input type for the extension. This method processes the input
     * and identifies the key for the extension and the associated value or method.
     * It supports inputs as either a string key or a function/class, providing
     * flexibility in defining extensions.
     *
     * @param {Function|string} keyClassOrFn - The key, class, or function provided
     * as input. If a function or class is provided, its name is used as the key.
     * containing the determined key, the extension value/method, and a validity flag
     * indicating whether the input is usable.
     * @returns {{key: string|null, extension: *|null, valid: boolean}} An object
     */
    static determineInput(keyClassOrFn: Function | string): {
        key: string | null;
        extension: any | null;
        valid: boolean;
    };
    /**
     * Creates a new ExtensionSet with the provided name and extensions.
     *
     * @param {string} name - The name of the extension set.
     * @param {...Extension|Function} extensions - A list of extensions or
     * functions to include in the set.
     * @returns {ExtensionSet} A new instance of ExtensionSet containing the
     * given extensions.
     */
    static createSet(name: string, ...extensions: (Extension | Function)[]): ExtensionSet;
    /**
     * Represents a set of extensions.
     */
    static ExtensionSet: {
        new (name: string, ...extensions: (Extension | Function)[]): {
            name: string;
            extensionObjects: Set<any>;
            extensions: Set<any>;
            /**
             * Applies all extensions in the set.
             */
            apply(): void;
            /**
             * Reverts all extensions in the set.
             */
            revert(): void;
        };
    };
    /**
     * Constructs a new Extension instance. This constructor initializes the extension
     * by determining the target key and value for the extension and ensuring that
     * the property to be extended is configurable and writable. It throws an error
     * if these conditions are not satisfied. The constructor leverages the Patch
     * class's functionalities to manage the extension effectively.
     *
     * @param {Function|string} keyClassOrFn - The key, class, or function to be
     * used for the extension. If a function or class is provided, its name is used
     * as the key.
     * @param {*} value - The value or method to be used for the extension.
     * @param {object} [owner=globalThis] - The object to which the extension will
     * be applied.
     * @param {object} [options={}] - Additional options for the extension behavior.
     * @throws {CannotBeExtendedError} If the target property is not writable or
     * configurable.
     * @throws {MissingOwnerValue} If the `keyClassOrFn` value is null or there
     * is an error determining the key and extension values, MissingOwnerValue is
     * thrown.
     */
    constructor(keyClassOrFn: Function | string, value: any, owner?: object | undefined, options?: object | undefined);
    key: string | null;
    class: any;
    function: any;
    /**
     * Returns true if this `Extension` represents a `function`
     *
     * @returns {boolean} `true` if this `Extension` introduces a `function`, or
     * `false` if it does not
     */
    get isFunction(): boolean;
    /**
     * Returns true if this `Extension` represents a `class`
     *
     * @returns {boolean} `true` if this `Extension` introduces a `class`, or
     * `false` if it does not
     */
    get isClass(): boolean;
    /**
     * Returns true if this `Extension` represents a `primitive`
     *
     * @returns {boolean} `true` if this `Extension` introduces a
     * primitive value or `false` if it does not.
     */
    get isPrimitive(): boolean;
    /**
     * Returns true if this `Extension` represents a value that is not
     * coerced into an `Object` wrapper when wrapped with `Object(value)`
     *
     * @returns {boolean} `true` if this `Extension` introduces a value
     * that is alrady an `object`, `false` otherwise.
     */
    get isObject(): boolean;
    /**
     * Custom getter for the toStringTag symbol. Provides the class name when the
     * object is converted to a string, typically used for debugging and logging.
     *
     * @returns {string} The class name of the Extension instance.
     */
    get [Symbol.toStringTag](): string;
}
import { Patch } from './patch.js';
