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
export class Deferred extends Promise<any> {
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
    static get [Symbol.species](): DeferredPromise;
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
    constructor(options: object);
    /**
     * When the Deferred is settled with {@link Deferred.resolve}, the `value`
     * passed to that function will be set here as well.
     *
     * @type {*}
     */
    value: any;
    /**
     * When the Deferred is settled with {@link Deferred.reject}, the `reason`
     * passed to that rejection will also be stored here.
     *
     * @type {*}
     */
    reason: any;
    /**
     * Returns a boolean value that indicates whether or not this Deferred
     * has been settled (either resolve or reject have been invoked).
     *
     * @returns {boolean} `true` if either {@link Deferred.resolve} or
     * {@link Deferred.reject} have been invoked; `false` otherwise
     */
    get settled(): boolean;
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
    get promise(): Promise<any>;
    /**
     * Resolves the Deferred with the given value. If the value is a thenable
     * (i.e., has a "then" method), the Deferred will "follow" that thenable,
     * adopting its eventual state; otherwise, the Deferred will be fulfilled
     * with the value. This function behaves the same as Promise.resolve.
     *
     * @param {*} value - The value to resolve the Deferred with.
     * @returns {Promise} A Promise that is resolved with the given value.
     */
    resolve(value: any): Promise<any>;
    /**
     * Rejects the Deferred with the given reason. This function behaves the
     * same as Promise.reject. The Deferred will be rejected with the provided
     * reason.
     *
     * @param {*} reason - The reason to reject the Deferred with.
     * @returns {Promise} A Promise that is rejected with the given reason.
     */
    reject(reason: any): Promise<any>;
    #private;
}
export const DeferredExtension: Extension;
import { Extension } from '@nejs/extension';
