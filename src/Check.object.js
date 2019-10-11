/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @author Baptiste Mazin     <baptiste.mazin@telecom-paristech.fr>
 * @author Guillaume Tartavel <guillaume.tartavel@telecom-paristech.fr>
 */

/** Miscellaneous tools for argument checking.
 *
 * Several kind of functions are proposed:
 *
 *  + boolean functions, `Check.is*`: return a boolean value.
 *  + validation functions, `Check.check*`: return the input value,
 *    possibly changed; error are thrown.
 *
 * @singleton
 */

const Check = {};
export default Check;

//////////////////////////////////////////////////////////////////
//                  Boolean Functions                           //
//////////////////////////////////////////////////////////////////


// Scalar

/** Test whether an argument is set.
 *
 * @param {Object} [obj]
 *
 * @return {Boolean}
 *  True iff the argument is neither `null` nor `undefined`.
 */
Check.isSet = function (obj) {
    return (obj !== null && obj !== undefined);
};

/** Test whether a variable is a number, and if it belongs to an interval.
 *
 * __See also:__
 *  {@link Check#isInRange},
 *  {@link Check#isInteger},
 *  {@link Check#isBoolean}.
 *
 * @param {Object} obj
 *
 * @param {Number} [min = -Infinity]
 *
 * @param {Number} [max = +Infinity]
 *
 * @return {Boolean}
 *  True iff `obj` is a number between `min` and `max`.
 */
Check.isNumber = function (obj, min = -Infinity, max = Infinity) {
    return (typeof obj === "number") && min <= obj && obj <= max;
};

/** Test whether a variable is an integer.
 *
 * @param{Object} obj
 *
 * @param {Number} [min = -Infinity]
 *
 * @param {Number} [max = +Infinity]
 *
 * @return{Boolean}
 *  True iff the argument is an integer between `min` and `max`.
 */
Check.isInteger = function (obj, min, max) {
    if (min !== undefined && max !== undefined) {
        return this.isNumber(obj, min, max) && Number.isInteger(obj);
    }
    return Number.isInteger(obj);
};

/** Test wether a variable is a boolean.
 *
 * @param{Object} obj
 *
 * @return{Boolean}
 *  True iff the argument is a boolean.
 */
Check.isBoolean = function (obj) {
    return (obj === true || obj === false);
};


// Arrays

/** Test whether an object is like an array (e.g. typed array).
 *
 * See also:
 *  {@link Check#isArrayOfNumbers},
 *  {@link Check#isArrayOfIntegers},
 *  {@link Check#isArrayOfBooleans}.
 *
 * @param {Object} obj
 *
 * @return {Boolean}
 *  True iff the argument is an array, typed array, or similar.
 */
Check.isArrayLike = function (obj) {
    return (obj !== null) && (typeof obj === "object") && (Check.isInteger(obj.length, 0));
};

/** Test whether an object is an array-like made of numbers.
 *
 * Note:
 *  all the elements of the array are tested one by one.
 *
 * __See also:__
 *  {@link Check#isArrayLike}
 *
 * @param {Object} obj
 *
 * @param {Number} [min = -Infinity]
 *
 * @param {Number} [max = +Infinity]
 *
 * @return {Boolean}
 *  True iff the argument is an array-like
 *  and contains only numbers between `min` and `max`.
 */
Check.isArrayOfNumbers = function (obj, min = -Infinity, max = Infinity) {
    if (!this.isArrayLike(obj) || obj.length < 1) {
        return false;
    }
    let i, ie;
    for (i = 0, ie = obj.length; i < ie; i++) {
        const o = obj[i];
        if ((typeof o !== "number") || isNaN(o) || max < o || o < min) {
            return false;
        }
    }
    return true;
};

/** Test whether an object is an array-like made of integers.
 *
 * Note:
 *  all the elements of the array are tested one by one.
 *
 * @param {Object} obj
 *
 * @param {Number} [min = -Infinity]
 *
 * @param {Number} [max = +Infinity]
 *
 * @return {Boolean}
 *  True iff the argument is an array-like
 *  and contains only integers between `min` and `max`.
 * @todo check for typed array.
 */
