export { Extension } from "./extension.js";
export { Patch } from "./patch.js";
export { PatchEntry } from "./patchentry.js";
export { PatchToggle } from "./patchtoggle.js";
export namespace Errors {
    const CannotBeExtended: typeof CannotBeExtendedError;
    const MissingOwnerValue: typeof import("./errors/MissingOwnerValue.js").MissingOwnerValue;
}
import { CannotBeExtendedError } from './errors/CannotBeExtendedError.js';
