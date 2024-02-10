/**
 * `DatabaseDialect` serves as an abstract base class for different database
 * dialect implementations. It provides a common interface and foundational
 * behavior that specific database dialects can build upon. Subclasses should
 * implement the methods necessary to interact with their respective database
 * systems, such as query execution, connection handling, and transaction
 * management.
 *
 * This class is designed to be extended and should not be instantiated
 * directly. It encapsulates common database operations and serves as a
 * contract for what methods a concrete database dialect class must implement.
 */
export class DatabaseDialect {
  /**
   * Creates a new `DatabaseDialect` instance with the provided configuration.
   *
   * The constructor initializes the database configuration and sets up an
   * event system for the database dialect. If no configuration is provided,
   * an empty object is used. If the provided configuration is not an object,
   * it is wrapped inside an object with an `initial` property.
   *
   * @param {Object} [config={}] - The database configuration object.
   */
  constructor(config) {
    const isObject = x => typeof x !== 'object' || x === null

    if (isObject(config)) {
      this.config = { initial: config }
    } else {
      this.config = config
    }

    this.#context = isObject(this.config?.context) 
      ? this.config.context
      : {}

    this.#events = new EventTarget()

    this.#handleChildLifecycleMethods()
  }

  /**
   * Transitions the database state to online.
   *
   * This method should be implemented by subclasses to handle any necessary
   * operations when the database is transitioning to an online state. This
   * could include establishing connections, initializing resources, or other
   * startup procedures. The specifics of what "online" means may vary between
   * different database systems and should be documented by the subclass.
   *
   * The method is expected to be called when the database should get ready 
   * to start accepting queries and transactions. It is a critical part of 
   * the database lifecycle and ensures that the database is properly prepared 
   * for use.
   * 
   * @async
   */
  async online() {}

  /**
   * Automatically invoked after a subclass's `online` method completes.
   *
   * This method is part of an aspect-oriented programming (AOP) approach
   * where it is called automatically as a post-processing step when the
   * `online` method of a subclass is invoked. It is responsible for emitting
   * an event that signals the database has transitioned to an online state,
   * indicating readiness for operations. This event can be used to trigger
   * other system components that rely on the database's availability.
   *
   * Implementers should not need to call this method directly; it is managed
   * by the #handleChildLifecycleMethods() mechanism.
   *
   * @fires DatabaseDialect#EVT_DB_ONLINE - The event indicating the database
   * is online.
   */
  after_online() {
    this.fireEvent(DatabaseDialect.EVT_DB_ONLINE);
  }

  /**
   * Transitions the database state to offline.
   *
   * This method should be implemented by subclasses to handle any necessary
   * operations when the database is transitioning to an offline state. This
   * could include closing connections, cleaning up resources, or other
   * shutdown procedures. The specifics of what "offline" means may vary
   * between different database systems and should be documented by the
   * subclass.
   * 
   * @async
   */
  async offline() {}

  /**
   * Automatically invoked after a subclass's `offline` method completes.
   *
   * This method is part of an aspect-oriented programming (AOP) approach
   * where it is called automatically as a post-processing step when the
   * `offline` method of a subclass is invoked. It is responsible for emitting
   * an event that signals the database has transitioned to an offline state,
   * indicating it is no longer ready for operations. This event can be used
   * to trigger other system components that need to respond to the database's
   * unavailability.
   *
   * Implementers should not need to call this method directly; it is managed
   * by the #handleChildLifecycleMethods() mechanism.
   *
   * @fires DatabaseDialect#EVT_DB_OFFLINE - The event indicating the database
   * is offline.
   */
  after_offline() {
    this.fireEvent(DatabaseDialect.EVT_DB_OFFLINE);
  }

  /**
   * Asynchronously initializes the database dialect.
   *
   * This method serves as a placeholder for initialization logic that should
   * be implemented by subclasses. It is designed to be called during the
   * database setup phase, before any database operations are performed. The
   * method is responsible for setting up any necessary state or configurations
   * required by the database dialect. Upon completion, it emits an event to
   * signal that the database is ready to be bootstrapped.
   *
   * Subclasses should override this method with their specific initialization
   * logic to ensure the database environment is correctly prepared for
   * subsequent operations. 
   *
   * @async
   * @fires DatabaseDialect#EVT_DB_INIT
   * @note subclasses need to call `await super.initialize()` as the base
   * class implementation fires lifecycle events.
   * @param {object} handle this is the type of object returned from 
   * {@link DatabaseDialect.getHandle}. It is likely the object that is used
   * to make queries, execute statements and the like.
   * @returns {Promise<void>} A promise that resolves when the initialization
   * process is complete.
   */
  async initialize(handle) {    
  }

