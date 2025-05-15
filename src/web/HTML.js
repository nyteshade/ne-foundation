
export const kHTMLEvent = Symbol.for('HTML.Event');
export const kHTMLEventPrototypeProxy = Symbol.for('HTML.Event.PrototypeProxy');
export const kHTMLEventContext = Symbol.for('HTML.Event.Context');

// should use Zod for ensuring datatypes, for now this is pretty raw
const isInstOf = (obj, type) => (
  type === Array && Array.isArray(obj) || obj instanceof type
);

const kUndefined = 'undefined';
const kObject = 'object';
const kBoolean = 'boolean';
const kNumber = 'number';
const kBigInt = 'bigint';
const kString = 'string';
const kSymbol = 'symbol';
const kFunction = 'function';

const isTypeOf = (obj, type, doubleOkay = false, isNonNullish = true) => (
  ((isNonNullish && (obj !== null && obj !== undefined)) || !isNonNullish) &&
  (doubleOkay ? (typeof obj == type) : (typeof obj === type))
);

const isObj = (val) => isTypeOf(val, kObject);
const isStr = (val) => isTypeOf(val, kString) || isInstOf(val, String);
const isSym = (val) => isTypeOf(val, kSymbol);
const isNum = (val) => isTypeOf(val, kNumber);
const isBigInt = (val) => isTypeOf(val, kBigInt);
const isFun = (val) => isTypeOf(val, kFunction);
const isBool = (val) => (
  isTypeOf(val, kBoolean) || (isNum(val) && (val === 0 || val === 1))
)
const isKey = (val) => (
  isOneTypeOf(val, kString, kSymbol) ||
  isOneInstOf(val, String, Number)
);

const isOneInstOf = (val, ...types) => (
  types.some(type => isInstOf(val, type))
)

const isOneTypeOf = (val, ...types) => (
  types.some(type => isTypeOf(val, type))
);

const hasIsProp = (val, prop, value) => (
  isObj(val) && Reflect.has(val, prop) && val[prop] === (
    isInstOf(value, Function) ? value(val, prop, value) : value
  )
)

const isHTMLEventContext = (obj) => (
  obj && isObj(obj) && obj?.['class'] === 'HTMLEventContext'
);

const isHTMLEventContextParams = (obj) => (
  (isInstOf(obj, Array) && obj.length >= 3) &&
  isOneInstOf(obj[0], Element, HTMLElement) &&
  isKey(obj[1]) &&
  isTypeOf(obj[2], kFunction) &&
  (obj.length === 3 || isOneTypeOf(obj[3], kBoolean, kObject))
)

const isHTMLEventContextConfig = (obj) => (
  isObj(obj) &&
  hasIsProp(obj, 'onElement', (val) => isOneInstOf(val, Element, HTMLElement)) &&
  hasIsProp(obj, 'type', isKey) &&
  hasIsProp(obj, 'listener', isFun) && (
    !obj.options ||
    hasIsProp(obj, 'options', (val) => isOneTypeOf(val, kBoolean, kObject))
  )
)

