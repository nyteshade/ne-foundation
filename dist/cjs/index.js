"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalFunctionsAndProps = exports.Controls = exports.InstancePatches = exports.StaticPatches = exports.Patches = exports.Extensions = exports.all = void 0;
const functionextensions_js_1 = require("./functionextensions.js");
const objectextensions_js_1 = require("./objectextensions.js");
const mapextensions_js_1 = require("./mapextensions.js");
const setextensions_js_1 = require("./setextensions.js");
const reflectextensions_js_1 = require("./reflectextensions.js");
const stringextensions_js_1 = require("./stringextensions.js");
const symbolextensions_js_1 = require("./symbolextensions.js");
const arrayextensions_js_1 = require("./arrayextensions.js");
const descriptor_js_1 = require("./newClasses/descriptor.js");
const globals_js_1 = require("./globals.js");
Object.defineProperty(exports, "GlobalFunctionsAndProps", { enumerable: true, get: function () { return globals_js_1.GlobalFunctionsAndProps; } });
const refset_js_1 = require("./newClasses/refset.js");
const refmap_js_1 = require("./newClasses/refmap.js");
const deferred_js_1 = require("./newClasses/deferred.js");
const asyncIterable_js_1 = require("./newClasses/asyncIterable.js");
const iterable_js_1 = require("./newClasses/iterable.js");
const StaticPatches = [
    [Object, objectextensions_js_1.ObjectExtensions, Object.name],
    [Function, functionextensions_js_1.FunctionExtensions, Function.name],
    [Reflect, reflectextensions_js_1.ReflectExtensions, 'Reflect'], // Missing a .name property
    [String, stringextensions_js_1.StringExtensions, String.name],
    [Symbol, symbolextensions_js_1.SymbolExtensions, 'Symbol'], // Missing a .name property
];
exports.StaticPatches = StaticPatches;
const InstancePatches = [
    [Object.prototype, objectextensions_js_1.ObjectPrototypeExtensions, Object.name],
    [Function.prototype, functionextensions_js_1.FunctionPrototypeExtensions, Function.name],
    [Array.prototype, arrayextensions_js_1.ArrayPrototypeExtensions, Array.name],
    [Map.prototype, mapextensions_js_1.MapPrototypeExtensions, Map.name],
    [Set.prototype, setextensions_js_1.SetPrototypeExtensions, Set.name],
];
exports.InstancePatches = InstancePatches;
const Patches = new Map([
    ...StaticPatches,
    ...InstancePatches,
]);
exports.Patches = Patches;
const Extensions = {
    [asyncIterable_js_1.AsyncIterableExtensions.key]: asyncIterable_js_1.AsyncIterableExtensions,
    [asyncIterable_js_1.AsyncIteratorExtensions.key]: asyncIterable_js_1.AsyncIteratorExtensions,
    [deferred_js_1.DeferredExtension.key]: deferred_js_1.DeferredExtension,
    [descriptor_js_1.DescriptorExtensions.key]: descriptor_js_1.DescriptorExtensions,
    [iterable_js_1.IterableExtensions.key]: iterable_js_1.IterableExtensions,
    [iterable_js_1.IteratorExtensions.key]: iterable_js_1.IteratorExtensions,
    [refmap_js_1.RefMapExtensions.key]: refmap_js_1.RefMapExtensions,
    [refset_js_1.RefSetExtensions.key]: refset_js_1.RefSetExtensions,
};
exports.Extensions = Extensions;
const Controls = {};
exports.Controls = Controls;
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
        globals_js_1.GlobalFunctionsAndProps.apply();
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
        globals_js_1.GlobalFunctionsAndProps.revert();
    },
});
exports.all = (() => {
    const dest = {
        patches: {},
        classes: {},
        global: {},
    };
    const entriesReducer = (accumulator, [key, entry]) => {
        const descriptor = new descriptor_js_1.Descriptor(entry.descriptor, entry.owner);
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
    for (const [key, entry] of globals_js_1.GlobalFunctionsAndProps) {
        const descriptor = new descriptor_js_1.Descriptor(entry.descriptor, entry.owner);
        Object.defineProperty(dest.global, key, descriptor.toObject(true));
    }
    return dest;
})();
const results = {
    ...Controls,
    Extensions,
    Patches,
    GlobalFunctionsAndProps: globals_js_1.GlobalFunctionsAndProps,
    StaticPatches,
    InstancePatches,
    Controls,
    extensions: Extensions,
    patches: Patches,
    all: exports.all,
};
exports.default = results;
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