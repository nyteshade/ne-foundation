/**
 * The `ReflectExtensions` class is a patch applied to the built-in JavaScript
 * `Reflect` object. It extends `Reflect` with additional utility methods that
 * enhance its capabilities. These methods provide more advanced ways of
 * interacting with object properties, such as checking for the presence of
 * multiple keys at once (`hasAll`) or verifying if at least one specified key
 * exists in an object (`hasSome`). This class is part of the `@nejs/extension`
 * library and is designed to offer these extended functionalities in a way
 * that is consistent with the existing `Reflect` API, making it intuitive for
 * developers who are already familiar with standard reflection methods in
 * JavaScript.
 */
export const ReflectExtensions: Patch;
import { Patch } from '@nejs/extension';
