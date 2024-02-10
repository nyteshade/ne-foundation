import { Patch } from '@nejs/extension';

const { parseEntity } = Patch.lazy; 

/**
 * Represents the configuration for the SGQLArgParser, encapsulating the
 * handlers for parsing arguments. Each handler is responsible for processing
 * a specific argument and can be a function or an object with properties
 * defining its behavior. This class provides a structured way to declare
 * how each argument should be parsed and handled, ensuring consistency and
 * reusability across different parts of the application.
 */
export class SGQLArgParserConfig {  
  /**
   * Constructs a new SGQLArgParserConfig with handlers based on the provided
   * arguments. Each handler is responsible for processing a specific argument
   * and can be a function or an object with properties defining its behavior.
   * 
   * The constructor iterates over the provided arguments, setting up handlers
   * for each. If a value is a function, it is assumed to be a handler function
   * directly. If the value is an object, it is expected to contain properties
   * for 'sqlNullable', 'gqlNullable', and 'handler', with defaults provided
   * where necessary. If the 'handler' property is not a function, a TypeError
   * is thrown.
   * 
   * @param {Object} resolverArgs - An object provided from a GraphQL resolver
   * function denoting any variables supplied to the resolver.
   * @param {Object} config - An object where each key corresponds to an 
   * argument name, and each value is either a function or an object 
   * describing the handler for that argument.
   * @throws {TypeError} If any handler specified in the args object is 
   * not a function.
   */
  constructor(resolverArgs, config) {
    Object.entries(config?.args).forEach(([argName, argConfig]) => {
      if (typeof argConfig === 'function') {
        this.handlers[argName] = {
          get argName() { return argName },
          get value() { return resolverArgs[argName] },
          get entity() { return parseEntity('') },
          get sqlNullable() { return true },
          get gqlNullable() { return true },
          get handler() { return argConfig },
        };
      }
      else if (argConfig && typeof argConfig === 'object') {
        this.handlers[argName] = {
          get argName() { return argName },
          get value() { return resolverArgs[argName] },
          get entity() { return parseEntity(argConfig?.entity ?? '') },
          get sqlNullable() { return argConfig?.sqlNullable ?? true },
          get gqlNullable() { return argConfig?.gqlNullable ?? true },
          get handler() { return argConfig?.handler ?? argConfig?.[argName] }
        };

        // if (typeof this.handlers[argName].handler !== 'function') {
        //   throw new TypeError(trimLeading()`
        //     A handler for the SGQLArgParserConfig must be a function
        //     that returns a promise (async). In TypeScript that handler
        //     would have the following signature:
            
        //       (
        //         key: string|symbol, 
        //         value: any, 
        //         context: SGQLArgParserContext
        //       ) => Promise<[string, any]>

        //     We received:
        //     ${require('util').inspect(this.handlers[argName], {color:true})}

        //     Where the key is the name of the argument (symbol or string)
        //     and the value is the value received for that argument. The
        //     context object provides access to some things you might need
        //     in that space such as whether or not to include a comma or
        //     access to the database dialect or metadata.

        //     The return value is a Promise of an array with the string,
        //     or first value being the portion of the WHERE clause for this
        //     argument, and the any being the variable to compare to.
        //   `)
        // }
      }
    });
  }

  /**
   * Retrieves the handler function associated with the specified argument key.
   * 
   * This method is a convenient way to access the handler functions that are
   * responsible for processing argument values. Each argument key has a
   * corresponding handler function defined in the handlers object.
   * 
   * The async handler has the following signature:
   * 
   * ```
   * handler: (
   *   key: string|symbol, 
   *   value: any, 
   *   context: SGQLArgParserContext
   * ) => Promise<[string, any]>
   *  ```
   * 
   * Where `key` is the argument to be handled, `value` is the value supplied
   * for the argument and `context` is a reference to an instance of the class
   * {@link SGQLArgParserContext}.
   * 
   * @param {string} key The key identifying the argument.
   * @returns {Function} The handler function for the argument.
   */
  getHandler(key) {
    return this.handlers[key].handler;
  }

  /**
   * Retrieves the entity associated with the specified argument key.
   * 
   * This method is used to obtain the entity information for a given argument
   * key. The entity information is part of the handler's configuration and
   * is used to determine the structure or type of data that the argument
   * represents. This can be particularly useful when constructing queries
   * or when performing validation checks.
   * 
   * @param {string} key - The key identifying the argument.
   * @returns {any} The entity information for the argument.
   */
  getEntity(key) {
    return this.handlers[key].entity;
  }

  /**
   * Checks if a GraphQL argument can be null.
   * 
   * This method returns the nullability of a GraphQL argument based on its
   * handler configuration. It's useful for schema validation and to avoid
   * unnecessary checks on arguments that can be null.
   *
   * @param {string} key - The argument's identifier.
   * @returns {boolean} - True if nullable, false otherwise.
   */
  isGQLNullable(key) {
    return this.handlers[key].gqlNullable;
  }

  /**
   * Determines if the SQL argument associated with the given key is nullable.
   * This method checks the 'sqlNullable' property of the handler associated
   * with the provided key. It is used to understand if the SQL column related
   * to the argument can accept null values.
   *
   * @param {string} key - The name of the argument to check for SQL nullability.
   * @returns {boolean} - True if the SQL argument is nullable, false otherwise.
   */
  isSQLNullable(key) {
    return this.handlers[key].sqlNullable;
  }

  /**
   * Creates an iterator that yields key-value pairs of argument handlers.
   *
   * This generator function allows for iteration over the `handlers` object
   * entries, providing a convenient way to traverse all registered argument
   * handlers. Each iteration yields an array where the first element is the
   * argument key and the second element is the handler configuration object.
   *
   * @example
   * // Iterate over all handlers
   * for (let [key, handler] of argParserConfig) {
   *   console.log(`Argument: ${key}, Handler:`, handler);
   * }
   *
   * @yields {Array} An array containing the key and handler configuration
   * object for each registered argument handler.
   */
  *[Symbol.iterator]() {
    for (let entry of Object.entries(this.handlers)) {
      yield entry;
    }
  }

  /**
   * A collection of handler functions for SGQL argument parsing. Each key in
   * this object corresponds to an argument name, and the associated value is
   * an object containing properties for sqlNullable, gqlNullable, and the
   * handler function itself. This enables dynamic parsing and handling of
   * arguments based on the provided configuration.
   */
  handlers = {};
}