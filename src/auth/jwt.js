export class JWT {
  /**
   * The secret key used for signing and verifying JWT tokens. This is a private
   * static member that should not be accessed directly outside of the class.
   * Instead, use the provided getter and setter to interact with this value.
   * The initial value is taken from the environment variable JWT_SECRET.
   *
   * @private
   * @type {string|function}
   */
  static #secret = process.env.JWT_SECRET;

  /**
   * A flag indicating if the JWT secret is set. It's initialized based on the
   * JWT_SECRET environment variable's presence. This private static member
   * should not be accessed directly. Use the `secretSet` getter for checking
   * if the secret key is provided before performing JWT operations.
   *
   * @private
   * @type {boolean}
   */
  static #secretSet = !!process.env.JWT_SECRET;

  /**
   * Sets the secret key used for signing and verifying JWT tokens.
   * This method allows for updating the secret key at runtime. The new secret
   * should be a string that is kept secure and not exposed to unauthorized
   * entities. It is critical to ensure that the secret key is valid and kept
   * confidential to maintain the integrity and security of the tokens being
   * processed.
   *
   * @param {string|function} value - The new secret key to be used for JWT
   * operations.
   */
  static set secret(value) {
    this.#secret = value;
    this.#secretSet = true;
  }

  /**
   * Getter for the private static member #secretSet. This property indicates
   * whether the JWT secret has been set for the JWTExtension class. It is
   * primarily used to check if the secret key is available before performing
   * JWT operations. This getter ensures encapsulation by preventing direct
   * access to the private static member.
   *
   * @returns {boolean} - True if the secret is set, false otherwise.
   */
  static get secretSet() {
    return this.#secretSet;
  }

  /**
   * Initializes the JWTExtension with a given secret key. This method is used
   * to set the secret key for JWT operations at the start of the application.
   * The secret key is essential for the encoding and decoding of the tokens,
   * ensuring their integrity and security. The method returns the class itself,
   * allowing for method chaining.
   *
   * @param {string} secret - The secret key used for signing and verifying JWT
   * tokens. It should be a string that is kept secure and not exposed to
   * unauthorized entities.
   * @returns {JWTExtension} - The JWTExtension class for method chaining.
   */
  static init(secret) {
    this.secret = secret;
    return this;
  }

  /**
   * Signs a payload to create a JSON Web Token (JWT). This method can be used
   * synchronously or asynchronously, depending on whether a callback is
   * provided. If a callback is provided, the method returns a promise and the
   * callback is called with the error or the signed token. If no callback is
   * provided, the token is signed synchronously and returned.
   *
   * Before signing, the method checks if the secret key has been set. If not,
   * it throws an error to prevent the creation of an unsigned token.
   *
   * @param {Object|string} payload - The data to be signed into the token.
   * @param {Object|string|number} [durationOrOptions] - Either the duration
   * for which the token is valid, or an options object. If an object is
   * provided, it should conform to the options that the underlying jsonwebtoken
   * library accepts.
   * @param {Function} [callback] - Optional callback for Node.js style
   * asynchronous operation. Called with an error or the signed token.
   * @returns {Promise|string} - If a callback is provided, a promise is
   * returned that resolves with the signed token or rejects with an error. If
   * no callback is provided, the signed token is returned synchronously.
   * @throws {Error} If the secret key has not been set before calling this
   * method.
   */
  static sign(payload, durationOrOptions, callback) {
    if (!this.#secretSet) {
      throw new Error('A secret must be set before this class can be used');
    }

    let _options = durationOrOptions && typeof durationOrOptions === 'object'
      ? durationOrOptions
      : {};

    if (typeof callback === 'function') {
      return new Promise((resolve, reject) => {
        _JWT.sign(payload, this.#secret, _options, (error, signedToken) => {
          if (error) {
            callback(error, null);
            reject(error);
          } else {
            callback(null, signedToken);
            resolve(signedToken);
          }
        });
      });
    } else {
      return _JWT.sign(payload, this.#secret, _options);
    }
  }

  /**
   * Decodes or verifies a JSON Web Token (JWT) using a secret key. This method
   * can operate synchronously or asynchronously, depending on whether a
   * callback function is provided. If a callback is provided or `true` is
   * passed, the method returns a promise and the callback is called with the
   * error or the decoded token. If no callback is provided, the token is
   * verified synchronously and the decoded token is returned.
   *
   * @param {string} token - The JWT to decode or verify.
   * @param {Object} [options] - Optional settings for token verification, such
   * as `secret` to override the default, `algorithms` to specify the expected
   * signing algorithm, `issuer` to check the issuer, `audience` to check the
   * audience, and others. If `decode` is set to `true` in options and `raw` is
   * true, the token is decoded without verification.
   * @param {Function|boolean} [callback] - Optional callback for Node.js style
   * asynchronous operation, or `true` to return a promise without using a
   * callback. Called with an error or the decoded token.
   * @returns {Promise|Object|string} - If a callback is provided or `true` is
   * passed, a promise is returned that resolves with the decoded token or
   * rejects with an error. If no callback is provided, the decoded token is
   * returned synchronously.
   * @throws {Error} If the secret key has not been set before calling this
   * method.
   */
  static decode(token, options, callback) {
    if (!this.#secretSet) {
      throw new Error('A secret must be set before this class can be used');
    }

    let _options = options && typeof options === 'object' ? options : {};
    let _secret = _options?.secret ?? this.#secret;

    if (typeof callback === 'function' || callback === true) {
      if (_options.decode === true) {
        if (_options.raw) {
          return Promise.resolve(_JWT.decode(token, _options));
        }
      }

      return new Promise((resolve, reject) => {
        _JWT.verify(token, _secret, _options, (error, decoded) => {
          callback(error, decoded);
          if (error) {
            reject(error);
          }
          else {
            resolve(decoded);
          }
        })
      });
    }

    return _JWT.verify(token, _secret, _options);
  }
};
