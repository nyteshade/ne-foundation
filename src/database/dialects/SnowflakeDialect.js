import { DatabaseDialect } from "../DatabaseDialect.js";
import Snowflake from 'snowflake-sdk'
import { apply } from '../../extensions.js';
import { Patch } from '@nejs/extension';

apply();

const { sqlReplace, Deferred } = Patch.lazy;

/**
 * Represents a specific implementation of the DatabaseDialect tailored for
 * the Snowflake data warehousing service. This class encapsulates the
 * necessary configuration and methods to interact with a Snowflake database
 * instance, providing a concrete dialect that can be used within the
 * application to perform database operations.
 *
 * The SnowflakeDialect extends the generic DatabaseDialect, inheriting its
 * interface and behavior, while also implementing the specifics required to
 * connect to and use Snowflake. This includes handling of Snowflake-specific
 * connection details, query execution, and any other peculiarities of the
 * Snowflake database system.
 *
 * Example usage:
 * ```
 * // By default, SNOWFLAKE_ env variables (ACCOUNT, USERNAME, PASSWORD, 
 * // DATABASE, and ROLE) are checked for in `process.env` for these
 * // values if not supplied. (i.e. process.env.SNOWFLAKE_ACCOUNT, ...)
 * const snowflakeDialect = new SnowflakeDialect({
 *   sdkConfig: {
 *     account: 'your_account',
 *     username: 'your_username',
 *     password: 'your_password',
 *     database: 'your_database',
 *     role: 'your_role'
 *   },
 *   poolConfig: {
 *     min: 5,
 *     max: 20,
 *     autostart: false
 *   }
 * });
 * ```
 *
 * @extends DatabaseDialect
 */
export class SnowflakeDialect extends DatabaseDialect {
  /**
   * Constructs a new instance of the SnowflakeDialect class, initializing
   * configuration for the Snowflake SDK and connection pool.
   *
   * The constructor merges the provided configuration with default values and
   * environment variables to form the complete configuration object used to
   * establish connections to Snowflake. The `sdkConfig` is constructed using
   * environment variables for account details and can be overridden by the
   * provided `config.sdkConfig`. Similarly, `poolConfig` sets default values
   * for the connection pool which can be overridden by `config.poolConfig`.
   *
   * @param {Object} [config={}] - The user-provided configuration object.
   * @param {Object} [config.sdkConfig] - Configuration specific to the
   * Snowflake SDK. This includes account, username, password, database, and
   * role. If not provided, environment variables are used as defaults.
   * @param {Object} [config.poolConfig] - Configuration for the connection
   * pool, including minimum and maximum number of connections and autostart
   * behavior. Defaults are provided and can be overridden.
   */
  constructor(config) {
    const detectedConfig = {
      sdkConfig: {
        account: process.env.SNOWFLAKE_ACCOUNT,
        username: process.env.SNOWFLAKE_USERNAME,
        password: process.env.SNOWFLAKE_PASSWORD,
        database: process.env.SNOWFLAKE_DATABASE,
        role: process.env.SNOWFLAKE_ROLE,
        keepAlive: true,
        ...(config?.sdkConfig ?? {}),
      },
      poolConfig: {
        min: 1,
        max: 10,
        autostart: true,
        ...(config?.poolConfig ?? {}),
      },      
      ...(config ?? {}),
    }

    super(detectedConfig)

    if (
      detectedConfig?.shortName && 
      typeof detectedConfig.shortName == 'string'
    ) {
      this.shortName = detectedConfig.shortName
    }
  }

