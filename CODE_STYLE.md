# Code Style Guide

This document is written for AI assistants generating code in `@nejs` repositories. These are not aspirational conventions — they are patterns extracted from existing code. Follow them precisely so that generated code is indistinguishable from hand-written code.

## Semicolons

Do not use semicolons. Rely on ASI (Automatic Semicolon Insertion). The one exception is class property definitions declared outside of any method or constructor — these get semicolons.

```javascript
// no semicolons in statements, imports, returns, etc.
const name = 'Brie'
const items = [1, 2, 3]
return this.#settled
import { Patch } from '@nejs/extension'

// semicolons on class property definitions
export class Deferred extends Promise {
  #promise = null;
  #reject = null;
  #resolve = null;

  value = null;
  reason = null;

  #settled = false;

  constructor(options) {
    // no semicolons inside methods
    const config = parseOptions(options)
    let _resolve, _reject
  }
}
```

## Quotes

Use single quotes. Reserve double quotes for strings that contain single quotes. Use template literals when interpolating.

```javascript
import { Patch } from '@nejs/extension'
const tag = 'EnumValue'
const msg = `${this.major}.${this.minor}.${this.patch}`
```

## Line Length

Aim for 80 columns or fewer. Wrap lines when it makes reading the code more pleasurable — in both code and JSDoc prose. Do not forcibly wrap to the detriment of legibility; a line that reads clearly at 85 columns is better than one awkwardly broken at 79. The goal is readability, not a hard ruler.

## Indentation

2 spaces. No tabs.

## Variable Declarations

`const` by default. `let` only when reassignment is required. Never `var`.

```javascript
const config = parseOptions(opts)
let _resolve, _reject
```

## Arrow Function Parameters

Always parenthesize, even with a single parameter.

```javascript
values.forEach((value) => this.add(value))
this.some((element) => element === value)
```

## Arrow Functions vs `function`

Use arrow functions for callbacks, short lambdas, and closures that don't need their own `this`. Use `function` declarations or named function expressions when the function needs `this` binding, is a Symbol-keyed method, or benefits from a name for stack traces.

```javascript
// arrow for callbacks
entries.filter((e) => Array.isArray(e) && e.length === 2)

// named function for Symbol-keyed methods that use `this`
[Symbol.for('compare')]: data(
  function compareValue(to) {
    const {real: lReal, value: lValue} = this
    // ...
  }, false, true, false
)
```

## Braces on Single-Statement Bodies

If the body of an `if`, `for`, or similar block is a single short statement, omit the braces. Brace everything else.

```javascript
// unbraced — single short statement
if (!isLEnum || !isREnum)
  return false

if (!Array.isArray(array))
  return false

// braced — multi-line or complex body
if (config?.resolve && config?.reject) {
  throw new TypeError(
    'resolve and reject options cannot be simultaneously provided'
  )
}
```

## `else` and `else if` Placement

Drop `else` and `else if` to a new line. Do not cuddle them on the closing brace line.

```javascript
if (config?.resolve) {
  this.#resolve(config?.resolve)
}
else if (config?.reject) {
  this.#reject(config?.reject)
}
```

```javascript
if (Descriptor.isDescriptor(object)) {
  this._desc = object
}
else if (isObject(object) && isValidKey(key)) {
  this._desc = Object.getOwnPropertyDescriptor(object, key)
}
```

## Ternary Formatting

Short ternaries stay on one line. Long ternaries break across lines with `?` and `:` indented, and the closing paren on its own line.

```javascript
// short
const store = is.object(store) ? store : undefined

// long
const config = (options && typeof(options) === 'object'
  ? options
  : {}
)
```

## Multi-Line Boolean Expressions

Trailing `&&` or `||` at the end of each line. Subsequent conditions align under the first.

```javascript
return this.major === otherVersion.major &&
       this.minor === otherVersion.minor &&
       this.patch === otherVersion.patch &&
       this.prerelease === otherVersion.prerelease
```

## Parenthesized Multi-Line Returns

Wrap complex return expressions in parentheses. Opening paren on the `return` line.

```javascript
return (
  value instanceof Function &&
  String(value).includes('=>') &&
  !String(value).startsWith('bound') &&
  !Reflect.has(value, 'prototype')
)
```

```javascript
return (array
  .map((value) => (typeof value))
  .some((value) => value === 'symbol')
)
```

## Destructuring

Destructure at point of use. Renaming during destructuring is common and encouraged when it clarifies intent or prevents collisions.

```javascript
const { MAJOR, MINOR, PATCH } = SemVer
const {real: lReal, value: lValue, name: lName, type: lType} = this
const {real: rReal, value: rValue, name: rName, type: rType} = toObj
```

## Static Getter Constants

One-liner format when the body is a single return.

```javascript
static get FULL() { return '*' }
static get MAJOR() { return 'major' }
static get MINOR() { return 'minor' }
```

