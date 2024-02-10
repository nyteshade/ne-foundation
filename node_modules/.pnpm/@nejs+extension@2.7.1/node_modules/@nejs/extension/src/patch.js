import { PatchToggle } from './patchtoggle.js'
import { PatchEntry } from './patchentry.js'

/**
 * The Patch class provides a mechanism to apply patches to properties or
 * methods of an object (the owner). It keeps track of the original state of
 * these properties and allows for the application and reversion of patches.
 */
export class Patch {
  /**
   * A record of conflicts between existing and patched properties or methods.
   * This object maps property names to their respective PatchEntry instances,
   * which contain information about the original and patched values.
   *
   * @type {object}
   */
  patchConflicts = {}

  /**
   * An object to store patch entries. Each key corresponds to a property or
   * method name on the owner object, and the value is the associated
   * PatchEntry instance which contains the patched and original values.
   *
   * @type {object}
   */
  patchEntries = {}

  /**
   * The object containing the patches to be applied to the owner. It is
   * initially undefined and will be populated with the patches passed to the
   * constructor.
   *
   * @type {object}
   */
  patchesOwner = undefined

  /**
   * The count of patches that have been applied. This is incremented
   * each time a patch is applied and decremented when a patch is
   * reverted.
   *
   * @type {number}
   */
  patchCount = 0

  /**
   * The number of patches that have been successfully applied. This count
   * is incremented after each successful patch application and decremented
   * when a patch is reverted.
   *
   * @type {number}
   */
  patchesApplied = 0

  /**
   * Constructs a new Patch instance. Supported options for Patch instances
   * include either a global condition for the Patch to be applied or
   * specific property conditions subjecting only a subset of the patches
   * to conditional application.
   *
   * @example
   * ```
   * const custom = Symbol.for('nodejs.util.inspect.custom')
   * const patch = new Patch(
   *   Object,
   *   {
   *     property: 'value',
   *     [custom](depth, options, inspect) {
   *       // ... custom return string for nodejs
   *     }
   *   },
   *   {
   *     conditions: {
   *       [custom]() { return process?.versions?.node !== null },
   *     },
   *   }
   * )
   * patch.apply() // applies `property` but only applies the `custom`
   *               // property if the JavaScript is running in NodeJS
   * ```
   *
   * @param {object} owner The object to which patches will be applied.
   * @param {object} patches An object containing properties or methods to
   *                         be patched onto the owner.
   * @param {object} [options={}] Additional options for patching behavior.
   */
  constructor(owner, patches, options = {}) {
    Object.assign(this, {
      owner,
      options,
    })

    this.patchesOwner = patches

    const globalCondition = this?.options.condition

    Reflect.ownKeys(patches).forEach(key => {
      const condition = this?.options?.conditions?.[key] ?? globalCondition
      try {
        this.patchEntries[key] = new PatchEntry(key, this.patchesOwner, condition)
        this.patchCount += 1
      }
      catch (error) {
        console.error(`Failed to process patch for ${key}\n`, error)
      }

      if (Reflect.has(this.owner, key)) {
        try {
          this.patchConflicts[key] = new PatchEntry(key, this.owner)
        }
        catch (error) {
          console.error(`Cannot capture conflicting patch key ${key}\n`, error)
        }
      }
    })

    if (!Patch.patches.has(owner)) {
      Patch.patches.set(owner, [])
    }

    Patch.patches.get(owner).push(this)
  }

  /**
   * Retrieves the patch entries as an array of [key, patchEntry] pairs.
   *
   * @returns {Array} An array of [key, patchEntry] pairs.
   */
  get entries() {
    return Reflect.ownKeys(this.patchEntries).map(key => {
      return [key, this.patchEntries[key]]
    })
  }

  /**
   * Retrieves an array of patch entries that have been successfully applied.
   * Each entry is a key-value pair array where the key is the patch identifier
   * and the value is the corresponding `PatchEntry` object. Only patches with
   * a state of `true` in `patchState` are included, indicating they are
   * currently applied to the owner object.
   *
   * @returns {Array} An array of [key, patchEntry]
   * pairs representing the applied patches.
   */
  get appliedEntries() {
    return Reflect.
      ownKeys(this.patchEntries).
      filter(key => this.patchState.get(key) === true).
      map(key => {
        return [key, this.patchEntries[key]]
      })
  }

