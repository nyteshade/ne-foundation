/**
 * A PatchEntry class is a wrapper that maps the descriptor, key and owning
 * object in a single instance. When a Patch or Extension are created, one
 * of these for each patch is created so that the patch can be applied and
 * reverted.
 */
export class PatchEntry {
    /**
     * Constructs a new PatchEntry instance.
     *
     * @param {string|symbol} property The property key to be patched.
     * @param {object} [owningObject=globalThis] The object from which the
     * property descriptor is taken.
     * @param {function} condition if a valid function is passed here, the
     * expectation is that it takes no parameters and returns a `boolean`. If
     * `true`, then this entry can be applied. If `false`, it indicates to the
     * consuming `Patch` that it cannot be applied.
     * @throws {TypeError} if `owningObject` is not a valid object (i.e. one that
     * can contain property descriptors and assigned values), then a `TypeError`
     * is thrown. A `TypeError` is also thrown if `property` is null, or neither
     * an object nor symbol.
     */
    constructor(property, owningObject = globalThis, condition = undefined) {
        const isNullish = (value) => (value === null || value === undefined);
        const isKey = (value, types = ['string', 'symbol']) => !isNullish(value) && (!!types.find(f => f === (typeof value)));
        const isObject = value => isKey(value, ['object']);
        if (!isKey(property)) {
            console.error('Property', property, `(type: ${typeof property})`, 'owningObject', owningObject, `(type: ${typeof owningObject})`, 'condition', condition, `(type: ${typeof condition})`);
            throw new TypeError('Property must be non-null and either a string or symbol');
        }
        if (!isObject(owningObject)) {
            throw new TypeError('Cannot create Patch entry as owning object is invalid');
        }
        Object.assign(this, {
            key: property,
            descriptor: Object.getOwnPropertyDescriptor(owningObject, property),
            owner: owningObject,
            condition: (typeof condition === 'function') ? condition : undefined
        });
    }
    /**
     * Computes and returns the current value of the patch, based on its type
     * (data or accessor).
     *
     * @returns {any} The current value of the patch.
     */
    get computed() {
        if (this.isAccessor) {
            return this.descriptor.get.bind(this.owner).call();
        }
        else {
            return this.descriptor.value;
        }
    }
    /**
     * Checks if the patch is a data property (has a value).
     *
     * @returns {boolean} True if the patch is a data property, false otherwise.
     */
    get isData() {
        return Reflect.has(this.descriptor, 'value');
    }
    /**
     * Checks if the patch is an accessor property (has a getter).
     *
     * @returns {boolean} True if the patch is an accessor property, false otherwise.
     */
    get isAccessor() {
        return Reflect.has(this.descriptor, 'get');
    }
    /**
     * Checks if the patch is read-only (not configurable or not writable).
     *
     * @returns {boolean} True if the patch is read-only, false otherwise.
     */
    get isReadOnly() {
        return ((Reflect.has(this.descriptor, 'configurable') && !this.descriptor.configurable) ||
            (Reflect.has(this.descriptor, 'writable') && !this.descriptor.writable));
    }
    /**
     * If a `condition` is associated with this specific patch entry, then it will
     * run and its result will be returned. Otherwise `true` is returned allowing
     * all non-conditional `PatchEntry` instances to be applied every time.
     *
     * @returns {boolean} `true` if the condition is true or there is no condition
     * applied to this instance. `false` if the condition fails.
     */
    get isAllowed() {
        const validAndPresent = (this.condition &&
            typeof this.condition === 'function');
        return validAndPresent ? this.condition() : true;
    }
    /**
     * Applies the patch entry to a given object. This method takes the
     * descriptor from the current patch entry and defines it on the target
     * object. If `bindAccessors` is true and the descriptor contains accessor
     * methods (getters/setters), they will be bound to the original owner of
     * the patch before being applied to ensure the correct `this` context.
     *
     * @param {object} anotherObject - The object to which the patch will be
     * applied.
     * @param {boolean} [bindAccessors=false] - Whether to bind accessor methods
     * to the patch's owner.
     */
    applyTo(anotherObject, bindAccessors = false) {
        const descriptor = { ...this.descriptor };
        if (bindAccessors) {
            if (typeof descriptor.get === 'function') {
                descriptor.get = descriptor.get.bind(this.owner);
            }
            if (typeof descriptor.set === 'function') {
                descriptor.set = descriptor.set.bind(this.owner);
            }
        }
        Object.defineProperty(anotherObject, this.key, descriptor);
    }
    /**
     * Custom getter for the toStringTag symbol. Provides the class name of
     * the PatchEntry instance.
     *
     * @returns {string} The class name of the PatchEntry instance.
     */
    get [Symbol.toStringTag]() {
        return this.constructor.name;
    }
    /**
     * Custom inspect function for Node.js that provides a formatted representation
     * of the PatchEntry instance, primarily for debugging purposes.
     *
     * @param {number} depth The depth to which the object should be formatted.
     * @param {object} options Formatting options.
     * @param {function} inspect The inspection function to format the object.
     * @returns {string} A formatted string representing the PatchEntry instance.
     */
    [Symbol.for('nodejs.util.inspect.custom')](depth, options, inspect) {
        const type = this.isData ? ' Data' : ' Accessor';
        const writable = this.isReadOnly ? ' [ReadOnly]' : '';
        return `PatchEntry<${this.key}${type}${writable}>`;
    }
}
//# sourceMappingURL=patchentry.js.map