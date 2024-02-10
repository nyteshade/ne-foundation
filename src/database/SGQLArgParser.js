import { DatabaseDialect } from './DatabaseDialect';
import { SGQLArgParserConfig } from './SGQLArgParserConfig';
import { SGQLArgParserContext } from './SGQLArgParserContext';
import { Patch } from '@nejs/extension';

const { 
  trimLeading, 
  arrayFilters: { 
    nonNullishFilter,
    nullishFilter,
    truthyFilter,
  } 
} = globalThis;

export class SGQLArgParser {
  /**
   * Constructs an SGQLArgParser instance with the provided resolver arguments
   * and configuration. It initializes the parser's configuration and stores
   * the resolver arguments. If the configuration includes a specific database
   * dialect that is an instance of DatabaseDialect, it also sets up the
   * dialect and its associated metadata for use in parsing.
   *
   * @param {Object} resolverArgs - The arguments provided to a GraphQL 
   * resolver function, which will be used for parsing.
   * @param {Object} config - An object containing configuration options for 
   * the parser, including the database dialect.
   */
  constructor(resolverArgs, config) {
    this.config = new SGQLArgParserConfig(resolverArgs, config);
    this.args = resolverArgs;


    if (config.dialect && config.dialect instanceof DatabaseDialect) {
      this.#dialect = config.dialect;
      this.#metadata = this.#dialect.metadata;
    }

    if (Reflect.has(config, 'indent')) {
      this.#indent = Number(config.indent) || 0;
    }

    if (Reflect.has(config, 'subIndent')) {
      this.#subIndent = Number(config.subIndent) || 2;
    }
  }

  /**
   * Constructs a context for SQL argument parsing with optional dialect and
   * metadata overrides. It retrieves the entity information for the specified
   * argument and checks if the complete entity structure is present in the
   * metadata. The context is used to provide necessary information for parsing
   * SQL arguments.
   *
   * @param {string} argName The name of the argument to construct the context
   * for.
   * @param {DatabaseDialect} [useDialect] An optional dialect to override the
   * default.
   * @param {Object} [useMetadata] Optional metadata to override the default or
   * the dialect's metadata.
   * @returns {SGQLArgParserContext} An instance of SGQLArgParserContext with
   * the dialect, metadata, and potentially the column data if the entity is
   * fully specified in the metadata.
   */
  constructContext(argName, useDialect, useMetadata) {
    const dialect = useDialect ?? this.#dialect;
    const metadata = useMetadata ?? dialect?.metadata ?? this.#metadata;
    const e = this.config.getEntity(argName);
    const hasAllParts = !!(e.complete && metadata?.all);

    return new SGQLArgParserContext(dialect, metadata, {
      columnData: (hasAllParts && 
        metadata.all[e.database][e.schema][e.table][e.column]
      )
    });
  }


