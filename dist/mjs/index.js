import { FunctionExtensions, FunctionPrototypeExtensions } from './functionextensions.js';
import { ObjectExtensions, ObjectPrototypeExtensions } from './objectextensions.js';
import { MapPrototypeExtensions } from './mapextensions.js';
import { SetPrototypeExtensions } from './setextensions.js';
import { ReflectExtensions } from './reflectextensions.js';
import { StringExtensions } from './stringextensions.js';
import { SymbolExtensions } from './symbolextensions.js';
import { ArrayPrototypeExtensions } from './arrayextensions.js';
import { DescriptorExtensions, Descriptor } from './newClasses/descriptor.js';
import { GlobalFunctionsAndProps } from './globals.js';
import { RefSetExtensions } from './newClasses/refset.js';
import { RefMapExtensions } from './newClasses/refmap.js';
import { DeferredExtension } from './newClasses/deferred.js';
import { AsyncIteratorExtensions, AsyncIterableExtensions } from './newClasses/asyncIterable.js';
import { IteratorExtensions, IterableExtensions } from './newClasses/iterable.js';
const StaticPatches = [
    [Object, ObjectExtensions, Object.name],
    [Function, FunctionExtensions, Function.name],
    [Reflect, ReflectExtensions, 'Reflect'], // Missing a .name property
    [String, StringExtensions, String.name],
    [Symbol, SymbolExtensions, 'Symbol'], // Missing a .name property
];
const InstancePatches = [
    [Object.prototype, ObjectPrototypeExtensions, Object.name],
    [Function.prototype, FunctionPrototypeExtensions, Function.name],
    [Array.prototype, ArrayPrototypeExtensions, Array.name],
    [Map.prototype, MapPrototypeExtensions, Map.name],
    [Set.prototype, SetPrototypeExtensions, Set.name],
];
const Patches = new Map([
    ...StaticPatches,
    ...InstancePatches,
]);
const Extensions = {
    [AsyncIterableExtensions.key]: AsyncIterableExtensions,
    [AsyncIteratorExtensions.key]: AsyncIteratorExtensions,
    [DeferredExtension.key]: DeferredExtension,
    [DescriptorExtensions.key]: DescriptorExtensions,
    [IterableExtensions.key]: IterableExtensions,
    [IteratorExtensions.key]: IteratorExtensions,
    [RefMapExtensions.key]: RefMapExtensions,
    [RefSetExtensions.key]: RefSetExtensions,
};
const Controls = {};
Object.assign(Controls, {
    enableAll() {
        Controls.enablePatches();
        Controls.enableExtensions();
    },
    enablePatches() {
        Patches.forEach((extension) => { extension.apply(); });
    },
    enableStaticPatches(filter = ([owner, extension]) => true) {
        const patches = StaticPatches.filter(toFilterFn(filter));
        patches.forEach(([_, extension]) => extension.apply());
        return patches;
    },
    enableInstancePatches(filter = ([owner, extension]) => true) {
        const patches = InstancePatches.filter(toFilterFn(filter));
        patches.forEach(([_, extension]) => extension.apply());
        return patches;
    },
    enableExtensions() {
        Object.values(Extensions).forEach((extension) => { extension.apply(); });
        GlobalFunctionsAndProps.apply();
    },
    disableAll() {
        Controls.disablePatches();
        Controls.disableExtensions();
    },
    disablePatches() {
        Patches.forEach((extension) => { extension.revert(); });
    },
    disableStaticPatches(filter = ([owner, extension]) => true) {
        const patches = StaticPatches.filter(toFilterFn(filter));
        patches.forEach(([_, extension]) => extension.revert());
        return patches;
    },
    disableInstancePatches(filter = ([owner, extension]) => true) {
        const patches = InstancePatches.filter(toFilterFn(filter));
        patches.forEach(([_, extension]) => extension.revert());
        return patches;
    },
    disableExtensions() {
        Object.values(Extensions).forEach((extension) => { extension.revert(); });
        GlobalFunctionsAndProps.revert();
    },
});
export const all = (() => {
    const dest = {
        patches: {},
        classes: {},
        global: {},
    };
    const entriesReducer = (accumulator, [key, entry]) => {
        const descriptor = new Descriptor(entry.descriptor, entry.owner);
        descriptor.applyTo(accumulator, key, true);
        return accumulator;
    };
    const staticPatchReducer = (accumulator, [_, patch, ownerName]) => {
        if (!accumulator?.[ownerName]) {
            accumulator[ownerName] = {};
        }
        [...patch].reduce(entriesReducer, accumulator[ownerName]);
        return accumulator;
    };
    const instancePatchReducer = (accumulator, [_, patch, ownerName]) => {
        if (!accumulator?.[ownerName])
            accumulator[ownerName] = {};
        if (!accumulator[ownerName]?.prototype)
            accumulator[ownerName].prototype = {};
        [...patch].reduce(entriesReducer, accumulator[ownerName].prototype);
        return accumulator;
    };
    StaticPatches.reduce(staticPatchReducer, dest.patches);
    InstancePatches.reduce(instancePatchReducer, dest.patches);
    (Object.values(Extensions)
        .flatMap(extension => [...extension])
        .reduce(entriesReducer, dest.classes));
    for (const [key, entry] of GlobalFunctionsAndProps) {
        const descriptor = new Descriptor(entry.descriptor, entry.owner);
        Object.defineProperty(dest.global, key, descriptor.toObject(true));
    }
    return dest;
})();
const results = {
    ...Controls,
    Extensions,
    Patches,
    GlobalFunctionsAndProps,
    StaticPatches,
    InstancePatches,
    Controls,
    extensions: Extensions,
    patches: Patches,
    all,
};
export default results;
export { Extensions, Patches, StaticPatches, InstancePatches, Controls, GlobalFunctionsAndProps, };
function toFilterFn(filter = ([owner, extension]) => true) {
    let filterFn = filter;
    if (typeof filterFn !== 'function') {
        const elements = Array.isArray(filter) ? filter : [filter];
        filterFn = ([owner, _]) => {
            for (const element of elements) {
                const elementStr = String(element);
                if (elementStr.startsWith('^')) {
                    if ((owner?.name ?? owner) != elementStr.substring(1)) {
                        return true;
                    }
                }
                if ((owner?.name ?? owner) == elementStr) {
                    return true;
                }
            }
            return false;
        };
    }
    return filterFn;
}
//# sourceMappingURL=index.js.map