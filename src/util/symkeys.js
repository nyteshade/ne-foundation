/**
 * Represents a secure container for storing and retrieving unique symbols
 * associated with data. This class provides methods to add new symbols to
 * the Symkeys and to retrieve data associated with a particular symbol.
 *
 * @example
* // Create a new Symkeys instance
* const symkeys = new Symkeys();
*
* // Add a symbol with associated data to the Symkeys
* const mySymbol = Symkeys.add('myIdentifier', { foo: 'bar' });
*
* // Retrieve the data using the symbol
* const myData = Symkeys.dataFor(mySymbol);
* console.log(myData); // Output: { foo: 'bar' }
*/
export class Symkeys {
 /**
  * Adds a new entry to the Symkeys with a unique symbol based on the provided
  * name and associates it with the given data.
  *
  * @param named - The base name for the symbol to be created.
  * @param [associatedData={}] - The data to associate with the symbol.
  * @returns The unique symbol created for the entry.
  *
  * @example
  * // Add an entry with associated data
  * const symbol = Symkeys.add('myEntry', { foo: 'bar' });
  * // Retrieve the associated data using the symbol
  * const data = Symkeys.dataFor(symbol);
  * console.log(data); // Output: { foo: 'bar' }
  */
 add(named, associatedData = {}) {
   // Generate a unique token for the symbol
   const token = Symkeys.token;

   // Calculate a name (optionally with domain and separator)
   const symName = this.calculateName(named)

   // Create a symbol using the provided name and the unique token
   const symbol = Symbol.for(`${symName} #${token}`);

   // Store the symbol and associated data in the Symkeys's internal map
   this[Symkeys.kDataKey].set(symbol, associatedData);

   // Return the unique symbol for external use
   return symbol;
 }

 /**
  * Retrieves the data associated with a given symbol from the Symkeys.
  *
  * This method allows access to the data that has been associated with a
  * particular symbol in the Symkeys. It is useful for retrieving stored
  * information when only the symbol is known.
  *
  * @param symbol - The symbol whose associated data is to be
  * retrieved.
  * @returns The data associated with the symbol, or undefined if
  *                   the symbol is not found in the Symkeys.
  *
  * @example
  * // Assuming 'mySymbol' is a symbol that has been added to the Symkeys
  * // with associated data
  * const data = Symkeys.dataFor(mySymbol);
  * console.log(data); // Output: The data associated with 'mySymbol'
  */
 data(forSymbol) {
   return this[Symkeys.kDataKey].get(forSymbol);
 }

 /**
  * Extracts the token part from a symbol created by the `add` method.
  *
  * This method parses the string representation of a symbol to retrieve
  * the unique token that was appended to the symbol's name upon creation.
  * It is useful for debugging or for operations that require knowledge of
  * the token associated with a symbol.
  *
  * @param symbol - The symbol whose token is to be extracted.
  * @returns The extracted token or undefined if the
  * token cannot be extracted.
  *
  * @example
  * // Assuming 'mySymbol' is a symbol created with the name 'myEntry'
  * // and a token 'agftofxob6f'
  * const token = Symkeys.tokenFor(mySymbol);
  * console.log(token); // Output: 'agftofxob6f'
  */
 token(forSymbol) {
   // Use a regular expression to match the token pattern in the symbol
   // description exists on symbol but our JS output target is too old
   return /^.* \#(.*?)$/.exec(forSymbol).description?.[1];
 }

 /**
  * Retrieves an iterator for the symbols stored in the Symkeys.
  *
  * This method provides access to the symbols that have been stored in
  * the Symkeys. It returns an iterator which can be used to loop over
  * all the symbols. This is particularly useful for iterating through
  * all stored data without knowing the individual symbols in advance.
  *
  * @returns An iterator that yields all the symbols
  * stored in the Symkeys.
  *
  * @example
  * // Assuming the Symkeys has symbols stored
  * for (const symbol of Symkeys.symbols()) {
  *   console.log(symbol);
  * }
  */
 symbols() {
   // Retrieve the keys (symbols) from the Symkeys data map and return
   // the iterator.
   return this[Symkeys.kDataKey].keys();
 }