  /**
   * Retrieves an array of patch entries that have not been applied. Each entry
   * is a key-value pair array where the key is the patch identifier and the
   * value is the corresponding `PatchEntry` object. Only patches with a state
   * of `false` in `patchState` are included, indicating they are not currently
   * applied to the owner object.
   *
   * @returns {Array} An array of [key, patchEntry]
   * pairs representing the unapplied patches.
   */
  get unappliedEntries() {
    return Reflect.
      ownKeys(this.patchEntries).
      filter(key => this.patchState.get(key) === false).
      map(key => {
        return [key, this.patchEntries[key]]
      })
  }

  /**
   * Depending on how the PatchEntry is configured, accessing the patch
   * by name can be somewhat irritating, so this provides an object with
   * the actual current patch value at the time patchValues is requested.
   *
   * @example let { patch1, patch2 } = patch.patchValues
   * @returns {object} an object with the patchName mapped to the current
   * computed patchEntry value.
   */
  get patches() {
    return this.entries.reduce((acc, [key, patchEntry]) => {
      acc[key] = patchEntry.computed
      return acc
    }, {})
  }

  /**
   * Retrieves an object containing all patches that have been successfully
   * applied. The object's keys are the patch keys, and the values are the
   * computed values of the corresponding patch entries. Only patches with
   * a state of `true` in `patchState` are considered applied.
   *
   * @returns {object} An object mapping each applied patch key to its
   * computed value.
   */
  get appliedPatches() {
    return this.entries.reduce((acc, [key, patchEntry]) => {
      if (this.patchState.get(key) === true) {
        acc[key] = patchEntry.computed
      }
      return acc
    }, {})
  }

  /**
   * Retrieves an object containing all patches that have not been applied.
   * The object's keys are the patch keys, and the values are the computed
   * values of the corresponding patch entries. Only patches with a state
   * of `false` in `patchState` are considered unapplied.
   *
   * @example
   * // Assuming `patch` is an instance of `Patch` and `patch1` is unapplied:
   * let unapplied = patch.unappliedPatches;
   * console.log(unapplied); // { patch1: computedValueOfPatch1 }
   *
   * @returns {object} An object mapping each unapplied patch key to its
   * computed value.
   */
  get unappliedPatches() {
    return this.entries.reduce((acc, [key, patchEntry]) => {
      if (this.patchState.get(key) === false) {
        acc[key] = patchEntry.computed
      }
      return acc
    }, {})
  }

  /**
   * Retrieves an array of patch keys.
   *
   * This getter returns an array containing only the keys of the patch entries,
   * which can be useful for iterating over the patches or checking for the
   * existence of specific patches by key.
   *
   * @returns {string[]} An array of patch keys.
   */
  get patchKeys() {
    return this.entries.map(([key, _]) => key)
  }

  /**
   * Retrieves the conflict entries (existing properties on the owner that
   * will be overridden by patches) as an array of [key, patchEntry] pairs.
   *
   * @returns {Array} An array of [key, patchEntry] pairs.
   */
  get conflicts() {
    return Reflect.ownKeys(this.patchConflicts).map(key => {
      return [key, this.patchConflicts[key]]
    })
  }

  /**
   * Checks to see if the tracked number of applied patches is greater than 0
   *
   * @returns {boolean} true if at least one patch has been applied
   */
  get applied() {
    return this.patchesApplied > 0
  }

  /**
   * Provided for semantics, but this method is synonymous with {@link applied}.
   *
   * @returns {boolean} true if at least one patch has been applied
   */
  get isPartiallyPatched() {
    return this.applied
  }

  /**
   * Returns true only when the number of tracked patches matches the number
   * of applied patches.
   *
   * @returns {boolean} true if applied patches is equal to the count of patches
   */
  get isFullyPatched() {
    return this.patchCount == this.patchesApplied
  }

