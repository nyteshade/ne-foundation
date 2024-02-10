export { Extension } from './extension.js';
export { Patch } from './patch.js';
export { PatchEntry } from './patchentry.js';
export { PatchToggle } from './patchtoggle.js';
import { CannotBeExtendedError } from './errors/CannotBeExtendedError.js';
import { MissingOwnerValue } from './errors/MissingOwnerValue.js';
export const Errors = {
    get CannotBeExtended() { return CannotBeExtendedError; },
    get MissingOwnerValue() { return MissingOwnerValue; },
};
//# sourceMappingURL=index.js.map