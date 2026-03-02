# Coding Philosophy & Architectural Preferences

Observations drawn from the `@nejs/foundation` and `@nejs/basic-extensions` codebases.

## Core Beliefs

**JavaScript maximalism.** The language's built-in types are *incomplete*, not broken. Rather than avoiding prototype modification, the approach is to build a reversible patch infrastructure (`@nejs/extension`) to do it correctly. The `Controls` system with enable/disable is a disciplined concession to orthodoxy — `arr.first` should just *work*.

**Protocol-oriented thinking.** Heavy use of `Symbol.iterator`, `Symbol.species`, `Symbol.toPrimitive`, `Symbol.toStringTag`, and custom symbols throughout. Objects are participants in protocols. The `Callable` class is the clearest expression: a single entity that *is* both function and object, participating in both protocols simultaneously through comprehensive Proxy traps.

**Expressiveness as a core value.** The `if*` conditional pattern on every type checker, the `is`/`has`/`as`/`si` global toolkit, the Deferred exposing resolve/reject — these convert imperative control flow into expressions. `si.array(val, transform, fallback)` over an if/else block. Functional programming flavor without dogma.

**Descriptor-level awareness.** Properties are not key/value pairs — they are full descriptors with enumeration, configurability, and accessor semantics. Visibility handlers (`kMutablyHidden`, `kImmutablyVisible`), `Object.add()` with storage-backed accessors, and the `Descriptor` class form an entire vocabulary around `Object.defineProperty`.

## Architecture Preferences

**Bottom-up, layered abstraction.** `@nejs/extension` (patch mechanism) → `@nejs/basic-extensions` (enriched primitives) → `@nejs/foundation` (higher-level patterns). Each layer assumes the one below. The goal is not an application framework — it is building the *language you wish you had*, then writing applications in that language.

**Enrich the base rather than wrap it.** Prefer extending built-in types with missing capabilities over creating parallel utility namespaces. Rich methods on every type (`set.map()`, `set.reduce()`, `arr.first`, `arr.last`) in the Ruby/Smalltalk tradition of making built-ins joyful to use.

**Convention applied uniformly.** Every `isX` gets a corresponding `ifX`. Every type gets the same treatment. Patterns are systematic, not ad-hoc.

## Implementation Conventions

- `#` private fields over closures for encapsulation
- Custom symbols (prefixed `k`) for internal access keys (`kHandler`, `kFunction`, `kDescriptorStore`)
- Comprehensive JSDoc over TypeScript — types as documentation, not as a compilation step (tsc used as transpiler, not type checker)
- Well-known Symbols implemented wherever semantically appropriate (`Symbol.iterator`, `Symbol.species`, `Symbol.toPrimitive`, `Symbol.toStringTag`)
- Full Proxy trap coverage when proxying (not partial implementations)
- Method chaining where it fits naturally (e.g., SemVer increment/decrement)

## Influences

- **Ruby/Smalltalk** — open classes, rich standard library methods on built-in types, ergonomic APIs
- **jQuery** — deferred pattern, the philosophy that APIs should be ergonomic first
- **JavaScript metaprogramming** — Proxy, Reflect, Symbol, and property descriptors are foundational tools, not curiosities