  /**
   * Called after the `initialize` method completes.
   *
   * This method is part of the database initialization process and is
   * automatically invoked following the completion of the `initialize`
   * method. It is responsible for emitting an event that signals the
   * completion of the database initialization. This event can be used by
   * other components of the system that need to react to the database
   * becoming ready for operations.
   *
   * Implementers should not need to call this method directly; it is managed
   * by the #handleChildLifecycleMethods() mechanism.
   *
   * @fires DatabaseDialect#EVT_DB_INIT - The event indicating that the
   * database initialization is complete.
   */
  after_initialize() {
    this.fireEvent(DatabaseDialect.EVT_DB_INIT);
  }

  /**
   * Retrieves a connection to the database.
   *
   * This method is a placeholder and should be implemented by subclasses to
   * establish a connection to their respective databases. The implementation
   * should handle the logic for connecting to the database, including
   * authentication and configuration based on the specific needs of the
   * database being connected to. It is expected to return a promise that
   * resolves with the database connection object.
   *
   * @async
   * @throws {Error} Throws an error if the method is not implemented by the
   * subclass.
   * @returns {Promise<DatabaseConnection>} A promise that resolves with the
   * database connection object.
   */
  async getHandle() {    
    throw new Error('getHandle method must be implemented by subclasses');
  }

  /**
   * Called after the `getHandle` method successfully retrieves a database
   * connection.
   *
   * This method is part of the database connection process and is
   * automatically invoked after a successful return from the `getHandle`
   * method. It is responsible for emitting an event that signals the
   * successful connection to the database. This event can be used by other
   * components of the system that need to react to the database being
   * connected.
   *
   * Implementers should not need to call this method directly; it is managed
   * by the internal lifecycle mechanism.
   *
   * @fires DatabaseDialect#EVT_DB_CONNECT - The event indicating that a
   * database connection has been successfully established.
   */
  after_getHandle() {
    this.fireEvent(DatabaseDialect.EVT_DB_CONNECT);
  }

  /**
   * Initializes and connects to the database.
   * 
   * This method performs the necessary initialization and bootstrap procedures
   * for the database before establishing a connection. It sequentially calls
   * the `online` and then 'initialize' methods, ensuring that each step is 
   * completed before proceeding to the next. 
   * 
   * This method is particularly useful for setting up the database during
   * application startup, as it encapsulates all the required steps into a
   * single, convenient method call. It should be used when the database
   * connection needs to be established after the database has been properly
   * initialized and bootstrapped.
   * 
   * @async
   * @returns {Promise<DatabaseConnection>} A promise that resolves with the
   * database connection object once the database has been initialized,
   * bootstrapped, and connected.
   */
  async initAndConnect() {
    await this.online();
    this.fireEvent(DatabaseDialect.EVT_DB_ONLINE);
    await this.initialize(await this.getHandle());
  }

  /**
   * Indicates whether the database connection is currently established.
   *
   * This property should be overridden by subclasses to return a boolean
   * value that accurately reflects the current state of the database
   * connection. When `true`, it signifies that the database is connected
   * and ready to handle queries. When `false`, it indicates that the
   * database is not connected.
   *
   * This property is primarily used for checking the connection status
   * before attempting to execute queries or perform database operations.
   * It provides a quick way for the rest of the application to verify
   * the readiness of the database layer without having to catch errors
   * from failed operations due to a lack of connection.
   *
   * @returns {boolean} The connection status of the database.
   */
  get connected() {
    return false;
  }

  /**
   * Dispatches a custom event with the specified name and detail data.
   *
   * This method creates and dispatches an event using the provided `eventName`
   * and optional `detailData`. The `detailData` is merged with the context of
   * the DataConnector instance before being passed to the event. This allows
   * for the inclusion of additional information that listeners of the event
   * might require.
   *
   * The method is designed to be used internally within the DataConnector
   * class to emit custom events that can be listened to by other parts of the
   * application, facilitating a reactive programming model.
   *
   * @param {string} eventName - The name of the event to dispatch.
   * @param {Object} [detailData={}] - Additional data to be included with the
   * event. This data is merged with the instance's context.
   * @throws {Error} If the event name is not a string or if the detailData is
   * not an object.
   */
  fireEvent(eventName, detailData = {}) {
    const details = this.#mergeData(
      this.#context,
      detailData
    );
    const event = new CustomEvent(eventName, { detail: details });
    