  /**
   * Applies all patches to the owner object. If a property with the same key
   * already exists on the owner, it will be overridden. Optionally a callback
   * can be supplied to the call to revert. If the callback is a valid function,
   * it will be invoked with an object containing the results of the reversion
   * of the patch. The callback receives a single parameter which is an object
   * of counts. It has the signature:
   *
   * ```
   * type counts = {
   *   patches: number;
   *   applied: number;
   *   errors: Array<PatchEntry,Error>;
   *   notApplied: number;
   * }
   * ```
   *
   * While the keys may be obvious to some, `patches` is the count of patches
   * this instance tracks. `applied` is the number of patches that were applied
   * 'errors' is an array of arrays where the first element is the `PatchEntry`
   * and the second element is an `Error` indicating the problem. An error will
   * only be generated if `isAllowed` is `true` and the patch still failed to
   * apply Lastly `notApplied` is the number of patches that were unable to
   * be applied.
   *
   * Additional logic that should track
   * ```
   *   • patches should === applied when done
   *   • errors.length should be 0 when done
   *   • notApplied should be 0 when done
   * ```
   *
   * @param {function} metrics - a callback which receives a status of the
   * `revert` action if supplied. This callback will not be invoked, nor will
   * any of the other logic be captured, if {@link applied} returns false
   */
  apply(metrics) {
    const entries = this.entries
    const counts = {
      patches: entries.length,
      applied: 0,
      errors: [],
      notApplied: entries.length,
    }

    this.patchState.clear()

    entries.forEach(([,patch]) => {
      if (patch.isAllowed) {
        // Patch
        Object.defineProperty(this.owner, patch.key, patch.descriptor)

        // Verify
        let oDesc = Object.getOwnPropertyDescriptor(this.owner, patch.key)
        if (this.#equalDescriptors(oDesc, patch.descriptor)) {
          counts.applied += 1
          counts.notApplied -= 1

          this.patchState.set(patch, true)

        }
        else {
          counts.errors.push([patch, new Error(
            `Could not apply patch for key ${patch.key}`
          )])
          this.patchState.set(patch, false)
        }
      }
      else {
        this.patchState.set(patch, false)
      }
    })

    this.patchesApplied = counts.applied

    if (typeof metrics === 'function') {
      metrics(counts)
    }
  }

  /**
   * Creates an easy to use toggle for working with `Patch` classes
   *
   * @param {boolean} preventRevert true if calling stop() on the toggle does not
   * revert the patch. false, the default, if it should.
   * @returns {PatchToggle} an instance of PatchToggle wrapped around this instance
   * of `Patch`
   * @example const toggle = ObjectExtensions.createToggle().start()
   */
  createToggle(preventRevert = false) {
    return new PatchToggle(this, preventRevert)
  }

  /**
   * Reverts all applied patches on the owner object, restoring any overridden
   * properties to their original state. Optionally a callback can be supplied to
   * the call to revert. If the callback is a valid function, it will be invoked
   * with an object containing the results of the reversion of the patch. The
   * callback receives a single parameter which is an object of counts. It has
   * the signature:
   *
   * ```
   * type counts = {
   *   patches: number;
   *   reverted: number;
   *   restored: number;
   *   conflicts: number;
   *   errors: Array<PatchEntry,Error>;
   *   stillApplied: number;
   * }
   * ```
   *
   * While the keys may be obvious to some, `patches` is the count of patches
   * this instance tracks. `reverted` is the number of patches that were removed'
   * `restored` is the number of originally conflicting keys that were restored.
   * `conflicts` is the total number of conflicts expected. `errors` is an array of
   * arrays where the first element is the `PatchEntry` and the second element
   * is an `Error` indicating the problem. Lastly `stillApplied` is the number of
   * patchesApplied still tracked. If this is greater than zero, you can assume
   * something went wrong.
   *
   * Additional logic that should track
   * ```
   *   • patches should === reverted when done
   *   • restored should === conflicts when done
   *   • errors.length should be 0 when done
   *   • stillApplied should be 0 when done
   * ```
   *
   * @param {function} metrics - a callback which receives a status of the
   * `revert` action if supplied. This callback will not be invoked, nor will
   * any of the other logic be captured, if {@link applied} returns false
   */
  revert(metrics) {
    if (!this.applied) {
      return
    }

    const entries = this.entries
    const conflicts = this.conflicts

    const counts = {
      patches: entries.length,
      reverted: 0,
      restored: 0,
      conflicts: conflicts.length,
      errors: [],
      stillApplied: 0,
    }

    entries.forEach(([,patch]) => {
      const successful = delete this.owner[patch.key]
      if (successful) {
        this.patchesApplied -= 1
        counts.reverted += 1
        this.patchState.set(patch, false)
      }
      else {
        counts.errors.push([patch, new Error(
          `Failed to revert patch ${patch.key}`
        )])
      }
    })

    conflicts.forEach(([,patch]) => {
      Object.defineProperty(this.owner, patch.key, patch.descriptor)
      const appliedDescriptor = Object.getOwnPropertyDescriptor(this.owner, patch.key)
      if (this.#equalDescriptors(patch.descriptor, appliedDescriptor)) {
        counts.restored += 1
      }
      else {
        counts.errors.push([patch, new Error(
          `Failed to restore original ${patch.key}`
        )])
      }
    })

    counts.stillApplied = this.patchesApplied
    if (typeof metrics === 'function') {
      metrics(counts)
    }
  }