## Short vs Expanded Getters

Short getters with trivial bodies can be one-liners. Anything beyond a simple return gets expanded.

```javascript
// one-liner
get hasObject() { return isObject(this._object) }

// expanded
get settled() {
  return this.#settled
}

get start() {
  return typeof this.#start === 'function' ? this.#start() : this.#start
}
```

## Switch Statements

Compact case/return on the same line when cases are uniform and short. Use `break` or `return` — never fall through silently.

```javascript
switch (part) {
  case MAJOR: this[part] = parseInt(semverString); return
  case MINOR: this[part] = parseInt(semverString); return
  case PATCH: this[part] = parseInt(semverString); return
  case PRERELEASE: this[part] = semverString; return
  case METADATA: this[part] = semverString; return
  default:
    break
}
```

For switches with longer case bodies, expand normally:

```javascript
switch (hint) {
  case 'number':
    return parseFloat(`${this.major}.${this.minor}`)
  case 'string':
    return this.get()
  default:
    return null
}
```

## `typeof` With Parentheses

`typeof` is sometimes written with parentheses as though it were a function call. Both forms appear, but the parenthesized form is the more natural one in this codebase.

```javascript
typeof(options) === 'object'
typeof(config?.executor) === 'function'
```

## Boolean Coercion and Bitwise Idioms

`!!` for explicit boolean coercion. `!!~` with `indexOf` for existence checks. These are deliberate, not accidental.

```javascript
return !!this.find((entry) => entry === value)
return this.some((element) => !!~values.indexOf(element))
```

## Comparison Operators

Prefer strict equality (`===`). Loose equality (`==`) is acceptable when explicitly intended — it appears in methods like `oneIs` where the caller opts in via a parameter.

```javascript
// default: strict
const _skip = this.value === Symbol.for('Enum.NonAssociatedValue')

// intentional loose equality controlled by parameter
doubleEqualsOkay ? element == value : element === value
```

## Optional Chaining and Nullish Coalescing

Use freely. These are idiomatic throughout the codebase.

```javascript
this.inclusive = start?.inclusive ?? true
configurable: baseDescriptor?.configurable ?? true
const lineIndent = /^(\s+)/.exec(line)?.[1]?.length ?? 0
```

## Imports

External dependencies first, then internal modules, separated by a blank line. Named imports with destructuring.

```javascript
import { Extension, Patch } from '@nejs/extension'

import { Deferred } from './async/deferred.js'
import { Callable } from './core/callable.js'
import { Range } from './core/range.js'
```

## Blank Lines

Use blank lines to separate logical sections within a function. One blank line between conceptual steps. Do not over-space — no double blank lines, no blank lines after opening braces or before closing braces.

```javascript
constructor(options) {
  const config = (options && typeof(options) === 'object'
    ? options
    : {}
  )

  if (config?.resolve && config?.reject) {
    throw new TypeError(
      'resolve and reject options cannot be simultaneously provided'
    )
  }

  let _resolve, _reject

  super((resolve, reject) => {
    _resolve = resolve
    _reject = reject
  })
```

## Class Structure

Order within a class body:

1. `#` private fields (with defaults)
2. Public instance fields (with defaults)
3. `constructor`
4. Instance getters/setters
5. Instance methods
6. `Symbol`-keyed methods and getters (`Symbol.toPrimitive`, `Symbol.iterator`, `Symbol.toStringTag`, `Symbol.species`)
7. Static getters (constants)
8. Static methods

```javascript
export class Deferred extends Promise {
  #promise = null
  #reject = null
  #resolve = null

  value = null
  reason = null

  #settled = false

  constructor(options) { ... }

  get settled() { ... }
  get promise() { ... }

  resolve(value) { ... }
  reject(reason) { ... }

  static get [Symbol.species]() { ... }
}
```

## Symbols

Use `Symbol.for()` for shared/interoperable keys. Define symbol accessors as static getters with the `k` prefix convention.

```javascript
static get kHandler() {
  return Symbol.for('callable.handler')
}

static get kFunction() {
  return Symbol.for('callable.function')
}
```

## String Concatenation

Template literals for interpolation. The `+` operator is acceptable for simple one-off concatenation (e.g., `key + '.associated'`).

## Trailing Commas

Not enforced in either direction. Do not add them retroactively to existing code, do not remove them from existing code. When writing new multi-line object/array literals, trailing commas are acceptable.

## Error Handling

Throw specific error types (`TypeError`, `Error`) with descriptive string messages. For invalid input in utility/library code, prefer branching and returning a safe default over throwing.

```javascript
// throw for contract violations
throw new TypeError(
  'resolve and reject options cannot be simultaneously provided'
)

// branch for soft failures
if (!this.isObject(obj)) {
  console.warn('Object.add() must receive an object for `toObject`')
  return obj
}
```