  /**
   * Transitions the Snowflake database connection to an online state by
   * creating a connection pool and waiting for it to become ready.
   * 
   * This asynchronous method sets up the connection pool for the Snowflake
   * database using the configuration provided during the instantiation of
   * the SnowflakeDialect. It creates the pool with the `sdkConfig` and
   * `poolConfig` settings from the `config` object. Once the pool is created,
   * the method waits for the pool to be ready before resolving, indicating
   * that the database is online and ready to handle queries.
   * 
   * This method should be called when the database is expected to start
   * accepting queries. It is a critical part of the database lifecycle and
   * ensures that the database connections are properly established and
   * managed through the pool.
   * 
   * @async
   * @returns {Promise<void>} A promise that resolves when the database
   * connection pool is ready and the database is online.
   */
  async online() {
    this.pool = Snowflake.createPool(
      this.config.sdkConfig, 
      this.config.poolConfig
    );
    await this.pool.ready();

    this.#metadata = await this.fetchTableData(this.config.sdkConfig.database);
    this.#connected = true;
  }

  /**
   * Transitions the Snowflake database connection to an offline state by
   * destroying all resources in the connection pool.
   *
   * This asynchronous method is responsible for properly shutting down the
   * connection pool by destroying all the resources it manages. It iterates
   * over all objects within the pool and attempts to destroy them, ignoring
   * any errors that occur during the destruction process. This ensures that
   * the pool is cleaned up gracefully, even if some resources might not be
   * in a state that allows for clean destruction.
   *
   * It is important to call this method before shutting down the application
   * to ensure that all database connections are closed and resources are
   * released. Failing to do so may lead to lingering connections and
   * potential resource leaks.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when all resources have
   * been destroyed and the database connection pool is offline.
   */
  async offline() {
    try {
      for (let resource of this.pool._allObjects) {
        try { this.pool.destroy(resource) } catch(suppressed) { }
      }  
    }
    catch (suppressed) { }
    this.#connected = false;
  }

  /**
   * Asynchronously retrieves a handle to a database resource from the pool.
   * 
   * This method provides an abstraction over the resource pool, returning a
   * handle object that contains a connection to the database and methods to
   * signal the completion or failure of the database operation. The handle
   * allows users to interact with the database connection and to manage its
   * lifecycle within the context of a single operation.
   * 
   * The `connection` property of the handle will be set to the acquired
   * resource from the pool. The `complete` property is a promise that should
   * be resolved or rejected by the user of the handle through the `finish` or
   * `failed` methods, respectively.
   * 
   * Applying a callback to `handle.complete.then()` will effectively create
   * a callback that fires when the resource has been returned to the pool.
   * 
   * @note failure to invoke either `finish` or `failed` on the returned
   * handle object will result in the connection being permanently tied up
   * and other users of pool will have one less connection to utilize.
   * @async
   * @returns {Promise<Object>} A promise that resolves to an object containing
   * the database connection and control methods. The object has the following
   * structure:
   * - `connection`: The acquired database resource.
   * - `complete`: A promise that represents the completion state of the
   *   operation using the handle.
   * - `finish`: A function that, when called, resolves the `complete` promise,
   *   indicating successful completion of the operation.
   * - `failed`: A function that, when called with an error, rejects the
   *   `complete` promise, indicating that an error occurred during the
   *   operation.
   */
  async getHandle() {
    if (!this.pool) {
      await this.initAndConnect();
    }

    const handle = {
      connection: null,
      complete: null,
      finish: null,
      failed: null,
      executeStream: SnowflakeDialect.#handleExecuteStream,
    };

    this.pool.use((resource) => {
      handle.connection = resource;
      handle.complete = new Promise((resolve, reject) => {
        handle.finish = resolve;
        handle.failed = reject;
      });

      return handle.complete;
    });

    return handle;
  }

  /**
   * Retrieves the metadata associated with the SnowflakeDialect instance.
   * This metadata typically contains information about the database schema,
   * tables, and other relevant details that have been fetched or set during
   * the lifecycle of the dialect instance.
   *
   * @returns {Object} An object containing the metadata of the 
   * SnowflakeDialect.
   */
  get metadata() {
    return this.#metadata;
  }

