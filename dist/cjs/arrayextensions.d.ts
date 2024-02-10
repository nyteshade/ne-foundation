/**
 * The `ArrayPrototypeExtensions` patch extends the prototype of the built-in
 * JavaScript `Array` with additional properties for convenience and improved
 * readability. By applying this patch, all array instances gain new getter
 * properties `first` and `last`, which provide quick access to the first and
 * last elements of the array, respectively. This enhancement simplifies common
 * operations on arrays and makes code more expressive and concise.
 */
export const ArrayPrototypeExtensions: Patch;
import { Patch } from '@nejs/extension';