  /**
   * Removes this Patch instance from being tracked amongst all the tracked Patch
   * instances. The JavaScript virtual machine will clean this instance up once
   * nothing else is holding a reference to it.
   */
  release() {
    const patches = Patch.patches.get(this.owner)
    patches.splice(patches.find(e => e === this), 1)
  }

  /**
   * The object to which the patches are applied.
   */
  owner = null;

  /**
   * Additional options for patching behavior.
   */
  options = null;

  /**
   * Patches that are currently live and active will have true as their
   * value and inert or non-applied patches will have false as their
   * value. The key is always the associated {@link PatchEntry}.
   */
  patchState = new Map();

  /**
   * Creates an iterator for the patch entries, allowing the `Patch` instance to
   * be directly iterable using a `for...of` loop. Each iteration will yield a
   * `[key, patchEntry]` pair, where `key` is the property name and `patchEntry`
   * is the corresponding `PatchEntry` instance.
   *
   * @returns {Iterator} An iterator that yields `[key, patchEntry]` pairs.
   */
  [Symbol.iterator]() {
    return this.entries.values()
  }

  /**
   * Compares two property descriptor objects to determine if they are equivalent.
   *
   * This method checks if both descriptors have the same value for the
   * `configurable`, `enumerable`, `value`, `writable`, `get`, and `set`
   * properties. If any of these properties differ between the two descriptors,
   * the descriptors are considered not equivalent.
   *
   * @param {PropertyDescriptor} left - The first descriptor to compare.
   * @param {PropertyDescriptor} right - The second descriptor to compare.
   * @returns {boolean} - True if the descriptors are equivalent, false otherwise.
   * @private
   */
  #equalDescriptors(left, right) {
    if (!left || !right) {
      return false;
    }