Check.isArrayOfIntegers = function (obj, min = -Infinity, max = Infinity) {
    if (!this.isArrayLike(obj) || obj.length < 1) {
        return false;
    }
    let i, ie;
    switch (obj.constructor) {
        case Int8Array:
        case Int16Array:
        case Int32Array:
            if (min === -Infinity && max === Infinity) {
                return true;
            }
            for (i = 0, ie = obj.length; i < ie; i++) {
                if (obj[i] < min || obj[i] > max) {
                    return false;
                }
            }
            return true;
        case Uint8ClampedArray:
        case Uint8Array:
        case Uint16Array:
        case Uint32Array:
            if (min <= 0  && max === Infinity) {
                return true;
            }
            if (max !== Infinity) {
                for (i = 0, ie = obj.length; i < ie; i++) {
                    if (obj[i] < min || obj[i] > max) {
                        return false;
                    }
                }
            }
            return true;
        default:
        if (min === -Infinity && max === Infinity) {
            for (i = 0, ie = obj.length; i < ie; i++) {
                if (!Number.isInteger(obj[i])) {
                    return false;
                }
            }
        } else {
            for (i = 0, ie = obj.length; i < ie; i++) {
                const o = obj[i];
                if (!Number.isInteger(o) || o < min || o > max) {
                    return false;
                }
            }
        }
    }
    return true;
};

/** Test whether an object is an array-like made of booleans.
 *
 * Note:
 *  all the elements of the array are tested one by one.
 *
 * @param {Object} obj
 *
 * @return {Boolean}
 *  True iff the argument is an array-like and contains only booleans.
 */
Check.isArrayOfBooleans = function (obj) {
    if (!this.isArrayLike(obj) || obj.length < 1) {
        return false;
    }

    let i, ie;
    for (i = 0, ie = obj.length; i < ie; i++) {
        if (obj[i] !== true && obj[i] !== false) {
            return false;
        }
    }
    return true;
};


//////////////////////////////////////////////////////////////////
//                  Validation Functions                        //
//////////////////////////////////////////////////////////////////


/** Check optional argument objects.
 *
 * Check whether all options are valid.
 * Initialized undefined options with default values.
 *
 *     // List of valid options and default values
 *     def = {'n': 10, 'b': true};
 *
 *     // Check and initialize 2 sets of options
 *     optsA = Check.checkOpts(def, {'n': 5});     // optsA is: {'n': 5, 'b': true}
 *     optsB = Check.checkOpts(def, {'x': 42});    // error: 'x' not defined in def
 *
 * @param {Object} def
 *  Object listing the valid options and their default values.
 *
 * @param {Object} [opts]
 *  A set of options.
 *
 * @return {Object}
 *  The options set, or their default values.
 */
Check.checkOpts = function (def, opts = {}) {
    let name;
    for (name in opts) {
        if (opts[name]) {
            if (def[name] === undefined) {
                throw new Error("checkOpts: unknown option: " + name);
            }
        }
    }
    for (name in def) {
        if (def[name]) {
            if (!this.isSet(opts[name])) {
                opts[name] = def[name];
            }
        }
    }
    return opts;
};

/** Check a size, i.e. an array of non-negative integers.
 *
 *     s = Check.checkSize(5);             // s is: [5, 1]
 *     s = Check.checkSize(5, 'row');      // s is: [1, 5]
 *     s = Check.checkSize(5, 'square');   // s is: [5, 5]
 *     s = Check.checkSize([4, 2]);        // s is: [4, 2]
 *
 * @param {Number | Array} [size = [0, 0]]
 *  A size information.
 *
 * @param {String} [unidim='vector']
 *  Sefault behavior in case of a scalar value,
 *  Can be "vector", "row", "column", or "square".
 *
 * @return {Array}
 *  The size, as an array.
 *
 * @todo allow 1D in 'unidim' case?
 */
Check.checkSize = function (size = [0, 0], unidim = "column") {

    // Format the size
    if (this.isNumber(size)) {
        size = [size];
    }
    if (this.isArrayLike(size) && size.length === 1 && this.isArrayLike(size[0])) {
        size = size[0];
    }

    // Check if array is valid
    if (!this.isArrayLike(size) || size.length < 1) {
        throw new Error("checkSize: Invalid size argument.");
    }
    if (!this.isArrayOfIntegers(size, 0)) {
        throw new Error("checkSize: Size must be a positive integer.");
    }

    // Format the array
    size = Array.prototype.slice.apply(size);
    while (size[size.length - 1] === 1 && size.length > 2) {
        size.pop();
    }

    // Unidimensional case: square matrix or row vector
    if (size.length === 1) {
        switch (unidim) {
            case "square":
                size = [size[0], size[0]];
                break;
            case "row":
                size = [1, size[0]];
                break;
            case "column":
            case "vector":
                size = [size[0], 1];
                break;
            default:
                throw new Error("checkSize: Invalid value for \"unidim\".");
        }
    }

    // Return the right size
    return size;
};

