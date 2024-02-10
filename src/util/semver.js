/**
 * Represents a semantic version (semver) and provides utility methods for
 * managing and comparing versions according to the semver specification.
 */
export class SemVer {
  /**
   * Constructs a SemVer instance. Initializes the version based on the
   * provided semver string or defaults to "0.0.0" if not specified.
   *
   * Alternatively, if a specific portion of the version is indicated, only
   * that portion of the version instance will be modified. The `part` parameter
   * needs to match a portion of the SemVer object instance that needs updating;
   * `major`, `minor`, and `patch` are all converted to integers, while `prerelease`
   * and `metadata` are set as strings, unchanged.
   *
   * @param {string} [semverString="0.0.0"] - The initial semantic version string.
   * @param {string} [part="*"] - by default this is set to `*` which indicates that
   * the entire `semverString` is to be parsed. If the `part` is the name of a property
   * matching one of [`major`, `minor`, `patch`, `prerelease` or `metadata`] then
   * only that portion of the version is set. For major, minor and patch, the value
   * will be parsed into an integer. If an unknown key is specified, the entire
   * string will be processed.
   * @throws {Error} If semverString is not a valid semver format.
   */
  constructor(semverString = "0.0.0") {
    this.set(semverString)
  }

  /**
   * Sets the version based on a semver string. This method parses the string
   * and updates the major, minor, patch, prerelease, and metadata parts of the
   * version accordingly.
   *
   * @param {string} semverString - The semver string to parse and set.
   * @throws {Error} If semverString is not a string or not in valid semver format.
   */
  set(semverString, part = '*') {
    const { MAJOR, MINOR, PATCH, PRERELEASE, METADATA, FULL } = SemVer

    if (typeof semverString !== 'string') {
      throw new Error('semverString must be a string');
    }

    if (part !== FULL) {
      switch (part) {
        case MAJOR: this[part] = parseInt(semverString); return
        case MINOR: this[part] = parseInt(semverString); return
        case PATCH: this[part] = parseInt(semverString); return
        case PRERELEASE: this[part] = semverString; return
        case METADATA: this[part] = semverString; return
        default:
          break
      }
    }

    const [versionPart, prereleaseAndMetadata] = semverString.split('+');
    const [version, prerelease] = versionPart.split('-');
    const [major, minor, patch] = version.split('.').map(Number);

    if (version.split('.').length !== 3) {
      throw new Error('Version must be in the format major.minor.patch');
    }

    if ([major, minor, patch].some(num => num < 0 || isNaN(num))) {
      throw new Error('Major, minor, and patch versions must be non-negative integers');
    }

    this.major = major;
    this.minor = minor;
    this.patch = patch;
    this.prerelease = prerelease || '';
    this.metadata = prereleaseAndMetadata && prereleaseAndMetadata !== prerelease
      ? prereleaseAndMetadata
      : '';
  }

  /**
   * Retrieves the full version string in semver format. Constructs the version
   * string including the major, minor, patch versions, and optionally the
   * prerelease and metadata parts if they are present.
   *
   * @returns {string} The full version string in semver format.
   */
  get() {
    let semverString = `${this.major}.${this.minor}.${this.patch}`;
    if (this.prerelease) {
      semverString += `-${this.prerelease}`;
    }
    if (this.metadata) {
      semverString += `+${this.metadata}`;
    }
    return semverString;
  }

  /**
   * Increments part of the SemVer instance by the indicated amount.
   *
   * @param {string} version the portion of the version to increment. Valid values
   * are `major`, `minor` or `patch`.
   * @param {number} by - the amount by which the version is incremented. This
   * defaults to 1.
   * @returns {SemVer} the `this` instance for further chaining
   */
  increment(version, by = 1) {
    const { MAJOR, MINOR, PATCH } = SemVer

    if ([MAJOR, MINOR, PATCH].includes(version)) {
      this[version] = Math.round(this[version] + parseInt(by))
    }

    return this
  }

  /**
   * Decrements part of the SemVer instance by the indicated amount.
   *
   * @param {string} version the portion of the version to decrement. Valid values
   * are `major`, `minor` or `patch`.
   * @param {number} by - the amount by which the version is decremented. This
   * defaults to 1.
   * @returns {SemVer} the `this` instance for further chaining
   */
  decrement(version, by = 1) {
    const { MAJOR, MINOR, PATCH } = SemVer

    if ([MAJOR, MINOR, PATCH].includes(version)) {
      const newValue = Math.round(this[version] - parseInt(by))

      this[version] = Math.max(0, newValue)
    }

    return this
  }

