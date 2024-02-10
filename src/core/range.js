/**
 * Represents a numerical range with a start, end, and step value. The range
 * can be inclusive or exclusive of the end value. It can be iterated over
 * and can check if a value is included within the range. The start, end, and
 * step can be static values or functions that return the respective values.
 * The step value must be non-zero. The range can be used in for...of loops
 * and other iterable contexts.
 *
 * @example
* // Create an inclusive range from 1 to 5 with a step of 1
* const range = new Range(1, 5);
* for (const value of range) {
*   console.log(value); // Logs 1, 2, 3, 4, 5
* }
*
* @example
* // Create an exclusive range from 10 to 20 with a step of 2
* const exclusiveRange = new Range({
*   start: 10, end: 20, step: 2, inclusive: false
* });
* for (const value of exclusiveRange) {
*   console.log(value); // Logs 10, 12, 14, 16, 18
* }
*/
export class Range {
   /**
    * @private
    * The starting value of the range. This can be any type, but if it is a
    * function, the function should return the starting value of the range.
    * When accessed through the getter, if `#start` is a function, it will
    * invoke the function to get the starting value, otherwise it will return
    * the value directly.
    */
   #start;

   /**
    * @private
    * The ending value of the range. Similar to `#start`, this can be any type,
    * and if it is a function, the function should return the ending value of
    * the range. When accessed through the getter, if `#end` is a function, it
    * will invoke the function to get the ending value, otherwise it will
    * return the value directly.
    */
   #end;

   /**
    * @private
    * The step value of the range, determining the increment between each value
    * in the range. This can be any type, but if it is a function, the function
    * should return the step value. When accessed through the getter, if `#step`
    * is a function, it will invoke the function to get the step value,
    * \otherwise it will return the value directly. The step value must be a
    * non-zero number or a function that returns a non-zero number, otherwise
    * an error is thrown.
    */
   #step;

   /**
    * Determines whether the range includes the end value. When set to `true`,
    * the range will include the end value in its set of values. When set to
    * `false`, the end value is not included. This property is `true` by
    * default, meaning ranges are inclusive of the end value unless
    * explicitly set otherwise.
    *
    * @type {boolean}
    */
   inclusive = true;

   /**
    * Creates a new Range instance representing a range of values.
    *
    * The constructor can be called with either an object containing the
    * properties `start`, `end`, `step`, and `inclusive`, or with individual
    * arguments for each property. If `step` is not provided, it defaults to
    * 1. If `inclusive` is not provided, it defaults to true, meaning the
    * range includes the end value.
    *
    * @param {object|number} start - An object containing all properties, or
    * the starting value of the range. If an object is provided, other
    * parameters are ignored.
    * @param {number} [end] - The ending value of the range. Required if `start`
    * is a number.
    * @param {number|function} [step=1] - The step value between each value in
    * the range, or a function that returns the step value. Must be a non-zero
    * number or function returning a non-zero number.
    * @param {boolean} [inclusive=true] - Determines whether the range includes
    * the end value.
    */
   constructor(start, end, step, inclusive = true) {
     if (typeof start === 'object') {
       this.start = start.start;
       this.end = start.end;
       this.step = start.step !== undefined ? start.step : 1;
       this.inclusive = start?.inclusive ?? true;
     } else {
       this.start = start;
       this.end = end;
       this.step = step !== undefined ? step : 1;
       this.inclusive = inclusive ?? true;
     }
   }

   /**
    * Retrieves the starting value of the range. If the starting value is a
    * function, it invokes the function and returns its result. Otherwise, it
    * returns the starting value directly.
    *
    * @returns {number} The starting value of the range or the result of the
    * starting value function.
    */
   get start() {
     return typeof this.#start === 'function' ? this.#start() : this.#start;
   }

   /**
    * Sets the starting value of the range. This value can be a number or a
    * function that returns a number. If a function is provided, it will be
    * invoked to determine the starting value each time the `start` property
    * is accessed.
    *
    * @param {number|function} value - The new starting value or a function
    * that returns the starting value.
    */
   set start(value) {
     this.#start = value;
   }

   /**
    * Retrieves the ending value of the range. If the ending value is a function,
    * it invokes the function and returns its result. Otherwise, it returns the
    * ending value directly.
    *
    * @returns {number} The ending value of the range or the result of the ending
    * value function.
    */
   get end() {
     return typeof this.#end === 'function' ? this.#end() : this.#end;
   }