  /**
   * Asynchronously fetches table data from the Snowflake database.
   * This method retrieves the schema, table names, types, and column details
   * for each table within the specified database. It constructs a structured
   * object containing this metadata, which can be used for further processing
   * or analysis. If an error occurs during data retrieval, it logs the error
   * and the problematic row to the console.
   *
   * @param {string} [database='product_engineering'] - The name of the database
   * from which to fetch table data. Defaults to 'product_engineering' if not
   * specified.
   * @returns {Promise<Object>} A promise that resolves to an object where each
   * key represents a schema, and each schema contains a 'tables' object with
   * table names as keys. Each table key maps to an object containing column
   * details such as name, nullability, JavaScript type, Snowflake type, and
   * default value.
   */
  async fetchTableData(database = 'product_engineering') {
    if (!require.extensions['.sql']) {
      require('../../extensions.js').apply();
    }

    const getSchemasTablesSQL = 
      require('../../sql/snowflake/metadata/get_tables_and_views.sql');

    const handle = await this.getHandle();
    const query = sqlReplace(getSchemasTablesSQL, [['database', database]]);
    const rows = await handle.executeStream(query);
    const tables = {};

    for await (var row of rows) {
      try {
        let { 
          TABLE_SCHEMA: schema, 
          TABLE_NAME: tableName, 
          TABLE_TYPE: tableType, 
          COLUMN_JSON: columns 
        } = SnowflakeDialect.quietRowValues(row);
    
        columns = columns.map(column => {
          return SnowflakeDialect.quietRowValues(column);
        });

        const bindingKey = tableType === 'view' ? 'views' : 'tables';

        Object.makeProps(tables, `${schema}.${bindingKey}.${tableName}`, {});
        Object.makeProps(tables, `all.${database}.${schema}.${tableName}`, {});

        const table = tables[schema][bindingKey][tableName];
        const all = tables.all[database][schema][tableName];
    
        columns.reduce((accumulator, column) => {
          let { name, isNullable, jsType, snowflakeType, defaultValue } = 
            SnowflakeDialect.quietRowValues(column);
    
          isNullable = isNullable == 'false' ? false : true;
    
          Object.makeProps(
            accumulator, 
            `${name}.name,isNullable,jsType,snowflakeType,defaultValue`
          );

          Object.makeProps(
            all,
            `${name}.name,isNullable,jsType,snowflakeType,defaultValue`
          )
    
          const columnData = { 
            name, isNullable, jsType, snowflakeType, defaultValue 
          };

          accumulator[name] = columnData;
          all[name] = columnData;
    
          return accumulator;
        }, table);
      }
      catch (error) {
        console.error(error);
        console.log('FAILED on row', row);
      }
    }

    handle.finish();

    return tables;
  }

  /**
   * Indicates whether the Snowflake database is currently connected.
   *
   * This property provides a read-only access to the connection status of the
   * Snowflake database. It is useful for checking if the database is ready to
   * handle queries. 
   *
   * @returns {boolean} True if the database is connected, false otherwise.
   */
  get connected() {
    return this.#connected;
  }

  /**
   * Retrieves the number of idle resources in the Snowflake connection pool.
   *
   * This getter method provides the count of currently available resources
   * within the pool that are idle and ready to be used for new database
   * operations. It is a convenient way to monitor the pool's utilization and
   * health by providing insights into how many resources are not actively
   * engaged in database tasks.
   *
   * If the pool has not been initialized or is unavailable, this method will
   * return zero, indicating that there are no idle resources.
   *
   * @returns {number} The number of idle resources in the pool, or zero if
   * the pool is not initialized.
   */
  get numberOfIdleResources() {
    if (!this.connected) {
      return 0;
    }

    return this.pool?._availableObjects.length ?? 0;
  }

  /**
   * Holds the reference to the Snowflake connection pool. The pool is used
   * to manage and recycle database connections, ensuring efficient use of
   * resources. It is initialized when the database transitions to an online
   * state and is set to `null` initially to indicate that the pool has not
   * been created yet.
   *
   * @type {Object|null} The connection pool instance or `null` if the pool
   * has not been established.
   */
  pool = null

