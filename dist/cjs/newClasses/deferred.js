"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Deferred_promise, _Deferred_reject, _Deferred_resolve, _Deferred_settled;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeferredExtension = exports.Deferred = void 0;
const extension_1 = require("@nejs/extension");
/**
 * Deferreds, which were first introduced by jQuery for browsers in the early
 * 2000s, are a way to manage asynchronous operations. They have been widely
 * used and replicated by engineers since then. Although the Promise class in
 * modern JavaScript provides a static method called `withResolvers` that
 * returns an object with similar properties to a Deferred, it is not directly
 * supported by Node.js.
 *
 * ```
 * const withResolvers = Promise.withResolvers()
 * Reflect.has(withResolvers, 'promise') // true
 * Reflect.has(withResolvers, 'resolve') // true
 * Reflect.has(withResolvers, 'reject')  // true
 * ```
 *
 * This Deferred class extends the Promise class, allowing it to capture the
 * value or reason for easy access after resolution, akin to
 * {@link Promise.withResolvers}. As it extends {@link Promise}, it is
 * 'thenable' and works with `await` as if it were a native Promise. This
 * allows seamless integration with code expecting Promise-like objects.
 */
class Deferred extends Promise {
    /**
     * The constructor for Deferred instances. By default, a new Deferred will
     * have three important properties: `promise`, `resolve`, and `reject`.
     *
     * The constructor takes an object called `options`. It can have the
     * following properties:
     *
     * ```
     * interface BaseDeferredOptions {
     *   // Deferreds store the value or reason. To turn this off, pass true
     *   // to this option.
     *   doNotTrackAnswers?: boolean;
     * }
     *
     * interface ResolveDeferredOptions {
     *   // Passing in an option object with a resolve value will auto resolve
     *   // the Deferred with your value. An error will be raised if both
     *   // resolve and reject are supplied at the same time.
     *   resolve?: (value: any) => void;
     * }
     *
     * interface RejectDeferredOptions {
     *   // Passing in an option object with a reject reason will auto reject
     *   // the Deferred with your reason. An error will be raised if both
     *   // resolve and reject are supplied at the same time.
     *   reject?: (reason: any) => void;
     * }
     *
     * type DeferredOptions = BaseDeferredOptions &
     *   (ResolveDeferredOptions | RejectDeferredOptions)
     * ```
     *
     * @param {object} options see above for examples on supported options, but
     * when supplied, the constructor can take instructions on how to auto
     * resolve or reject the deferred created here.
     */
    constructor(options) {
        // Check if options is an object, if not, assign an empty object to config
        const config = (options && typeof (options) === 'object'
            ? options
            : {});
        // Throw an error if both resolve and reject options are provided
        if (config?.resolve && config?.reject) {
            throw new TypeError('resolve and reject options cannot be simultaneously provided');
        }
        // Create an empty object to store the resolve and reject functions
        let _resolve, _reject;
        // Create a new promise and assign its resolve and reject functions to resolvers
        super((resolve, reject) => {
            _resolve = resolve;
            _reject = reject;
            if (config?.executor && typeof (config?.executor) === 'function') {
                config?.executor(resolve, reject);
            }
        });
        /**
         * The promise backing this deferred object. Created when the constructor
         * runs, this promise is what all `Promise.prototype` functions are routed
         * to.
         *
         * @type {Promise}
         */
        _Deferred_promise.set(this, null
        /**
         * The reject() resolver that will be assigned when a new instance is
         * created. Invoking this function with or without a `reason` will cause
         * the deferred's promise to be settled.
         *
         * @type {function}
         */
        );
        /**
         * The reject() resolver that will be assigned when a new instance is
         * created. Invoking this function with or without a `reason` will cause
         * the deferred's promise to be settled.
         *
         * @type {function}
         */
        _Deferred_reject.set(this, null
        /**
         * The resolve() resolver that will be assigned when a new instance is
         * created. Invoking this function with or without a `value` will cause
         * the deferred's promise to be settled.
         *
         * @type {function}
         */
        );
        /**
         * The resolve() resolver that will be assigned when a new instance is
         * created. Invoking this function with or without a `value` will cause
         * the deferred's promise to be settled.
         *
         * @type {function}
         */
        _Deferred_resolve.set(this, null
        /**
         * When the Deferred is settled with {@link Deferred.resolve}, the `value`
         * passed to that function will be set here as well.
         *
         * @type {*}
         */
        );
        /**
         * When the Deferred is settled with {@link Deferred.resolve}, the `value`
         * passed to that function will be set here as well.
         *
         * @type {*}
         */
        this.value = null;
        /**
         * When the Deferred is settled with {@link Deferred.reject}, the `reason`
         * passed to that rejection will also be stored here.
         *
         * @type {*}
         */
        this.reason = null;
        /**
         * When either {@link Deferred.resolve} or {@link Deferred.reject} are called,
         * this property is set to `true`. Its current status at any time can be
         * queried using the {@link Deferred.settled} getter.
         *
         * @type {boolean}
         */
        _Deferred_settled.set(this, false
        /**
         * The constructor for Deferred instances. By default, a new Deferred will
         * have three important properties: `promise`, `resolve`, and `reject`.
         *
         * The constructor takes an object called `options`. It can have the
         * following properties:
         *
         * ```
         * interface BaseDeferredOptions {
         *   // Deferreds store the value or reason. To turn this off, pass true
         *   // to this option.
         *   doNotTrackAnswers?: boolean;
         * }
         *
         * interface ResolveDeferredOptions {
         *   // Passing in an option object with a resolve value will auto resolve
         *   // the Deferred with your value. An error will be raised if both
         *   // resolve and reject are supplied at the same time.
         *   resolve?: (value: any) => void;
         * }
         *
         * interface RejectDeferredOptions {
         *   // Passing in an option object with a reject reason will auto reject
         *   // the Deferred with your reason. An error will be raised if both
         *   // resolve and reject are supplied at the same time.
         *   reject?: (reason: any) => void;
         * }
         *
         * type DeferredOptions = BaseDeferredOptions &
         *   (ResolveDeferredOptions | RejectDeferredOptions)
         * ```
         *
         * @param {object} options see above for examples on supported options, but
         * when supplied, the constructor can take instructions on how to auto
         * resolve or reject the deferred created here.
         */
        );
        // Define the resolve function for the Deferred instance
        __classPrivateFieldSet(this, _Deferred_resolve, (value) => {
            // If doNotTrackAnswers is not set to true, store the value
            if (config?.doNotTrackAnswers !== true) {
                this.value = value;
            }
            // Mark the Deferred instance as settled
            __classPrivateFieldSet(this, _Deferred_settled, true, "f");
            // Resolve the promise with the provided value
            return _resolve(value);
        }, "f");
        // Define the reject function for the Deferred instance
        __classPrivateFieldSet(this, _Deferred_reject, async (reason) => {
            // If doNotTrackAnswers is not set to true, store the reason
            if (config?.doNotTrackAnswers !== true) {
                this.reason = reason;
            }
            // Mark the Deferred instance as settled
            __classPrivateFieldSet(this, _Deferred_settled, true, "f");
            // Reject the promise with the provided reason
            return _reject(reason);
        }, "f");
        __classPrivateFieldSet(this, _Deferred_promise, this, "f");
        // If a resolve option is provided, resolve the Deferred instance with it
        if (config?.resolve) {
            __classPrivateFieldGet(this, _Deferred_resolve, "f").call(this, config?.resolve);
        }
        // If a reject option is provided, reject the Deferred instance with it
        else if (config?.reject) {
            __classPrivateFieldGet(this, _Deferred_reject, "f").call(this, config?.reject);
        }
    }
    /**
     * Returns a boolean value that indicates whether or not this Deferred
     * has been settled (either resolve or reject have been invoked).
     *
     * @returns {boolean} `true` if either {@link Deferred.resolve} or
     * {@link Deferred.reject} have been invoked; `false` otherwise
     */
    get settled() {
        return __classPrivateFieldGet(this, _Deferred_settled, "f");
    }
    /**
     * Accessor for the promise managed by this Deferred instance.
     *
     * This getter provides access to the internal promise which is controlled
     * by the Deferred's resolve and reject methods. It allows external code to
     * attach callbacks for the resolution or rejection of the Deferred without
     * the ability to directly resolve or reject it.
     *
     * @returns {Promise} The promise controlled by this Deferred instance.
     */
    get promise() {
        return __classPrivateFieldGet(this, _Deferred_promise, "f");
    }
    /**
     * Resolves the Deferred with the given value. If the value is a thenable
     * (i.e., has a "then" method), the Deferred will "follow" that thenable,
     * adopting its eventual state; otherwise, the Deferred will be fulfilled
     * with the value. This function behaves the same as Promise.resolve.
     *
     * @param {*} value - The value to resolve the Deferred with.
     * @returns {Promise} A Promise that is resolved with the given value.
     */
    resolve(value) {
        return __classPrivateFieldGet(this, _Deferred_resolve, "f").call(this, value);
    }
    /**
     * Rejects the Deferred with the given reason. This function behaves the
     * same as Promise.reject. The Deferred will be rejected with the provided
     * reason.
     *
     * @param {*} reason - The reason to reject the Deferred with.
     * @returns {Promise} A Promise that is rejected with the given reason.
     */
    reject(reason) {
        return __classPrivateFieldGet(this, _Deferred_reject, "f").call(this, reason);
    }
    /**
     * A getter for the species symbol which returns a custom DeferredPromise
     * class. This class extends from Deferred and is used to ensure that the
     * constructor signature matches that of a Promise. The executor function
     * passed to the constructor of this class is used to initialize the Deferred
     * object with resolve and reject functions, similar to how a Promise would
     * be initialized.
     *
     * @returns {DeferredPromise} A DeferredPromise class that extends Deferred.
     */
    static get [(_Deferred_promise = new WeakMap(), _Deferred_reject = new WeakMap(), _Deferred_resolve = new WeakMap(), _Deferred_settled = new WeakMap(), Symbol.species)]() {
        return class DeferredPromise extends Deferred {
            /**
             * The constructor for the DeferredPromise class.
             * It takes an executor function which is used to initialize the Deferred.
             *
             * @param {Function} executor - A function that is passed with the resolve
             * and reject functions. The executor is expected to initialize the
             * Deferred by calling resolve or reject at some point.
             */
            constructor(executor) {
                super({ executor });
            }
        };
    }
}
exports.Deferred = Deferred;
exports.DeferredExtension = new extension_1.Extension(Deferred);
//# sourceMappingURL=deferred.js.map