  /**
   * Asynchronously parses the arguments provided to the SGQLArgParser instance,
   * constructing a WHERE clause and collecting variables for SQL query
   * execution. This method iterates over each argument configuration, applying
   * the corresponding handler to generate clause parts and variables. It
   * filters out nullish values and constructs the final WHERE clause with
   * appropriate indentation and sub-indentation based on the parser's
   * configuration. The method ensures that the WHERE clause and variables are
   * correctly formatted and ready for use in SQL queries.
   *
   * @param {...string} existingClauseParts - Initial parts of the WHERE clause
   * that may have been defined outside of the argument parsing context.
   * @returns {Promise<[string, Array]>} A promise that resolves to a tuple
   * containing the constructed WHERE clause and an array of variables for
   * the SQL query. The WHERE clause is a string, and the variables are an
   * array of values corresponding to the placeholders in the WHERE clause.
   */
  async parse(...existingClauseParts) {
    let clauseParts = [...existingClauseParts];
    let variables = [];
    let indent = this.#indent > 0 ? ' '.repeat(this.#indent) : '';
    let subIndent = this.#subIndent > 0 ? ' '.repeat(this.#subIndent) : '';

    for (const [argName, argConfig] of [...this.config]) {
      if (nullishFilter(this.args?.[argName])) {
        continue;
      }

      const argValue = this.args[argName];
      const context = this.constructContext(argName);

      const [clause, variable] = await argConfig.handler(
        argName,
        argValue,
        context
      );

      clauseParts.push(clause);
      variables.push(variable);
    }

    variables = variables.filter(nonNullishFilter);

    if (variables.filter(nonNullishFilter).length === 0) {
      this.#variables = undefined;
    }
    else {
      this.#variables = variables;
    }

    clauseParts = clauseParts.filter(truthyFilter);

    if (clauseParts.length === 0) {
      this.#whereClause = '';
    }
    else {
      let whereClause = SGQLArgParser.ensurePadding(
        this.#dialect?.constructor.WHERE_JOINER ?? `\nWHERE\n${subIndent}}`,
        indent || ' '
      );
      let parts = clauseParts.join(' AND ');

      this.#whereClause = `${whereClause}${parts}`;
    }

    return [this.#whereClause, this.#variables];
  }

  /**
   * Retrieves the variables that have been parsed and stored by the
   * SGQLArgParser. These variables are intended to be used as the values
   * for prepared statements in SQL queries, corresponding to the placeholders
   * in the WHERE clause generated by the parser. This getter provides a
   * convenient way to access the variables without exposing the internal
   * state of the SGQLArgParser instance.
   *
   * @returns {Array} An array of parsed variables ready for use in a
   * prepared statement, or undefined if no variables have been set.
   */
  get variables() { return this.#variables }
  
  /**
   * Retrieves the constructed WHERE clause of the SQL query. This clause is
   * composed based on the arguments provided to the SGQLArgParser instance
   * and the corresponding handlers for those arguments. The WHERE clause is
   * used to filter the results of the SQL query according to the specified
   * conditions. If no conditions are present or applicable, an empty string
   * is returned. This getter allows for easy access to the WHERE clause
   * without exposing the internal representation.
   *
   * @returns {string} The WHERE clause of the SQL query, or an empty string
   * if no conditions are specified.
   */
  get whereClause() { return this.#whereClause }

  /**
   * Retrieves the database dialect instance currently set for the 
   * SGQLArgParser. The dialect determines the specific SQL syntax and 
   * behavior tailored to a particular SQL database, such as MySQL, 
   * PostgreSQL, or SQLite. This is essential for constructing SQL queries 
   * that are compatible with the target database. The getter provides a 
   * convenient way to access the dialect instance without directly 
   * interacting with the underlying private property.
   *
   * @returns {Object} The dialect instance with SQL syntax and behavior 
   * methods.
   */
  get dialect() { return this.#dialect }
  
  /**
   * Sets the database dialect for the SGQLArgParser. The dialect determines
   * the specific SQL syntax and behavior tailored to a particular SQL
   * database, such as MySQL, PostgreSQL, or SQLite. This is crucial for
   * constructing context-aware SQL queries that are compatible with the
   * target database. The dialect should be an instance of a class that
   * provides the necessary SQL syntax and behavior for the SGQLArgParser.
   *
   * @param {Object} value - An instance of the dialect class specific to the 
   * target SQL database.
   */
  set dialect(value) { this.#dialect = value }

  /**
   * Retrieves the metadata for the database dialect being used by the
   * SGQLArgParser. This metadata includes essential details for constructing
   * context-aware SQL queries, such as table names, column names, and other
   * schema information. The metadata is utilized internally within the
   * SGQLArgParser class to aid in the creation of SQL queries and is not
   * intended to be accessed directly outside of the class.
   *
   * @returns {Object} An object containing the metadata properties relevant
   * to the database dialect.
   */
  get metadata() { return this.#metadata }
  
  /**
   * Sets the metadata for the database dialect being used by the SGQLArgParser.
   * This metadata is essential for constructing context-aware SQL queries and
   * should include details such as table names, column names, and other
   * database schema information. The metadata is used internally within the
   * SGQLArgParser class to facilitate the construction of SQL queries and
   * should be set to an object containing the relevant metadata properties.
   *
   * @param {Object} value - An object containing metadata properties relevant
   * to the database dialect.
   */
  set metadata(value) { this.#metadata = value }

  /**
   * Retrieves the variables extracted from the arguments passed to the
   * SGQLArgParser. These variables are intended to populate the placeholders
   * in the SQL query constructed by the parser. If no variables are present
   * after parsing, this property will be undefined. This getter is primarily
   * for internal use within the SGQLArgParser class and should not be
   * accessed directly outside of the class.
   *
   * @returns {Array|undefined} The variables for the SQL query or undefined
   * if no variables were extracted during parsing.
   */
  get variables() {
    return this.#variables;
  }

  /**
   * The database dialect instance that provides specific SQL syntax and 
   * behavior for the SGQLArgParser. This dialect object contains methods 
   * and properties that tailor the argument parsing process to a particular 
   * SQL database, such as MySQL, PostgreSQL, or SQLite. It is used 
   * internally to construct context-aware SQL queries and should not be 
   * accessed directly outside of the SGQLArgParser class.
   * 
   * @private
   * @type {DatabaseDialect}
   */
  #dialect;
  
  /**
   * Holds metadata information for the database dialect being used by the
   * SGQLArgParser. This metadata is essential for constructing context-aware
   * SQL queries and is derived from the dialect's properties. The metadata
   * includes details such as table names, column names, and other database
   * schema information. This property is intended for internal use within the
   * SGQLArgParser class and is not meant to be accessed directly outside of
   * the class.
   * 
   * @private
   * @type {Object}
   */
  #metadata;
  
  /**
   * Holds the SQL WHERE clause constructed by the SGQLArgParser after parsing
   * the provided arguments. This clause is used to filter results in the SQL
   * query. If no conditions are present after parsing, this property is set to
   * an empty string. This property is intended for internal use within the
   * SGQLArgParser class and is not meant to be accessed directly outside of
   * the class.
   * 
   * @private
   * @type {string}
   */
  #whereClause;

  /**
   * Holds the indentation level for the SQL query constructed by the 
   * SGQLArgParser. This property is used to format the SQL query with 
   * appropriate indentation for readability and debugging purposes. It is 
   * incremented or decremented as the parser constructs different parts of 
   * the SQL query, such as nested subqueries. This property is intended for 
   * internal use within the SGQLArgParser class and should not be accessed 
   * directly outside of the class.
   * 
   * @private
   * @type {number}
   */
  #indent = 0;

  /**
   * Holds the sub-indentation level for the SQL query constructed by the 
   * SGQLArgParser. This property is used to format the SQL query with 
   * appropriate sub-indentation for readability and debugging purposes. It is 
   * incremented or decremented as the parser constructs different parts of 
   * the SQL query, such as nested subqueries. This property is intended for 
   * internal use within the SGQLArgParser class and should not be accessed 
   * directly outside of the class.
   * 
   * @private
   * @type {number}
   */
  #subIndent = 2;

  /**
   * Holds the variables extracted from the arguments passed to the 
   * SGQLArgParser. These variables are used to populate the placeholders in 
   * the SQL query constructed by the parser. If no variables are present 
   * after parsing, this property is set to undefined. This property is 
   * intended for internal use within the SGQLArgParser class and is not 
   * meant to be accessed directly outside of the class.
   * 
   * @private
   * @type {Array|undefined}
   */
  #variables;

  /**
   * Ensures a string is padded with specified leading and trailing characters
   * if it doesn't already start or end with whitespace, respectively. This
   * method is useful for formatting strings that require specific leading or
   * trailing characters for proper syntax or readability in SQL queries or
   * other formatted text outputs.
   *
   * @param {string} string The input string to pad.
   * @param {string} [leading=' '] The character to prepend to the string if it
   * does not start with whitespace. Defaults to a single space.
   * @param {string} [trailing=' '] The character to append to the string if it
   * does not end with whitespace. Defaults to a single space.
   * @returns {string} The padded string, or the original string if no padding
   * is needed.
   */
  static ensurePadding(string, leading = ' ', trailing = ' ') {
    let paddedString = string;

    if (/^[^\s\n]/.exec(paddedString)) {
      paddedString = `${leading}${paddedString}`;
    } 

    if (/[^\s\n]$/.exec(paddedString)) {
      paddedString = `${paddedString}${trailing}`;
    }

    return paddedString;
  }

  /**
   * Provides a getter for accessing dynamically named SGQLArgParser functions
   * based on the registered dialects. Each function is named according to the
   * dialect's short name and is responsible for creating an instance of
   * SGQLArgParser configured with the corresponding dialect.
   *
   * This method is particularly useful in IDEs, as it allows developers to
   * access the correct argument parser for a given dialect without needing to
   * refer to the source code. The dynamically created functions are also
   * enumerable and configurable, making them flexible for runtime 
   * introspection.
   *
   * @returns {Object} An object containing dynamically named functions for 
   * each registered dialect. The functions are named in the format 
   * `<DialectShortName>SGQLArgParser` and return an instance of SGQLArgParser 
   * when invoked.
   */
  static get dialects() {
    const entries = [...this.#registeredDialects?.entries()];
    const obj = entries.reduce((acc, [dialectClass, dialect]) => {
      const fnName = `${dialectClass.shortName}SGQLArgParser`;
      Object.defineProperty(acc, fnName, {
        get() {
          // Using this object we can dynamically name the
          // function that returns the dynamically named 
          // function
          const dynamicallyNamed = {
            [fnName](resolverArgs, config) {
              const argParser = new SGQLArgParser(
                resolverArgs, 
                { ...(config ?? {}), dialect }
              );

              argParser[Symbol.toStringTag] = fnName;
              return argParser;
            }
          }

          return dynamicallyNamed[fnName];
        },
        configurable: true,
        enumerable: true,
      });
      
      return acc;
    }, {});

    return obj;
  }

  /**
   * Registers a new dialect for use with the SGQLArgParser. The dialect must
   * be an instance or a subclass of DatabaseDialect. If a subclass is provided,
   * an instance will be created with default values. This method updates the
   * internal registry of supported dialects, allowing the SGQLArgParser to
   * utilize the correct dialect for SQL argument parsing.
   *
   * @param {DatabaseDialect|Function} value - The dialect to register. This 
   * can be an instance of DatabaseDialect or a subclass of it.
   * @throws {TypeError} If the provided value is not an instance or subclass 
   * of DatabaseDialect.
   */
  static set dialects(value) {
    let instance = value;
  
    // Check if the value is a subclass of DatabaseDialect (i.e., a 
    // constructor function)
    if (
      typeof value === 'function' && 
      value.prototype instanceof DatabaseDialect
    ) {
      instance = new value();
    } 
    else if (!(value instanceof DatabaseDialect)) {
      // If it's not an instance or a subclass, throw an error
      throw new TypeError(trimLeading()`
        When setting a dialect to the SGQLArgParser, the value must be
        an actual class that extends from DatabaseDialect or an instance
        of such a class.
      `);
    }
  
    this.#registeredDialects.set(instance.constructor, instance);
  }

  /**
   * A private static map to hold registered dialects. Each dialect is an
   * instance or class extending from DatabaseDialect, and is used to parse
   * arguments specific to the SQL grammar of a database system. This map
   * ensures that each dialect can be retrieved and instantiated by the
   * SGQLArgParser when needed.
   *
   * @type {Map<Function, DatabaseDialect>}
   */
  static #registeredDialects = new Map();
}