    this.#events.dispatchEvent(event);
  }

  /**
   * Retrieves the metadata associated with the database dialect instance.
   * This metadata typically contains information about the database schema,
   * tables, and other relevant details that have been fetched or set during
   * the lifecycle of the dialect instance.
   *
   * @returns {Object} An object containing the metadata of the database
   * dialect implementation.
   */
  get metadata() {
    return null;
  }  

  /**
   * Registers an event listener for a specified event on the database.
   * 
   * This method allows components to react to specific events emitted by the
   * database, such as connection changes or error notifications. The listener
   * function provided will be called whenever the specified event is
   * dispatched.
   * 
   * @param {string} eventName - The name of the event to listen for.
   * @param {Function} listener - The callback function to execute when the
   * event is fired. The callback receives an Event object as its first
   * argument.
   * @param {Object|boolean} [options] - An options object that specifies
   * characteristics about the event listener. The available options are
   * dependent on the EventTarget.addEventListener method. Alternatively, a
   * boolean value can be used to indicate whether the event should be
   * captured during the capturing phase (true) or not (false, default).
   */
  on(eventName, listener, options) {
    this.#events.addEventListener(eventName, listener, options);
  }

  /**
   * Unregisters an event listener for a specified event on the database.
   *
   * This method removes a previously registered event listener from the
   * database, ensuring that the listener will no longer be called when the
   * specified event is dispatched. It is important to match the `eventName`,
   * `listener`, and `options` parameters with those used during the event
   * listener registration with the `on` method.
   *
   * @param {string} eventName - The name of the event to stop listening for.
   * @param {Function} listener - The callback function that was registered.
   * @param {Object|boolean} [options] - The options object or boolean value
   * that was specified when the listener was registered. This parameter is
   * optional and should match the one provided during registration for
   * proper removal.
   */
  off(eventName, listener, options) {
    this.#events.removeEventListener(eventName, listener, options);
  }

  /**
   * Retrieves the short name of the database dialect.
   *
   * This property returns the short name identifier for the database dialect
   * instance. If the instance has a specific short name set, it will return
   * that value. Otherwise, it defaults to the static shortName defined on the
   * constructor of the class. This is useful in IDE tooltips to quickly
   * identify the dialect without needing to inspect the source code.
   *
   * @returns {string} The short name of the database dialect.
   */
  get shortName() {
    if (this.shortName) {
      return this.shortName
    }

    return this.constructor.shortName;
  }  

  /**
   * Merges properties from a source object into a target object.
   *
   * This method iterates over all own keys of the `fromObject` and copies
   * each property descriptor to the `intoObject`. If the property descriptor
   * includes getter or setter functions, they are bound to the `fromObject`
   * to preserve their original context when accessed on the `intoObject`.
   *
   * This is a private utility method used within the DataConnector class to
   * combine context data with additional event details before emitting events.
   *
   * @private
   * @param {Object} intoObject - The target object to which properties will
   * be copied.
   * @param {Object} fromObject - The source object from which properties will
   * be copied.
   */
  #mergeData(intoObject, fromObject) {
    Reflect.ownKeys(fromObject).forEach(key => {
      const descriptor = Object.getOwnPropertyDescriptor(fromObject, key);
      if (Reflect.has(descriptor, 'get') || Reflect.has(descriptor, 'set')) {
        if (descriptor.get) {
          descriptor.get = descriptor.get.bind(fromObject);
        }
        if (descriptor.set) {
          descriptor.set = descriptor.set.bind(fromObject);
        }
      }
      Object.defineProperty(intoObject, key, descriptor);
    });
  }

  /**
   * Handles the lifecycle methods of child classes extending DatabaseDialect.
   * This method checks for the presence of lifecycle methods such as 'online',
   * 'offline', 'initialize', and 'getHandle' in the child class. If any are
   * present, it wraps them with 'before_' and 'after_' hooks, allowing for
   * custom behavior to be executed before and after the lifecycle method.
   * 
   * This method is intended to be called internally and should not be invoked
   * directly. It relies on the private #has and #hasGetter methods to determine
   * if the lifecycle methods are defined and to handle property descriptors
   * correctly.
   */
  #handleChildLifecycleMethods() {
    const lifecyleMethodKeys = ['online', 'offline', 'initialize', 'getHandle'];

    if (this.constructor.name !== DatabaseDialect.name) {
      // Fetch prototypes
      const rootPrototype = DatabaseDialect.prototype       
      const thisPrototype = this.constructor.prototype

      const rootHas = this.#has(rootPrototype)
      const thisHas = this.#has(thisPrototype)

      // Repeat for each lifecycle method
      for (const key of lifecyleMethodKeys) {
        if (thisHas(key)) {
          const descriptor = Object.getOwnPropertyDescriptor(thisPrototype, key)
          if (descriptor == null) {
            continue
          }

          const original = (() => {
            if (this.#hasGetter(descriptor)) {
              return descriptor.get.bind(this)()
            }
            else if (this.#has(descriptor, 'value', 'function')) {
              return descriptor.value
            }
            return () => {}
          })()

          Object.defineProperty(this, key, {
            value: async (...args) => {
              const asyncNoOp = async () => {}
              const [before, after] = [`before_${key}`, `after_${key}`].
                map(aopKey => {
                  return this?.[aopKey]?.bind(this) ?? asyncNoOp
                })

              await before(...args)
              const results = await original.call(this, ...args)
              await after(...args)
              return results
            },
            writable: false,
            configurable: true,
            enumerable: true,
          })
        }
      }
    }
  }

  /**
   * Checks if a given object has a property with an optional type filter.
   * 
   * This method is used to determine if the specified object has a property
   * matching the given key and, optionally, if that property is of a specific
   * type. If no key is provided, it returns a function that can be used to
   * check for the existence and type of a property on the object.
   * 
   * @param {Object} forObject - The object to check for the presence of the key.
   * @param {string} [optionalKey] - The key to check for on the object. If not
   * provided, a function is returned for checking any key.
   * @param {string} [andIsA] - An optional string representing the type that the
   * property is expected to be. If not provided, type is not checked.
   * @returns {boolean|Function} - Returns a boolean if a key is provided,
   * indicating the presence and, optionally, the type of the property. If no key
   * is provided, returns a function that accepts a key and returns a boolean
   * based on the same criteria.
   */
  #has(forObject, optionalKey, andIsA) {
    if (forObject === null || typeof forObject !== 'object') {
      return () => false;
    }

    const checkType = (key) => !andIsA || typeof forObject[key] == andIsA;

    if (optionalKey != null) { // double equals intentional
      return Reflect.has(forObject, optionalKey) && checkType(optionalKey);
    }

    return (key) => Reflect.has(forObject, key) && checkType(key);
  }

  /**
   * Determines if a descriptor represents an accessor property.
   *
   * Accessor properties are defined by having getter and/or setter methods
   * without 'value' and 'writable' keys. This method checks the descriptor's
   * structure to identify if it matches the criteria for an accessor.
   *
   * @param {Object} descriptor - The property descriptor to check.
   * @returns {boolean} True if the descriptor defines an accessor property,
   * false otherwise.
   */
  #isAccessor(descriptor) {
    const has = this.#has(descriptor)

    return (
      !(has('value') || has('writable')) &&
      (has('get') || has('set'))
    )
  }

  /**
   * Checks if the provided descriptor has a getter function.
   *
   * This method determines whether a given property descriptor includes a
   * getter method. It first verifies that the descriptor defines an accessor
   * property and then checks for the presence of a 'get' key. This method
   * relies on {@link DatabaseDialect.#isAccessor} which first checks to
   * see if the descriptor is both valid and is not a data descriptor.
   *
   * @param {Object} descriptor - The property descriptor to check.
   * @returns {boolean} true if a getter is defined, false otherwise.
   */
  #hasGetter(descriptor) {
    return (
      this.#isAccessor(descriptor) && 
      Reflect.has(descriptor, 'get') &&
      typeof descriptor === 'function'
    )
  }

  /**
   * The short name identifier for the database dialect instance.
   * 
   * This private field stores the short name of the dialect, which is retrieved
   * from the static `shortName` property of the constructor. It is used
   * internally to provide a consistent identifier for the dialect across
   * various parts of the system.
   * 
   * @private
   * @type {string|symbol}
   */
  shortName = this.constructor.shortName;

  /**
   * A static getter property that provides a short name identifier for the
   * database dialect. This identifier is used as a property name in database
   * connectors and other parts of the system that require a concise and
   * consistent label for the dialect.
   *
   * The short name is intended to be used in contexts where a brief, unique
   * identifier is needed to represent the specific database dialect being
   * utilized. It simplifies referencing the dialect in various parts of the
   * application, such as configuration files or when dynamically selecting
   * the appropriate database connector based on the dialect.
   *
   * @returns {string|symbol} The short name identifier for the database 
   * dialect.
   */
  static get shortName() { return "databaseDialect" }
 
  /**
   * Static getter for the database error event name.
   * 
   * This property can be used to listen for error events emitted by the 
   * database. It is useful in scenarios where error handling or logging is 
   * needed when the database encounters an issue. By listening to this event, 
   * developers can implement custom error handling strategies or trigger 
   * alerts.
   * 
   * @returns {string} The event name for database errors.
   */
  static get EVT_DB_ERROR() { return "database.error"; }

  /**
   * Static getter for the database initialization event name.
   * 
   * This property can be used to listen for when the database is in the process
   * of initializing. It is useful in scenarios where certain setup routines need
   * to be performed immediately after the database starts its initialization
   * process but before it actually becomes available for operations.
   * 
   * @returns {string} The event name for database initialization.
   */
  static get EVT_DB_INIT() { return "database.initialize" }
  
  /**
   * Static getter for the database connection event name.
   * 
   * This property can be used to listen for when the database has successfully
   * established a connection. It is useful in scenarios where certain actions
   * need to be performed as soon as the database connection is confirmed to be
   * established and operational.
   * 
   * @returns {string} The event name for when the database is connected.
   */
  static get EVT_DB_CONNECT() { return "database.connected" }

  /**
   * Static getter for the database online event name.
   * 
   * This property is used to listen for the event indicating that the database
   * is online and ready to handle queries. It is particularly useful in
   * scenarios where it's necessary to wait for the database to be fully
   * operational before performing operations that require a live database
   * connection.
   * 
   * @returns {string} The event name for when the database is online.
   */
  static get EVT_DB_ONLINE() { return "database.online"; }
  
  /**
   * Static getter for the database offline event name.
   * 
   * This property can be used to listen for the event that indicates the 
   * database has gone offline. It is useful in scenarios where it's necessary 
   * to detect when the database is no longer available, allowing for 
   * implementation of appropriate fallback mechanisms or to trigger 
   * reconnection logic.
   * 
   * @returns {string} The event name for when the database goes offline.
   */
  static get EVT_DB_OFFLINE() { return "database.offline"; }

  /**
   * Static getter for the database disconnection event name.
   * 
   * This property can be used to listen for when the database has been
   * disconnected, either through a manual disconnection call or due to a
   * connection issue. It is useful in scenarios where cleanup or reconnection
   * logic needs to be executed once the database connection is lost.
   * 
   * @returns {string} The event name for when the database is disconnected.
   */
  static get EVT_DB_DISCONNECT() { return "database.disconnected" }

  /**
   * A regular expression pattern used to validate identifiers such as
   * column names, table names, and other database objects. This pattern
   * ensures that identifiers start with a letter or underscore, followed
   * by any combination of letters, digits, underscores, or dollar signs.
   * The total length of the identifier must not exceed 63 characters.
   *
   * This property is static and can be used without instantiating the
   * DatabaseDialect class. It is useful for validating dynamic identifiers
   * provided by users or constructed by the application before attempting
   * to execute database operations that involve such identifiers.
   * 
   * The default aligns with PostgreSQL, but this should be redefined for
   * every implemented dialect.
   *
   * @returns {RegExp} The regular expression pattern for database object
   * identifiers.
   */
  static get KEYWORD_REGEX() { return /^[a-zA-Z_][a-zA-Z0-9_$]{0,62}$/ }

  /**
   * Static getter for the SQL WHERE clause joiner string.
   * 
   * This property provides a consistent string to be used when joining
   * conditions in a SQL WHERE clause. It is a utility helper that ensures
   * SQL queries are constructed with the correct syntax for separating the
   * WHERE keyword from the conditions that follow.
   * 
   * @returns {string} The string " WHERE " to be used in SQL queries.
   */
  static get WHERE_JOINER() { return ' WHERE ' }

  /**
   * Holds the configuration settings for the database connection. This
   * includes credentials and other necessary details required to establish
   * a connection to the database. It is set during the instantiation of
   * the DatabaseDialect and is used internally to configure the database
   * client. Each concrete dialect implementation will handle its use
   * differently.
   *
   * @type {Object}
   */
  config = null

  /**
   * An instance of EventTarget which allows the DatabaseDialect to dispatch
   * and listen for custom events. This can be used to handle asynchronous
   * operations and inter-component communication within the database layer.
   * 
   * @private
   * @type {EventTarget}
   */
  #events = new EventTarget()

  /**
   * Holds additional context for the database operations. This context can
   * include environmental data, user session information, or any other details
   * that might be relevant to the database operations being performed. It is
   * intended to be used by subclasses to enrich the database interactions with
   * application-specific context.
   *
   * @private
   * @type {Object}
   */
  #context = {}
}