   /**
    * Sets the ending value of the range. This value can be a number or a
    * function that returns a number. If a function is provided, it will be
    * invoked to determine the ending value each time the `end` property
    * is accessed.
    *
    * @param {number|function} value - The new ending value or a function
    * that returns the ending value.
    */
   set end(value) {
     this.#end = value;
   }

   /**
    * Retrieves the step value of the range. If the step value is a function,
    * it invokes the function and returns its result. Otherwise, it returns the
    * step value directly. This value determines the increment between each
    * number in the range.
    *
    * @returns {number} The step value of the range or the result of the step
    * value function.
    */
   get step() {
     return typeof this.#step === 'function' ? this.#step() : this.#step;
   }

   /**
    * Sets the step value of the range. The step value determines the increment
    * between each number in the range. It can be a non-zero number or a function
    * that returns a non-zero number. If the provided value is zero, not a number,
    * or a function that returns zero or not a number, an error is thrown.
    *
    * @param {number|function} value - The new step value or a function that
    * returns the step value. Must not be zero or return zero.
    * @throws {Error} If the value is zero, not a number, or a function that
    * returns zero or not a number.
    */
   set step(value) {
     if (typeof value === 'function' || (!isNaN(value) && value !== 0)) {
       this.#step = value;
     } else {
       throw new Error(
         'Step must be a non-zero number or a function that returns a non-zero number.'
       );
     }
   }

   /**
    * Retrieves the size of the range, which is the number of steps from the
    * start value to the end value. If the end value is undefined, it returns
    * the number of steps from the start value to zero. The size is always
    * rounded down to the nearest whole number when the end value is defined,
    * and rounded to the nearest whole number in general when the end value
    * is undefined.
    *
    * @returns {number} The size of the range, representing the count of
    * discrete steps within the range.
    */
   get size() {
     const start = this.start;
     const end = this.end;
     const step = this.step;

     if (end !== undefined) {
       return Math.floor((end - start) / step) + 1;
     } else {
       return Math.round(start / step);
     }
   }

   /**
    * Iterates over the range, executing a callback for each value in the range.
    * The iteration order is from the start value to the end value, inclusive or
    * exclusive based on the 'inclusive' property. If 'inclusive' is true, the
    * end value is included in the iteration; otherwise, it is excluded. The
    * iteration step is determined by the 'step' property. If the start value is
    * less than the end value, the iteration is in ascending order; if the start
    * value is greater than the end value, the iteration is in descending order.
    *
    * @param {Function} callback - The function to execute for each value in the
    * range. It receives the current value as an argument.
    */
   each(callback) {
     const start = this.start;
     const end = this.inclusive ? this.end : this.end - (this.step/Math.abs(this.step));
     const step = this.step;

     if (start < end) {
       for (let i = start; i <= end; i += step) {
         callback(i);
       }
     } else if (start > end) {
       for (let i = start; i >= end; i -= Math.abs(step)) {
         callback(i);
       }
     }
   }

   /**
    * Determines whether a given value is included in the range. If the range's
    * end value is not a number (NaN), it checks if the start value is equal to
    * the given value. If the end value is a number, it checks if the given value
    * is between the start and end values, and if the difference between the start
    * value and the given value is an exact multiple of the step value. This
    * method takes into account whether the range is inclusive of the end value.
    *
    * @param {number} val - The value to check for inclusion in the range.
    * @returns {boolean} True if the value is included in the range, false
    * otherwise.
    */
   includes(val) {
     const start = this.start;
     const end = this.inclusive ? this.end : this.end - (this.step / Math.abs(this.step));
     const step = this.step;

     if (isNaN(end)) {
       return start === val;
     } else if (!isNaN(end) && val <= end && val >= start) {
       return (val - start) % step === 0;
     }

     return false;
   }

   /**
    * Creates an iterator that yields each value in the range according to the
    * start, end, and step properties. The iterator can be used in for...of loops
    * and other constructs that consume iterables. If the range is inclusive, the
    * end value is yielded; otherwise, it is not. The iteration respects the
    * direction of the range, ascending or descending, based on the start and end
    * values.
    *
    * @yields {number} The next value in the range.
    */
   *[Symbol.iterator]() {
     const start = this.start;
     const end = this.inclusive ? this.end : this.end - (this.step/Math.abs(this.step));
     const step = this.step;

     if (start < end) {
       for (let value = start; value <= end; value += step) {
         yield value;
       }
     } else {
       for (let value = start; value >= end; value -= Math.abs(step)) {
         yield value;
       }
     }
   }
 }
