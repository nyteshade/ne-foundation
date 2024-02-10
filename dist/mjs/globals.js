import { Patch } from '@nejs/extension';
import { FunctionExtensions } from './functionextensions.js';
const { isClass, isFunction } = FunctionExtensions.patches;
const CustomInspect = Symbol.for('nodejs.util.inspect.custom');
export const GlobalFunctionsAndProps = new Patch(globalThis, {
    /**
     * Transforms an object to mimic a specified prototype, altering its type
     * conversion and inspection behaviors. This function is especially useful
     * for creating objects that need to behave like different primitive types
     * under various operations.
     *
     * @param {Object} object - The object to be transformed.
     * @param {Function|Object} [prototype=String.prototype] - The prototype or
     * class to emulate. If a function is provided, its prototype is used.
     * Defaults to String.prototype.
     * @param {Function} [toPrimitive=(hint, val) => String(val)] - A function
     * defining how the object should be converted to a primitive value. It
     * receives a type hint ('number', 'string', or 'default') and the object,
     * returning the primitive value.
     * @returns {Object|null} The transformed object, or null if neither a class
     * nor a prototype could be derived from the provided prototype parameter.
     */
    maskAs(object, classPrototype, options) {
        const { prototype, toPrimitive } = GenericMask({ ...options, prototype: classPrototype });
        const base = { configurable: true, enumerable: false };
        const proto = isFunction(prototype) ? prototype.prototype : prototype;
        const klass = isClass(prototype) ? prototype : proto?.constructor;
        if (!klass && !proto) {
            return null;
        }
        Object.setPrototypeOf(object, proto);
        Object.defineProperties(object, {
            valueOf: {
                value() { return String(toPrimitive('default', object)); }, ...base
            },
            [Symbol.toPrimitive]: {
                value(hint) { return toPrimitive(hint, object); }, ...base
            },
            [Symbol.toStringTag]: { value: klass.name, ...base },
            [Symbol.species]: { get() { return klass; }, ...base },
            [CustomInspect]: { ...base, value(depth, opts, inspect) {
                    return inspect(this[Symbol.toPrimitive](), { ...opts, depth });
                } }
        });
        return object;
    },
    /**
     * Masks an object as a string-like object by setting its prototype to
     * String and defining how it converts to primitive types. This is
     * particularly useful when an object needs to behave like a string in
     * certain contexts, such as type coercion or logging.
     *
     * @param {Object} object - The object to be masked as a string.
     * @param {string} [stringKey='value'] - The object property key used for
     * the string representation. Defaults to 'value'.
     * @param {Function} [toPrimitive] - Optional custom function for primitive
     * conversion. If omitted, a default function handling various conversion
     * hints is used.
     * @returns {Object|null} The string-masked object, or null if the object
     * doesn't have the specified stringKey property.
     */
    maskAsString(object, stringKey, toPrimitive) {
        if (object && Reflect.has(object, stringKey)) {
            return maskAs(object, StringMask(stringKey ?? 'value', toPrimitive));
        }
        return null;
    },
    /**
     * Masks an object as a number-like object. This allows the object to
     * behave like a number in operations like arithmetic and type coercion.
     * It sets the prototype to Number and defines custom conversion behavior.
     *
     * @param {Object} object - The object to be masked as a number
     * representation. Defaults to 'value'.
     * @param {Function} [toPrimitive] - Optional custom function for primitive
     * conversion. If not provided, a default function handling different
     * conversion hints is used.
     * @returns {Object|null} The number-masked object, or null if the object
     * doesn't have the specified numberKey property.
     */
    maskAsNumber(object, numberKey, toPrimitive) {
        if (object && Reflect.has(object, numberKey)) {
            return maskAs(object, NumberMask(numberKey ?? 'value', toPrimitive));
        }
        return null;
    },
    /**
     * Generates options for generic masking of an object, providing defaults for
     * prototype and toPrimitive function if not specified.
     *
     * @param {Object} options - The options object including prototype,
     * targetKey, and toPrimitive function.
     * @returns {Object} The options object with defaults applied as necessary.
     */
    GenericMask({ prototype, targetKey = 'value', toPrimitive }) {
        const options = { targetKey, toPrimitive, prototype };
        if (!isFunction(toPrimitive)) {
            options.toPrimitive = (hint, object) => {
                let property = object[targetKey];
                let isNum = ((typeof property === 'number' && Number.isFinite(property)) ||
                    (typeof property === 'string' &&
                        !isNaN(parseFloat(property)) && isFinite(property)));
                switch (hint) {
                    case 'string':
                        return isNum ? String(property) : (property ?? String(object));
                    case 'number':
                        return isNum ? Number(property) : NaN;
                    case 'default':
                    default:
                        return isNum ? Number(property) : property;
                }
            };
        }
        return options;
    },
    /**
     * Generates options for string masking of an object, providing a default
     * toPrimitive function if not specified.
     *
     * @param {string} targetKey - The object property key for string
     * representation.
     * @param {Function} toPrimitive - Custom function for primitive conversion.
     * @returns {Object} Options for string masking.
     */
    StringMask(targetKey, toPrimitive) {
        const options = { targetKey, toPrimitive, prototype: String.prototype };
        if (!isFunction(toPrimitive)) {
            options.toPrimitive = function toPrimitive(hint, object) {
                switch (hint) {
                    case 'default': return object[targetKey];
                    case 'number': return parseInt(object[targetKey], 36);
                    case 'string': return String(object[targetKey]);
                    default: return object;
                }
            };
        }
        return options;
    },
    /**
     * Generates options for number masking of an object, providing a default
     * toPrimitive function if not specified.
     *
     * @param {string} targetKey - The object property key for number
     * representation.
     * @param {Function} toPrimitive - Custom function for primitive conversion.
     * @returns {Object} Options for number masking.
     */
    NumberMask(targetKey, toPrimitive) {
        const options = { targetKey, toPrimitive, prototype: Number.prototype };
        if (!isFunction(toPrimitive)) {
            options.toPrimitive = function toPrimitive(hint, object) {
                switch (hint) {
                    case 'default': return object[targetKey];
                    case 'number': return Number(object[targetKey]);
                    case 'string': return String(object[targetKey]);
                    default: return object;
                }
            };
        }
        return options;
    },
});
//# sourceMappingURL=globals.js.map