    return (
      left.configurable === right.configurable &&
      left.enumerable === right.enumerable &&
      left.value === right.value &&
      left.writable === right.writable &&
      left.get === right.get &&
      left.set === right.set
    )
  }

  /**
   * Custom inspection function for Node.js that is called when `util.inspect`
   * is used to convert the instance to a string. This allows for customizing
   * the output of `util.inspect` for objects of this class.
   *
   * @param {number} depth The current depth of the inspection. If the depth
   * is less than the recurse times set, it will return the object itself,
   * otherwise it will return the inspected result.
   * @param {object} options An object containing options for the inspection.
   * @param {function} inspect The inspection function provided by Node.js
   * that can be called to inspect other properties with the same options as
   * the original call.
   * @returns {string} A string representation of the instance tailored for
   * Node.js' `util.inspect`.
   */
  [Symbol.for('nodejs.util.inspect.custom')](depth, options, inspect) {
    const exprs = {
      get quotes() { return /^(\x1B\[\d+m)?['"]|["'](\x1B\[\d+m)?$/g },
      get arrays() { return /^(\x1B\[\d+m)?\[ | \](\x1B\[\d+m)?$/g },
    }
    const opts = { ...options, depth };
    const type = this.owner?.name ?? ''
    const name = (type.length
      ? `[${inspect(type, options).replaceAll(exprs.quotes, '$1$2')}]`
      : ''
    )
    const keys = (
      inspect(this.patchKeys, opts)
        .replaceAll(exprs.arrays, '$1$2')
        .replaceAll(/'(.*?)'/g, "$1")
    )
    return `${this.constructor.name}${name} { ${keys} }`;
  }

  /**
   * A global mapping of all patches in play
   */
  static patches = new Map()

  /**
   * Applies all patches associated with a given owner object. This method
   * is used to enable all patches for a specific owner if they have been
   * previously registered.
   *
   * @param {object} owner The object whose patches are to be applied.
   */
  static enableFor(owner) {
    if (Patch.patches.has(owner)) {
      for (const patch of Patch.patches.get(owner)) {
        patch.apply()
      }
    }
  }

  /**
   * Reverts all patches associated with a given owner object. This method
   * is used to disable all patches for a specific owner if they have been
   * previously applied.
   *
   * @param {object} owner The object whose patches are to be reverted.
   */
  static disableFor(owner) {
    if (Patch.patches.has(owner)) {
      for (const patch of Patch.patches.get(owner)) {
        patch.revert()
      }
    }
  }

  /**
   * A static getter that provides a proxy to manage and interact with the
   * patches that have been applied globally. This proxy abstracts the
   * underlying details and presents a simplified interface for querying and
   * manipulating applied patches. It is particularly useful in IDEs, as it
   * allows developers to access the state of applied patches without needing
   * to delve into the source code.
   *
   * @returns {Object} An object showing all the keys known to be patched for
   * the default owner, `globalThis`
   */
  static get applied() {
    return this.#allPatchesForOwner(globalThis, true)
  }

  /**
   * A static getter that provides access to a proxy representing all known
   * patches, whether applied or not. This is useful for inspecting the
   * complete set of patches that have been registered in the system, without
   * limiting the view to only those that are currently active. The proxy
   * abstracts the underlying details and presents a simplified interface for
   * querying and manipulating the patches.
   *
   * @returns {Proxy} A proxy object that represents a virtual view of all
   * registered patches, allowing for operations like checking if a patch is
   * known and retrieving patch values.
   */
  static get known() {
    return this.#allPatchesForOwner(globalThis, false)
  }

  /**
   * A static getter that provides access to a proxy for managing patch
   * entries with a toggle functionality. This proxy allows the temporary
   * application of patches within a certain scope, and automatically reverts
   * them after the scope ends. It is useful for applying patches in a
   * controlled manner, ensuring that they do not remain active beyond the
   * intended usage.
   *
   * @returns {Proxy} A proxy object that represents a virtual view of the
   * patches with toggle functionality, allowing for temporary application
   * and automatic reversion of patches.
   */
  static get use() {
    return this.#allPatchesForOwner(globalThis, false, true)
  }

  /**
   * A static getter that provides access to a proxy for managing patch
   * entries with lazy initialization. This proxy defers the creation and
   * application of patches until they are explicitly requested. It is
   * beneficial for performance optimization, as it avoids the overhead of
   * initializing patches that may not be used.
   *
   * @returns {Proxy} A proxy object that represents a virtual view of the
   * patches with lazy initialization, allowing patches to be created and
   * applied only when needed.
   */
  static get lazy() {
    return this.#allPatchesForOwner(globalThis, false, false, true)
  }

  /**
   * Returns an object with getters to access different proxy views of patches
   * scoped to a specific owner. This allows for interaction with patches
   * that are either applied, known, or used within a certain scope, providing
   * a controlled environment for patch management.
   *
   * @param {object} owner - The object to scope the patch proxies to.
   * @returns {object} An object containing getters for `applied`, `known`,
   * and `use` proxies:
   * - `applied`: Proxy for patches applied to the owner.
   * - `known`: Proxy for all patches known to the owner, applied or not.
   * - `use`: Proxy that allows temporary application of patches.
   */
  static scopedTo(owner) {
    const allForOwner = (
      owner,
      appliedOnly,
      wrapInToggle = false,
      applyOnRequest = false
    ) => {
      return this.#allPatchesForOwner(
        owner,
        appliedOnly,
        wrapInToggle,
        applyOnRequest
      )
    }

    return {
      /**
       * Getter for a proxy that represents patches applied to the owner.
       * This proxy provides a simplified interface for interacting with
       * applied patches, such as checking their status or retrieving values.
       *
       * @returns {Proxy} A proxy to the applied patches.
       */
      get applied() {
        return allForOwner(owner, true, false)
      },

      /**
       * Getter for a proxy that represents all patches known to the owner,
       * whether they are applied or not. This proxy allows for querying
       * and manipulation of the patches without directly accessing them.
       *
       * @returns {Proxy} A proxy to all known patches.
       */
      get known() {
        return allForOwner(owner, false, false)
      },

      /**
       * Getter for a proxy that enables temporary application of patches
       * within a certain scope. The patches are automatically reverted
       * after the scope ends, ensuring controlled usage.
       *
       * @returns {Proxy} A proxy to patches with toggle functionality.
       */
      get use() {
        return allForOwner(owner, false, true)
      },

      /**
       * Getter for a proxy that represents patches that are not immediately
       * applied but are applied on request. This allows for patches to be
       * applied only when they are explicitly needed, potentially improving
       * performance by deferring the application of patches until necessary.
       *
       * @returns {Proxy} A proxy to patches that are applied on request.
       */
      get lazy() {
        return allForOwner(owner, false, false, true)
      },
    }
  }

  /**
   * Aggregates patches for a given owner into a single object, optionally
   * filtering by applied status and wrapping in a toggle function.
   *
   * This method collects all patches associated with the specified owner
   * and constructs an object where each patch is represented by its key.
   * If `onlyApplied` is true, only patches that are currently applied will
   * be included. If `wrapInToggle` is true, each patch will be represented
   * as a function that temporarily applies the patch when called.
   *
   * @param {object} owner - The owner object whose patches are to be
   * aggregated.
   * @param {boolean} onlyApplied - If true, only include patches that
   * are applied.
   * @param {boolean} [wrapInToggle=false] - If true, wrap patches in a
   * toggle function for temporary application.
   * @returns {object} An object representing the aggregated patches, with
   * each patch keyed by its property name.
   * @private
   */
  static #allPatchesForOwner(
    owner,
    onlyApplied,
    wrapInToggle = false,
    applyOnRequest = false
  ) {
    return [...Patch.patches.values()].
      flat().
      filter(patch => patch.owner === owner).
      reduce((accumulator, patch) => {
        for (const [,patchEntry] of patch.entries) {
          if (onlyApplied && patch.patchState.get(patchEntry) !== true) {
            continue
          }

          if (wrapInToggle) {
            accumulator[patchEntry.key] = async (usage) => {
              if (typeof usage !== 'function') {
                return
              }

              const type = Object.prototype.toString.call(usage)
              const toggle = patch.createToggle()

              toggle.start()
              if('[object AsyncFunction]' === type) {
                await usage(patchEntry.computed, patchEntry)
              }
              else {
                usage(patchEntry.computed, patchEntry)
              }
              toggle.stop()
            }

            continue
          }

          if (applyOnRequest) {
            Object.defineProperty(accumulator, patchEntry.key, {
              get() {
                patch.apply()
                return patchEntry.computed
              },
              enumerable: true,
              configurable: true,
            });

            continue;
          }


          if (patchEntry.isAccessor) {
            let dynName = `applyAccessorFor_${String(patchEntry.key)}`
            let dynNameContainer = {
              [dynName](applyTo) {
                patchEntry.applyTo(applyTo)
                return applyTo
              }
            };

            accumulator[patchEntry.key] = dynNameContainer[dynName]
          }
          else {
            patchEntry.applyTo(accumulator)
          }
        }

        return accumulator
      }, {})
  }

  /**
   * A getter for the custom inspect symbol used by Node.js.
   *
   * @returns {symbol} The custom inspect symbol.
   */
  static get CustomInspect() {
    return Symbol.for('nodejs.util.inspect.custom')
  }

  /**
   * Strips leading and trailing control characters, brackets, braces, and
   * quotes from a string. This is typically used to clean strings that may
   * have special characters or escape sequences that are not desired in the
   * output.
   *
   * @param {string} fromString The string to be stripped of extras.
   * @returns {string} The cleaned string with extras stripped.
   */
  static stripExtras(fromString) {
    return fromString
      .replaceAll(
        /^(\x1B\[\d+m)?[\[\{]\s?|\s?[\]\}](\x1B\[\d+m)?$/gm,
        '$1$2'
      )
      .replaceAll(
        /['"](.*?)['"]/gm,
        '$1'
      )
  }
}