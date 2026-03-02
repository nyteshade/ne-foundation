# Documentation & Style Guidelines

How documentation is written across `@nejs` projects. These aren't aspirational rules — they're patterns extracted from existing code. Follow them so that a reader who's seen three docs can predict the structure of the fourth.

## Philosophy

Code alone never captures intent and circumstance. Documentation exists to explain *why* something exists in the world, what design pressures shaped it, and what the reader should expect when they use it. The JSDoc is the primary type system — not TypeScript, not Flow — and it serves double duty: human-readable narrative *and* IDE-consumable type information (WebStorm, VS Code, etc.).

TypeScript is avoided unless externally required. JSDoc `@param`, `@returns`, `@typedef`, and `@type` annotations carry the type information. This keeps the source as plain JavaScript while giving IDEs everything they need for autocomplete, hover docs, and type checking.

## JSDoc Structure

A complete doc block follows this order. Not every section appears on every method — scale detail to complexity.

1. **Opening narrative** — What it does and *why it exists*. For classes, include historical context or lineage where relevant. For methods, lead with the practical purpose.
2. **`@typedef` / `@callback`** — For complex option objects or function signatures, define them inline or reference a shared typedef. Use TypeScript-style interface notation inside fenced code blocks when the shape is complex.
3. **`@param`** — Every parameter documented. Include union types with `|`, defaults with `[param=default]`, conditional requirements ("Required if `start` is a number"), and constraints ("Must be non-zero").
4. **`@returns`** — What comes back and under what conditions.
5. **`@throws`** — When and why.
6. **`@example`** — Concrete, runnable scenarios (see Examples section below).

### Simple methods get simple docs

```javascript
/**
 * The `isString` method does exactly what one would expect. It returns
 * true if the string matches typeof or instanceof as a string.
 *
 * @param {*} value checks to see if the `value` is a string
 * @returns {boolean} `true` if it is a `String`, `false` otherwise
 */
```

Three lines of description, one param, one return. Done.

### Complex methods get structured docs

For methods with multiple modes, option objects, or non-obvious behavior, use visual structure — tables, fenced code blocks for option lists, multiple examples showing different usage patterns:

```javascript
/**
 * Applies Select Graphic Rendition (SGR) parameters to a given message
 * for styling in terminal environments. This function allows for the
 * dynamic styling of text output using ANSI escape codes.
 *
 * Colors:
 * ```
 * 'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'
 * ```
 * Color Specifiers:
 * ```
 * 'fg' -> foreground  |  'bg' -> background  |  'bright' -> bright colors
 * ```
 *
 * Modes:
 * ```
 * 'blink' or 'k' | 'conceal' or 'c' | 'italics' or 'i'  | 'strike' or 's'
 * 'bold' or 'b'  | 'dim' or 'd'     | 'negative' or 'n' | 'underline' or 'u'
 * ```
 *
 * @param {string} message The message to be styled.
 * @param {...string} useModes Styling modes — colors, specifiers, and
 * decorations. Can be combined in a single comma-separated string or
 * passed as separate arguments.
 * @returns {string} The styled string wrapped in ANSI escape codes.
 *
 * @example
 * sgr('Hello', 'red')
 * sgr('World', 'green,bold')
 * sgr('Example', 'bluebgbright')
 *
 * // Shorthand syntax
 * sgr('hello', 'biu')       // bold, italics, underline
 * sgr('hello', 'bi,redfg')  // bold, italics, red foreground
 */
```

## Examples

Examples are stories, not syntax diagrams. Show a scenario the reader can inhabit.

### Do this

```javascript
/**
 * @example
 * // assume this pure function exists someplace
 * const lastThenFirstThenMiddle = function() {
 *   let middle = ''
 *
 *   if (this.middleName)
 *     middle = ` ${this.middleName}`
 *
 *   return `${this.lastName}, ${this.firstName}${middle}`
 * }
 *
 * let people = []
 * for await (const model of await getSomePeople()) {
 *   let parseName = new Callable(model, lastThenFirstThenMiddle)
 *   people.push(parseName())
 * }
 *
 * console.log(people)
 * // Might look like ['Doe, Jane', 'Smith, Sally Joanne']
 */
```

This shows: the setup, the loop, the integration with async code, and what the output "might look like." The reader understands the *use case*, not just the constructor signature.

### Teach through contrast

When a method's behavior has meaningful boundaries, show both sides:

```javascript
/**
 * @example
 * // Note the differences between these
 * const object = { get name() { return "Brie"; } };
 * const descriptor = Object.getOwnPropertyDescriptor(object, 'name');
 * is.callable(object);     // false
 * is.callable(descriptor); // true
 */
```

## Types in JSDoc

JSDoc is the type system. Write types for the IDE, narrative for the human.

### Primitives and unions

```javascript
@param {string|number} value
@param {boolean} [inclusive=true]
@param {*} value
```

### Complex option objects

Use TypeScript-style interface notation inside the doc block when the shape warrants it:

```javascript
/**
 * The constructor takes an object called `options`. It can have the
 * following properties:
 *
 * ```
 * interface BaseDeferredOptions {
 *   // Deferreds store the value or reason. To turn this off, pass true
 *   doNotTrackAnswers?: boolean;
 * }
 *
 * interface DeferredResolveOptions extends BaseDeferredOptions {
 *   resolve: any;     // Auto-resolve with this value
 *   reject?: never;
 * }
 * ```
 *
 * @param {BaseDeferredOptions|DeferredResolveOptions} options
 */
```

This gives the reader a typed shape to reference while keeping the source as plain JavaScript.

### Callback signatures

```javascript
@param {function(number, number): boolean} compareFn
@callback StepFunction
@returns {number}
```

## Inline Comments

### Explain decisions, not mechanics

```javascript
// If the target function is a big arrow function, convert it to
// a bindable function. Note that big arrow functions will receive
// the handler as its first parameter; so account for that.
```

This explains the *why* (arrow functions can't be bound) and the *consequence* (handler becomes first param). The code shows the *how*.

### Be honest about shortcuts

```javascript
// being lazy here, someone has defined we make an accessor but
// wants the default accessor behaviors with an associated store
// made by us.
```

### Leave breadcrumbs for future you

```javascript
// NOTE to self; this is repeated here otherwise a circular reference from
// Object<->Function<->Global occurs. See original source in global.this.js
// {@see globalThis.isThenElse}
```

## Voice

The documentation voice is **knowledgeable but approachable**. It's a teacher explaining to a smart student, not a reference manual reciting signatures.

**Signature phrases** (use naturally, not mechanically):
- "This is useful for scenarios where..."
- "This allows..."
- "Returns `true` if... `false` otherwise"
- "If... is provided..."
- "Optionally..."

**Formatting conventions:**
- Backticks around all code references in prose: `undefined`, `handler`, `Array.prototype`
- `{@link ClassName}` for cross-references to other documented types
- Periods at end of `@param` and `@returns` descriptions
- Fenced code blocks inside JSDoc for visual structure (option tables, mode lists)

## What Not to Document

- Don't over-document the obvious. If the method is `isString` and it checks if something is a string, three lines suffice.
- Don't repeat the function signature in prose. The params are already listed — the narrative should explain *intent*, not restate types.
- Don't write generic advice ("always validate inputs"). Document what *this specific code* does and why.