export const HTML = new Proxy(
  class HTML {
    static create(
      name,
      content,
      style = {},
      attributes = {},
      webComponentName,
      useDocument = document,
      children = []
    ) {
      const params = [
        'name', 'style', 'attributes', 'webComponentName', 'content',
        'useDocument', 'children',
      ];

      let _opts = (
        // Check to see if we have individual parameters or a config object
        // they would be in content and content must be a non null object type
        // it must also contain any of the parameters by name.
        (typeof content === 'object' && content !== null) &&
        params.some(param => Reflect.has(content, param))

        // we have a config object; what was passed to the content parameter is it
        ? content

        // we have individual parameters, make a config object from them
        : {
          style, attributes, content, webComponentName, useDocument, children
        }
      );

      // Validate each parameter is in a usable state for going forward with
      // defaults for unsupplied values
      _opts = {
        style: _opts.style ?? {},
        attributes: _opts.attributes ?? {},
        content: _opts.content,
        webComponentName: _opts.webComponentName,
        useDocument: _opts.useDocument ?? document,
        children: _opts.children ?? []
      };

      const doc = _opts.useDocument;
      const options = _opts.webComponentName
        ? { is: _opts.webComponentName }
        : undefined;
      const element = doc.createElement(name, options);

      HTML[kHTMLEventPrototypeProxy](element);

      for (const [key, value] of Object.entries(_opts.attributes)) {
        element.setAttribute(key, value);
      }

      for (const [key, value] of Object.entries(_opts.style)) {
        element.style[key] = value;
      }

      // avoid this for non-text values
      if (typeof _opts.content === 'string') {
        element.innerHTML = _opts.content;
      }

      for (const child of _opts.children) {
        element.append(child);
      }

      return element;
    }

    static [kHTMLEventContext] = class HTMLEventContext {
      element;
      type;
      listener;
      useCapture;
      options;

      constructor(onElement, type, listener, options) {
        const useCapture = typeof options !== 'object' && !!options;
        const opts = typeof options === 'object' && options;

        Object.assign(this, {
          element: onElement,
          type,
          listener,
          useCapture,
          options: opts
        });
      }

      remove(options) {
        // Note: Type checking already applied to created of HTMLEventContext, and
        // the DOM supports more than TypeScript is happy with. Set to any for now.
        this.element.removeEventListener(
          this.type,
          this.listener,
          options
        );
      }

      apply() {
        // Note: Type checking already applied to created of HTMLEventContext, and
        // the DOM supports more than TypeScript is happy with. Set to any for now.
        this.element.addEventListener(
          this.type,
          this.listener,
          this.useCapture ?? this.options
        );
      }

      fire(type, detail) {
        return this.element.dispatchEvent(new CustomEvent(type, detail));
      }

      get [Symbol.toStringTag]() { return this.constructor[`class`] }
      get ['class']() { return this.constructor['class'] }

      static get ['class']() { return 'HTMLEventContext' }
    }

    static [kHTMLEventPrototypeProxy](element) {
      const HTMLEventContext = HTML[kHTMLEventContext];

      const prototype = element?.constructor?.prototype ?? Element.prototype;
      const definedEvents = {};

      const eventProxy = new Proxy(definedEvents, {
        get(target, property, receiver) {
          if (Reflect.has(definedEvents, property)) {
            const context = definedEvents[property];
            return context.listener;
          }
          return Reflect.get(target, property, receiver);
        },

        deleteProperty(target, property) {
          if (!Reflect.has(definedEvents, property)) {
            return false;
          }
          else if (Reflect.has(definedEvents, property)) {
            definedEvents[property].remove();
            return delete definedEvents[property];
          }

          return Reflect.deleteProperty(target, property);
        },

        set(target, property, newValue, _) {
          let context = undefined;

          if (isHTMLEventContext(newValue)) {
            definedEvents[property] = newValue;
            context = newValue;
          }
          else if (newValue instanceof Function) { // HTMLEventListener
            context = new HTMLEventContext(element, property, newValue);
          }
          else if (isHTMLEventContextParams(newValue)) {
            const [element, type, listener, options] = newValue;
            context = new HTMLEventContext(element, type, listener, options);
          }
          else if (isHTMLEventContextConfig(newValue)) {
            const {onElement, type, listener, options} = newValue;
            context = new HTMLEventContext(element, type, listener, options);
          }

          if (context) {
            definedEvents[property] = context;
            context.apply();
            return true;
          }

          return false;
        },
      });

      const prototypeProxy = new Proxy(prototype, {
        get(target, prototype, receiver) {
          if (prototype === 'event') {
            return eventProxy;
          }
          return Reflect.get(target, prototype, receiver);
        }
      });

      Object.defineProperty(element, 'originalPrototype', {
        value: prototype,
        enumerable: false,
        configurable: true,
        writable: true
      });

      Object.setPrototypeOf(element, prototypeProxy);

      return element;
    }
  },
  {
    get(target, property, receiver) {
      if (typeof property === 'string' && property !== 'create') {
        return HTML.create.bind(HTML, property);
      }

      return Reflect.get(target, property, receiver);
    }
  }
);