 calculateName(providedName, useDomain, useSeparator) {
   let domain = String(useDomain || this[Symkeys.kDomain])
   let separator = String(useSeparator || this[Symkeys.kSeparator])
   let postfix = (String(providedName).startsWith(separator)
     ? providedName.substring(1)
     : providedName
   )

   if (domain.length) {
     if (domain.endsWith(separator)) {
       domain = domain.substring(0, domain.length - 1)
     }
   }
   else {
     separator = ''
   }

   return `${domain}${separator}${postfix}`
 }

 /**
  * Constructs a new instance of the Symkeys, setting up a proxy to
  * intercept and manage access to properties.
  *
  * This constructor initializes the Symkeys with a proxy that
  * overrides the default behavior for property access, checking, and
  * enumeration. It allows the Symkeys to behave like a map for its
  * own properties, while also maintaining the prototype chain.
  *
  * @param {string} domain an optional prefix string, to which the
  * `separator` parameter value will be guaranteed to have in between
  * the domain (if truthy) and the name of the added key.
  * @param {string} separator defaults to a period. So if your domain
  * is 'symkeys.internal' then calling {@link add()} with a name of
  * `"feature"` will result in the full name being
  * `"symkeys.internal.feature"`
  *
  * @example
  * const Symkeys = new Symkeys();
  * Symkeys[Symbol.for('myProperty')] = 'myValue';
  * console.log(Symkeys[Symbol.for('myProperty')]); // 'myValue'
  */
 constructor(domain = '', separator = '.') {
   // Create a prototype from the parent class to maintain the chain.
   const prototype = Object.create(Object.getPrototypeOf(this))

   // Store the original prototype for potential future use.
   this[Symkeys.kPrototype] = prototype

   // Create map for this instance
   this[Symkeys.kDataKey] = new Map()

   // Store the domain
   this[Symkeys.kDomain] = (typeof domain === 'string' && domain)

   // Store the separator
   this[Symkeys.kSeparator] = separator

   // Access the internal map that stores Symkeys data.
   const map = this[Symkeys.kDataKey];

   // Replace the instance's prototype with a proxy that manages
   // property access and manipulation.
   Object.setPrototypeOf(
     this,
     new Proxy(Object.create(prototype), {
       // Return the stored prototype for the target.
       getPrototypeOf(_) {
         return prototype;
       },

       // Intercept property access.
       get(target, property, receiver) {
         // If the property exists in the Symkeys map, return its value.
         if (map.has(property)) {
           return map.get(property);
         }
         // Otherwise, perform the default behavior.
         return Reflect.get(target, property, receiver);
       },

       // Check for property existence. Check both the Symkeys map and the target for
       // the property.
       has(target, property) {
         return map.has(property) || Reflect.has(target, property);
       },

       // Retrieve all property keys. Combine keys from the Symkeys map and the target.
       ownKeys(target) {
         return [...Array.from(map.keys()), ...Reflect.ownKeys(target)];
       },

       // Intercept property assignment.
       set(_, property, value, __) {
         // If the property exists in the Symkeys map, set its value.
         if (map.has(property)) {
           map.set(property, value);
           return true;
         }
         // If not, the operation is not allowed.
         return false;
       },

       // Retrieve property descriptors.
       getOwnPropertyDescriptor(_, property) {
         // Convert the Symkeys map to an object to use with
         // Object.getOwnPropertyDescriptor.
         const object = [...map.entries()].reduce(
           (a, e) => Object.assign(a, { [e[0]]: e[1] }),
           {},
         );
         // Retrieve the descriptor from the object.
         return Object.getOwnPropertyDescriptor(object, property);
       },
     }),
   );
 }

 /**
  * Generates a random token string.
  *
  * This method creates a pseudo-random token that can be used for various
  * purposes within the library, such as generating unique identifiers or
  * keys. The token is generated using a base 36 encoding, which includes
  * numbers and lowercase letters.
  *
  * @returns A random token string.
  *
  * @example
  * // Example of getting a random token:
  * const token = MyClass.token;
  * console.log(token); // Outputs a string like 'qg6k1zr0is'
  */
 static get token() {
   return Math.random().toString(36).slice(2);
 }

 /**
  * Reusable publicly static key for identifying where data is stored.
  */
 static get kDataKey() {
   return Symbol.for('symkeys.data');
 }

 /**
  * Reusable publicly static key for identifying where data is stored.
  */
 static get kPrototype() {
   return Symbol.for('symkeys.prototype')
 }

 static get kDomain() {
   return Symbol.for('symkeys.domain')
 }

 static get kSeparator() {
   return Symbol.for('symkeys.separator')
 }
}
