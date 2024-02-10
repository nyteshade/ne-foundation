/**
 * Represents the context for SQL argument parsing within the SGQLArgParser.
 * This class encapsulates the settings and state required for parsing SQL
 * arguments, such as the database dialect, and any additional metadata 
 * needed during parsing.
 */
export class SGQLArgParserContext {
  /**
   * Constructs an SGQLArgParserContext with the specified database dialect, 
   * and metadata. This context is used throughout the SGQLArgParser to 
   * maintain consistent argument parsing behavior.
   *
   * @param {DatabaseDialect} dialect - The database dialect to be used for 
   * parsing arguments.
   * @param {Object} metadata - Additional metadata that may be required for 
   * argument parsing.
   */
  constructor(dialect, metadata, extra = {}) {
    Object.assign(this, { dialect, metadata }, extra);

    this.#has = new Proxy(this, {
      get(target, property, receiver) {
        return typeof target[property] !== 'undefined';
      }
    });
  }

  /**
   * Provides a proxy to check the existence of properties on the 
   * SGQLArgParserContext instance. This getter returns a Proxy object that 
   * allows you to determine if a property is defined on the context by 
   * using the 'in' operator or by simply referencing the property. It is 
   * useful for checking if certain configuration options are set without 
   * accessing the values directly.
   *
   * @example
   * // Given an SGQLArgParserContext instance 'context':
   * if (context.has.dialect) {
   *   // Do something if 'dialect' property exists
   * }
   *
   * @returns {Proxy} A Proxy object that intercepts property access to 
   * determine if a property is defined on the SGQLArgParserContext 
   * instance.
   */
  get has() {
    return this.#has;
  }

  /**
   * A getter property that provides a constant array representing an empty
   * state. This array contains two `undefined` values, which can be used
   * to signify the absence of meaningful data in contexts where a tuple is
   * expected. This property is particularly useful when a function expects
   * a return value consisting of two elements, but there is no data to
   * return, allowing the function to proceed without error.
   *
   * @example
   * // When a handler function requires a tuple return value:
   * if (conditionNotMet) {
   *   return context.EMPTY; // Returns [undefined, undefined]
   * }
   *
   * @returns {[undefined, undefined]} An array with two `undefined` values.
   */
  get EMPTY() {
    return [undefined, undefined];
  }

  /**
   * A private field that holds a Proxy object used to determine the existence
   * of properties on the SGQLArgParserContext instance. This proxy is utilized
   * by the `has` getter to provide a convenient way of checking if certain
   * properties are defined without directly accessing their values. It is
   * particularly useful for checking configuration options during the argument
   * parsing process.
   *
   * @private
   */
  #has;
}