/** Return true if sizes are similar.
 *
 * If the sizes are the same except for trailing 1's, the behavior depends on
 * `Matrix.ignoreTrailingDims`:
 *
 *  + if True, the trailing 1's are dropped.
 *  + if False, size are considered different if numbers of dimensions is different.
 *
 * See also:
 *  {@link Check#checkSize}
 *
 *     s = Check.checkSizeEquals(5, [5, 1]);       // s is: [5, 1]
 *     s = Check.checkSizeEquals(5, [1, 5]);       // error!
 *
 *     s = Check.checkSizeEquals(5, [5, 1, 1]);    // [5, 1] if 'Matrix.ignoreTrailingDims'
 *                                                 // error if not
 *
 * @param{Array | Number} sizeA
 *  Size of a matrix A.
 *
 * @param{Array | Number} sizeB
 *  Size of a matrix B.
 *
 * @return{Array}
 *  Array containing the (equal) size.
 *
 * @todo broadcasting? behavior for last dimensions of 1?
 */
Check.areSizeEquals = function (sizeA, sizeB, ignoreTrailingDims = true) {
    sizeA = this.checkSize(sizeA);
    sizeB = this.checkSize(sizeB);

    let i;
    const ni = Math.min(sizeA.length, sizeB.length),
        nimax = Math.max(sizeA.length, sizeB.length);

    for (i = 0; i < ni; i++) {
        if (sizeA[i] !== sizeB[i]) {
            return false;
        }
    }
    if (ignoreTrailingDims) {
        for (i = ni; i < nimax; i++) {
            if (sizeA[i] !== undefined && sizeA[i] !== 1) {
                return false;
            }
            if (sizeB[i] !== undefined && sizeB[i] !== 1) {
                return false;
            }
        }
    } else {
        return false;
    }
    return (sizeA.length < sizeB.length) ? sizeA : sizeB;
};

/** Check if size are equal. Throw an exeption if not.
 *
 * See also:
 *  {@link Check#areSizeEquals},
 *  {@link Check#checkSize}.
 *
 * @param{Array | Number} sizeA
 *  Size of a matrix A.
 *
 * @param{Array | Number} sizeB
 *  Size of a matrix B.
 *
 * @return{Array}
 *  Array containing the (equal) size.
 *
 * @todo broadcasting? behavior for last dimensions of 1?
 */
Check.checkSizeEquals = function (sizeA, sizeB, ignoreTrailingDims = true) {
    const eq = Check.areSizeEquals(sizeA, sizeB, ignoreTrailingDims);
    if (!eq) {
        // Might be used to give more feedback.
        if (!ignoreTrailingDims) {
            throw new Error(
                "checkSizeEquals: " +
                "dimensions differ by trailing 1's, " +
                "and ignoreTrailingDims is False."
            );
        }
        throw new Error("checkSizeEquals: dimensions must be equals.");
    }
    return eq;
};

/** Check a range argument, i.e. made of indices [min, max].
 *
 * @param {Array | Number} range
 *  Can be:
 *
 *  + an integer: max, using min = 0.
 *  + an array: [max] or [min, max].
 *
 * @return{Array}
 *  The range, as [min, max].
 *
 * @todo allow empty range [] or [a, b] for a > b ?
 */
Check.checkRange = function (range) {
    // Check type
    if (typeof range === "number") {
        range = [range];
    }
    if (!this.isArrayOfIntegers(range)) {
        throw new Error("checkRange: range must be made of integers.");
    }

    // Check content
    if (range.length === 1) {
        range = [0, range[0]];
    }
    if (range.length !== 2) {
        throw new Error("checkRange: range must have 1 or 2 bounds.");
    }
    if (range[0] > range[1]) {
        throw new Error("checkRange: range must be [min, max] in this order.");
    }

    // Return valid range
    return [range[0], range[1]];
};

