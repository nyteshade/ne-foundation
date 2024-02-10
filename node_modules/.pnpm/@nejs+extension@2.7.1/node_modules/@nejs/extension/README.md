# @nejs/extension

## Overview

The Nyteshade Enterprises JavaScript library `extension` provides two primary classes for extending the usefulness of code that you do not wish to hack into the global namespace. There are two general approaches using this library

### **Extension**

The `Extension` class allows you to replace an entire property on some parent or owning object. By default this is `globalThis` which is equivalent to `global` in nodejs and `window` in a browser.

This allows you to introduce entirely new objects or replace single properties on an existing Object. So, as an example, if you wanted to introduce a new global `Descriptor` object you might approach that in the following manner.

```js
const DescriptorExtension = new Extension(class Descriptor {
  constructor(configurable = true, enumerable = true) {
    Object.assign(this, { configurable, enumerable })
  }

  makeAccessor(getter, setter) {
    delete this.writable
    delete this.value
    Object.assign(this, { get: getter, set: setter })
    return this
  }

  makeData(value, writable = true) {
    delete this.get
    delete this.set
    Object.assign(this, { value, writable })
    return this
  }
})

console.log(Descriptor) // undefined
DescriptorExtension.apply()
console.log(Descriptor) // [class Descriptor]
DescriptorExtension.revert()
console.log(Descriptor) // undefined
```

### **Patch**

The `Patch` class, another core component of the `@nejs/extension` library, provides a versatile way to apply and revert modifications to properties or methods of an existing object. This is especially useful when you need to temporarily change the behavior of an object without permanently affecting its original state. Below are some examples demonstrating how to use the `Patch` class.

#### Basic Usage of `Patch`

In this example, we'll demonstrate how to patch an existing object's method:

```js
import { Patch } from '@nejs/extension';

const myObject = {
  greet: () => "Hello, World!"
};

// Display original behavior
console.log(myObject.greet()); // "Hello, World!"

// Create a patch
const greetingPatch = new Patch(myObject, {
  greet: () => "Hello, Universe!"
});

// Apply the patch
greetingPatch.apply();
console.log(myObject.greet()); // "Hello, Universe!"

// Revert to original
greetingPatch.revert();
console.log(myObject.greet()); // "Hello, World!"
```

### Patching with Conflict Resolution

The Patch class can handle conflicts gracefully when the property to be patched already exists on the target object. Here's an example:

```js
const myCalculator = {
  add: (a, b) => a + b
};

// Original functionality
console.log(myCalculator.add(2, 3)); // 5

// Patch to change the behavior
const calculatorPatch = new Patch(myCalculator, {
  add: (a, b) => a * b // Changing addition to multiplication
});

calculatorPatch.apply();
console.log(myCalculator.add(2, 3)); // 6

// Revert the patch
calculatorPatch.revert();
console.log(myCalculator.add(2, 3)); // 5
```

## Installation
To use @nejs/extension in your project, you can install it via npm:

```bash
npm install @nejs/extension
```

## Contributing

Contributions to @nejs/extension are welcome! Please ensure that your contributions adhere to the following guidelines:

* Write clear, readable, and maintainable code.
* Ensure backward compatibility or provide a clear migration path.
* Add unit tests for new features or bug fixes.
* Update documentation to reflect changes in the codebase.

For more details, see the `CONTRIBUTING.md` file in the repository.

## License

`@nejs/extension` is licensed under the MIT License.

