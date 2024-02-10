/**
 * Represents an error that is thrown when a property is missing from a specified
 * owner object. This error is used to indicate that a specific key or property
 * expected to be present on the owner is not found, highlighting potential issues
 * in property access or data integrity.
 */
export class MissingOwnerValue extends Error {
    /**
     * Constructs a new MissingOwnerValue instance.
     *
     * @param {string} owner The object or entity that is supposed to contain the
     * property.
     * @param {string} key The name of the property that is missing from the owner.
     */
    constructor(owner: string, key: string);
    /**
     * Custom getter for the toStringTag symbol. Overrides the default
     * Object.prototype.toString behavior, returning the constructor's name
     * of this error instance. Useful for debugging and logging purposes.
     *
     * @returns {string} The name of the constructor for this error instance.
     */
    get [Symbol.toStringTag](): string;
}