/** Check arguments of the `colon` operator.
 *
 * @param {Number | Array} colon
 *  Can be :
 *
 *  + `value` or `[value]`: select only this value.
 *  + `[first, last]`: equivalent to all indices from `first` to `last` (step is +1 or -1).
 *  + `[first, step, last]`: equivalent to all indices from `first` to `last` with given step.
 *
 * @param {Number} [length]
 *  If specified, allow negative indices from the end of the array.
 *
 * @return {Array}
 *  Colon arguments, as `[first, step, last]`.
 *
 * @todo rename it 'sequence'? use optional argument for negative indices? allow empty selection?
 */
Check.checkColon = function (c, length = Infinity, start = (length === Infinity ? -Infinity : 0)) {

    // Format as a vector
    if (this.isArrayLike(c) && c.length === 1 && this.isArrayLike(c[0])) {
        c = c[0];
    }
    if (this.isNumber(c)) {
        c = [c];
    }

    // Check format
    if (length > 0 && length < Infinity) {
        if  (!this.isArrayOfIntegers(c)) {
            throw new Error("checkColon: If length is specified, arguments must be integers.");
        }
    } else if (length === Infinity) {
        if  (!this.isArrayOfNumbers(c)) {
            throw new Error("checkColon: Arguments must be numbers.");
        }
    }

    // Get values
    let a, b, s = null;
    switch (c.length) {
        case 0:
            throw new Error("checkColon: colon operator cannot be empty.");
        case 1:
            a = b = c[0];
            break;
        case 2:
            [a, b] = c;
            break;
        case 3:
            [a, s, b] = c;
            break;
        default:
            throw new Error("checkColon: colon operator expected 1, 2, or 3 values.");
    }

    // Negative index
    if (this.isInteger(length, 0)) {
        a = (a >= 0) ? a : a + length;
        b = (b >= 0) ? b : b + length;
        // Check indices
        if (!this.isArrayOfIntegers([a, b], start, length - 1)) {
            throw new Error("checkColon: First or last elements out of bounds.");
        }
    } else if (length !== Infinity) {
        throw new Error("checkColon: If specified, length must be a non-negative integer.");
    }

    // Step
    if (!s) {
        s = (a <= b) ? +1 : -1;
    } else if ((b - a) * s < 0) {
        throw new Error("checkColon: Invalid step argument.");
    }

    // return result
    return [a, s, b];
};

/** Return true if two arrays have the same length and contains the same values.
 *
 * @param {Array} a
 *
 * @param {Array} b
 *
 * @return {Boolean}
 */
Check.areArrayEquals = function (a, b) {
    const l = a.length;
    if (l !== b.length) {
        return false;
    }
    let i;
    for (i = 0; i < l; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
};

/** Check if a datatype argument is valid numeric class
 * i.e. Array, typed Array or Matlab-like class type.
 *
 * - `array`
 * - `float64Array`, `float64`, `double`
 * - `float32Array`, `float32`, `float`, `single`
 * - `int8array`, `int8`
 * - `uint8clampedarray`, `uint8c`
 * - `uint8array`, `uint8`
 * - `int16array`, `int16`
 * - `uint16array`, `uint16`
 * - `int32array`, `int32`
 * - `uint32array`, `uint32`
 * - `bool`, `boolean`, `logical`
 *
 * @param{String|Function} type
 *  Type identifier or constructor.
 *
 * @return{Function}
 *  Constructor of corresponding type.
 */
Check.getTypeConstructor = function (type) {
    // Select type
    if (typeof(type) === "function") {
        type = type.name;
    }
    if (typeof(type) === "string") {
        switch (type.toLowerCase()) {
            case "array":
                return Array;
            case "float64array":
            case "float64":
            case "double":
                return Float64Array;
            case "float32array":
            case "float32":
            case "float":
            case "single":
                return Float32Array;
            case "int8array":
            case "int8":
                return Int8Array;
            case "bool":
            case "boolean":
            case "logical":
            case "uint8clampedarray":
            case "canvaspixelarray":
            case "uint8c":
                return Uint8ClampedArray;
            case "uint8array":
            case "uint8":
                return Uint8Array;
            case "int16array":
            case "int16":
                return Int16Array;
            case "uint16array":
            case "uint16":
                return Uint16Array;
            case "int32array":
            case "int32":
                return Int32Array;
            case "uint32array":
            case "uint32":
                return Uint32Array;
            case "int64":
            case "uint64":
                throw new Error("getTypeConstructor: int64 and uint64 aren't supported.");
            default:
                throw new Error("getTypeConstructor: Type must be a valid numeric class name.");
        }
    }
    throw new Error("getTypeConstructor: Wrong data type argument:" + type);
};