  /**
   * Converts the version to a primitive value based on the context. When
   * converting to a number, only the major and minor parts are considered.
   * When converting to a string, the full semver string is returned.
   *
   * @param {string} hint - The context in which conversion is requested ("number"
   * or "string").
   * @returns {(string|number|null)} The converted value.
   */
  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case 'number':
        return parseFloat(`${this.major}.${this.minor}`);
      case 'string':
        return this.get();
      default:
        return null;
    }
  }

  /**
   * Determines if this version is exactly equal to another version. This
   * comparison includes the major, minor, patch, prerelease, and metadata
   * parts of the version. It's a strict comparison where all parts must match.
   *
   * @param {SemVer} otherVersion - The other SemVer instance to compare with.
   * @returns {boolean} True if all version components are exactly equal.
   */
  isEqual(otherVersion) {
    return this.major === otherVersion.major &&
           this.minor === otherVersion.minor &&
           this.patch === otherVersion.patch &&
           this.prerelease === otherVersion.prerelease &&
           this.metadata === otherVersion.metadata;
  }

  /**
   * Checks if this version is equal to another version based only on the major,
   * minor, and patch numbers. This method ignores the prerelease and metadata
   * parts of the version, making it a "loose" or "lenient" comparison. It is
   * useful for determining compatibility or disregarding build and pre-release
   * details.
   *
   * @param {SemVer} otherVersion - The other SemVer instance to compare with.
   * @returns {boolean} True if major, minor, and patch numbers are equal.
   */
  isLooselyEqual(otherVersion) {
    return this.major === otherVersion.major &&
           this.minor === otherVersion.minor &&
           this.patch === otherVersion.patch;
  }

  /**
   * Compares this version to another version according to semver equality
   * rules. In semver, two versions are considered equal if they have the same
   * major, minor, and patch numbers. This method also considers prerelease
   * tags but ignores build metadata. For example, "1.0.0-alpha" and
   * "1.0.0-alpha+build" are considered equal.
   *
   * @param {SemVer} otherVersion - The other SemVer instance to compare with.
   * @returns {boolean} True if versions are considered equal in semver terms.
   */
  isSemverEqual(otherVersion) {
    return this.major === otherVersion.major &&
           this.minor === otherVersion.minor &&
           this.patch === otherVersion.patch &&
           this.prerelease === otherVersion.prerelease;
  }

  /**
   * Provides a custom tag when the object is converted to a string. This
   * method overrides the default behavior to return the class name instead
   * of the generic "Object" tag.
   *
   * @returns {string} The class name "SemVer".
   */
  get [Symbol.toStringTag]() {
    return this.constructor.name
  }

  /**
   * The primary version number for this SemVer instance. This version of the
   * instance, when bumped, indicates likely breaking changes or at least a
   * semmantic separation from previous major revisions
   *
   * @type {number}
   */
  major = 0

  /**
   * The minor version number for this SemVer instance. This version of the instance,
   * when bumped, usually indicates that new features are present. It is expected,
   * however, that minor bump versions are backwards compatible.
   *
   * @type {number}
   */
  minor = 0

  /**
   * The patch version number for this SemVer instance. This version of the instance,
   * when bumped, usually indicates that some fix has been applied but that there are
   * no new features or breaking changes. These should usually be taken greedily.
   */
  patch = 0

  /**
   * This is prerelease string indicator. Usually this has a value like "alpha" or
   * "beta". A SemVer value with a prerelease indicator might look like "1.0.0-beta"
   * indicating, in this example, that it is a beta release for 1.0.0.
   *
   * @type {string}
   */
  prerelease = ''

  /**
   * The metadata string portion of a SemVer version is a note to the consumer but
   * may not have any real bearing on changes. This is a human readable version. A
   * metadata portion may show up in a SemVer string as "1.0.0-beta+001". In this
   * case maybe providing an iteration value. It can be any string. It is only usually
   * compared in version comparisons, in the strictest compares.
   *
   * @type {string}
   */
  metadata = ''

  /**
   * The `FULL` constant can be passed as a second parameter, inspite of it being
   * the default value, to the `.set()` method on `SemVer` instances. It indicates
   * that the full SemVer string should be parsed and set.
   *
   * @type {string}
   */
  static get FULL() { return "*" }

  /**
   * The `MAJOR` constant can be used as a parameter to `set()`, `increment()`,
   * and `decrement()` methods. It points to the major semver version number.
   *
   * @example semver.increment(SemVer.MAJOR).get()
   *
   * @type {string}
   */
  static get MAJOR() { return "major" }

  /**
   * The `MINOR` constant can be used as a parameter to `set()`, `increment()`,
   * and `decrement()` methods. It points to the minor semver version number.
   *
   * @example semver.increment(SemVer.MINOR).get()
   *
   * @type {string}
   */
  static get MINOR() { return "minor" }

  /**
   * The `PATCH` constant can be used as a parameter to `set()`, `increment()`,
   * and `decrement()` methods. It points to the patch semver version number.
   *
   * @example semver.increment(SemVer.PATCH).get()
   *
   * @type {string}
   */
  static get PATCH() { return "patch" }

  /**
   * The `PRERELEASE` constant can be used as a parameter to `set()` method. It
   * points to the pre-release semver version text.
   *
   * @example semver.set("beta", SemVer.PRERELEASE).get()
   *
   * @type {string}
   */
  static get PRERELEASE() { return "prerelease" }

  /**
   * The `METADATA` constant can be used as a parameter to `set()` method. It
   * points to the metadata semver version text.
   *
   * @example semver.set("bries_release", SemVer.METADATA).get()
   *
   * @type {string}
   */
  static get METADATA() { return "metadata" }

  /**
   * Compares two semver strings for semver equality. This static method allows
   * for a direct comparison without needing to create SemVer instances
   * externally. It is useful for quick comparisons where instantiation of
   * objects is not necessary.
   *
   * @param {string} leftVersion - The first version string to compare.
   * @param {string} rightVersion - The second version string to compare.
   * @returns {boolean} True if the versions are semver equal according to
   * the isSemverEqual method.
   */
  static compare(leftVersion, rightVersion) {
    return new SemVer(leftVersion).isSemverEqual(new SemVer(rightVersion))
  }
}