  /**
   * Indicates the connection status of the Snowflake database.
   *
   * This private property is a boolean flag that represents whether the
   * Snowflake database is currently connected. When set to `true`, it
   * signifies that the database connection is established and ready for
   * interaction. Conversely, when set to `false`, it indicates that the
   * database is not connected, and any attempts to interact with it should
   * be avoided or handled with reconnection logic.
   *
   * This property should not be accessed directly from outside the class;
   * instead, the `connected` getter should be used to retrieve the
   * connection status in a controlled manner. This approach encapsulates
   * the connection state and allows for additional logic to be implemented
   * within the getter if needed, such as logging or error handling.
   *
   * @private
   * @type {boolean}
   */
  #connected = false

  /**
   * A private property that stores metadata about the Snowflake database
   * tables. This metadata includes information such as table names, column
   * definitions, and data types, which can be used to understand the
   * structure of the database and to generate dynamic queries.
   *
   * The metadata object is structured as a map, with the key being the table
   * name and the value being an object containing the table's metadata. This
   * property is populated during the `online` method execution and is used
   * internally by the SnowflakeDialect class to provide insights and
   * facilitate operations on the database.
   *
   * @private
   * @type {Object<string, Object>}
   */
  #metadata = {}

  /**
   * Executes a Snowflake query and returns an async generator that yields
   * rows from the result set. This method is designed to stream rows from
   * a query execution, allowing for efficient processing of large data sets.
   * 
   * The method uses a deferred promise to manage the asynchronous flow of
   * data. It configures the Snowflake `execute` method to stream results,
   * then wraps the resulting rows in an async generator provided by the
   * `streamToAsyncGenerator` method.
   * 
   * @param {string} query - The SQL query or statement string to execute.
   * @param {Array} [variables=[]] - An array of variables for query binds,
   * in order.
   * @param {Object} [executeOptions=undefined] - Optional object containing
   * execution options passed to Snowflake's `execute` method.
   * @param {Object} [streamOptions=undefined] - Optional object containing
   * options passed to the `streamRows` method for row streaming.
   * @returns {Promise<AsyncGenerator>} A promise that resolves to an async
   * generator, which yields rows from the executed query.
   * @private
   */
  static async #handleExecuteStream(
    query,                      /* query/statement string */
    variables = [],             /* any binds, in order */
    executeOptions = undefined, /* options passed to snowflake.execute() */
    streamOptions = undefined   /* options passed to rows.streamRows() */
  ) {
    const rowsDeferred = new Deferred();
    const _executeOpts = {
      sqlText: query,
      streamResult: true,
      complete(error, statement) {
        // Reject the rowsDeferred promise if there's an error
        if (error) {
          return rowsDeferred.reject(error);   
        }

        // Create the NodeJS Readable stream using Snowflake's Statement
        const stream = statement.streamRows(streamOptions);

        // Generate an async generator around the results, and then return the
        // iterator it creates. (todo: decide if this is what we need)
        const rowIterator = SnowflakeDialect.streamToAsyncGenerator(stream)()
  
        // Resolve the rowsDeferred with the iterator
        rowsDeferred.resolve(rowIterator);
      },
    };

    // Only add the `binds` prop if we have variables supplied to us
    if (variables.length) {
      _executeOpts.binds = variables;
    }

    // Apply any overrides provided by the user as long as they gave us
    // an object to use that's valid
    if (typeof executeOptions === 'object' && executeOptions !== null) {
      Object.assign(_executeOpts, executeOptions);
    }

    // Execute the statement
    this.connection.execute(_executeOpts);

    // Return the promise with the iterator
    return rowsDeferred.promise;
  }

  /**
   * Wraps a Snowflake stream in an async generator function.
   * 
   * This method takes a Snowflake stream and returns an async generator
   * function. This generator yields each row of data as it becomes available
   * from the stream. It handles 'data', 'end', and 'error' events to manage
   * the flow of data and signal the completion or failure of the stream.
   * 
   * @param {Stream} stream - The Snowflake stream to be wrapped.
   * @returns {AsyncGenerator<*, void, *>} An async generator function that
   * yields rows from the stream.
   */
  static streamToAsyncGenerator(stream) {
    return async function*() {
      // This is a queue to store the chunks of data.
      const dataQueue = [];
    
      // Listening for 'data' events and pushing chunks into the queue.
      stream.on('data', chunk => {
        dataQueue.push(chunk);
        stream.pause(); // Pause the stream until the chunk is consumed.
      });
    
      // Handling the end of the stream.
      stream.once('end', () => {
        dataQueue.push(null); // Push a 'null' to signify the end of the stream.
      });
    
      // Handling errors.
      stream.once('error', err => {
        // Rejecting any promises that are waiting for the next chunk.
        dataQueue.push(Promise.reject(err));
      });
    
      while (true) {
        if (dataQueue.length > 0) {
          const chunk = dataQueue.shift();
    
          if (chunk === null) {
            // Null indicates the end of the stream.
            return;
          }
    
          if (chunk instanceof Promise) {
            // This is an error, thrown as a Promise.
            await chunk;
          }
    
          // Resume the stream to get the next chunk.
          stream.resume();
    
          yield chunk;
        } else {
          // If the queue is empty, wait for the next chunk.
          await new Promise(resolve => stream.once('readable', resolve));
        }
      }
    }
  }

  /**
   * Reduces an array of key-value pairs into an object, ensuring that the
   * values for existing keys in the accumulator are converted to lowercase
   * strings. If the value for a key is already lowercase or not a string,
   * it remains unchanged.
   *
   * @param {Object} accumulator - The object to accumulate the key-value pairs.
   * @param {Array} keyValue - The key-value pair array, where the first element
   * is the key and the second element is the value.
   * @returns {Object} The accumulator object with the key-value pairs reduced 
   * into it.
   */
  static rowValueReducer(accumulator, [key, value]) {
    accumulator[key] = value?.toLowerCase?.() ?? value;
    return accumulator;
  }

  /**
   * Transforms each value in the given row to a lowercase string if it is a
   * string and has uppercase characters. This function is particularly useful
   * for normalizing database row values for case-insensitive comparison or
   * when the data's case should not affect processing logic. It iterates over
   * the row's entries and applies the `rowValueReducer` to each value, which
   * handles the conditional transformation.
   *
   * @param {Object} row - The row object with keys as column names and values
   * as the corresponding data that may need to be transformed to lowercase.
   * @returns {Object} A new object with the original keys and transformed
   * values where applicable.
   */
  static quietRowValues(row) {
    return Object.entries(row).reduce(this.rowValueReducer, {});
  }

  /**
   * Gets the short name identifier for the Snowflake database dialect.
   *
   * This static property provides a convenient way to retrieve a simple,
   * human-readable identifier for the Snowflake dialect, which can be used
   * in logging, configuration, or any other context where a concise and
   * recognizable name is required. The short name is used internally to
   * reference the SnowflakeDialect class in a standardized way across the
   * application.
   *
   * @returns {string} The short name identifier for the Snowflake dialect.
   */
  static get shortName() { return "snowflake" }

  /**
   * For Snowflake, the general rules for identifiers (including tables, 
   * schemas, databases, columns, procedures, functions, and UDTFs) are quite 
   * similar. The identifiers: 
   * 
   *  1. Must start with a letter (a-z, A-Z) or an underscore (_).
   *  2. Subsequent characters can be letters, underscores, numbers (0-9), 
   *     or dollar signs ($).
   *  3. Are case-insensitive unless quoted.
   *  4. Cannot exceed 255 characters in length.
   *
   * @returns {RegExp} The regular expression pattern for database object
   * identifiers.
   */
  static get KEYWORD_REGEX() { return /^[a-zA-Z_][a-zA-Z0-9_$]{0,254}$/ }
}


