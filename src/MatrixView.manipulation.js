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
import Check from "./Check.object.js";

/**
* @class MatrixView
* @namespace MatrixView
*/
export default function manipulationExtension (MatrixView) {

    /** Allow to select an subpart of the MatrixView on each dimension.
    *
    * __Also see:__
    * {@link MatrixView#selectDimByIndices},
    * {@link MatrixView#selectDimByBooleans},
    * {@link MatrixView#selectDimByColon}.
    *
    * @example
    *     // Create view
    *     var v = new MatrixView([3, 3]);
    *     var d = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    *     // Select first column
    *
    *     v.select([], [0]);
    *     var row = v.extract(d); // row = [0, 1, 2]
    *     // Reset view in its original form
    *     v.restore();
    *
    *     // Select first column
    *     v.select(0);
    *     var col = v.extract(d); // col = [0, 3, 6]
    *     v.restore();
    *
    *     // Reverse the order of columns
    *     v.select([], [-1, 0]);
    *     var mat = v.extract(d); // mat = [6, 7, 8, 3, 4, 5, 0, 1, 2]
    *     v.restore();
    *
    * @param {Array|Integer|Integer[]|Integer[][]|Boolean[]} select
    *  For each dimension, can be an array-like
    *  formated as:
    *
    *  + `[]`: select all the values along the dimension,
    *  + `startValue`: select one value along the dimension,
    *  + `[start, end]`: select all values between start and end values,
    *  + `[start, step, end]`: select all values from start to end with a step,
    *  + `[[indices list]]`: an indice list,
    *  + `[[boolean array]]`: a boolean array.
    *
    * @memberof MatrixView
    * @method select
    * @chainable
    */
    MatrixView.prototype.select = function (...args) {
        let dim;
        for (dim = 0; dim < args.length; dim++) {
            const arg = args[dim];
            // Arg is an array
            if (Check.isArrayLike(arg)) {

                if (Check.isArrayLike(arg[0])) {
                    // Arg is an array containing an array [[<ind>]]
                    this.selectDimByIndices(dim, arg[0]);
                } else if (Check.isArrayOfBooleans(arg) && arg.length === this.getSize(dim)) {
                    // Arg is a boolean array [<boolean>]
                    this.selectDimByBooleans(dim, arg);
                } else if (arg.length !== 0) {
                    // Arg is a colon operator but not [<start, step, end>]
                    this.selectDimByColon(dim, arg);
                } else if (!Check.isArrayLike(arg) && arg.length !== 0) {
                    // If not an empty selector: []
                    throw new Error(`MatrixView.select: Invalid selector ${arg}.`);
                }

                // Arg is just an integer <integer>
            } else if (Check.isInteger(arg)) {
                this.selectDimByColon(dim, arg);
                // Otherwise
            } else {
                throw new Error("MatrixView.select: Invalid selection.");
            }
        }
        return this;
    };

    /** Defines how iterator will scan the view
    *
    * __Also see:__
    * {@link MatrixView#ipermute}.
    *
    * @example
    *     // Create view
    *     var v = new MatrixView([2, 2, 2]);
    *     var d = [0, 1, 2, 3, 4, 5, 6, 7];
    *
    *     // Reverse the order of columns
    *     v.permute([2, 1, 0]);
    *     var mat = v.extract(d); // mat = [0, 4, 2, 6, 1, 5, 3, 7]
    *
    * @param {Integer[]} dimensionOrder Defines the order in which
    * the dimensions are traversed.
    *
    * @memberof MatrixView
    * @method permute
    * @chainable
    */
    MatrixView.prototype.permute = function (dim) {
        const errMsg = this.constructor.name + '.permute: ';
        if (dim.length < this.getDimLength()) {
            throw new Error(errMsg + 'Dimension permutation is invalid.');
        }

        dim = dim.slice();
        const ndims = dim.length;
        let i, j;
        for (i = 0; i < ndims; i++) {
            let t = false;
            for (j = 0; j < ndims; j++) {
                if (dim[j] === i) {
                    t = true;
                }
            }
            if (t === false) {
                throw new Error(errMsg + 'Dimension permutation is invalid.');
            }
        }

        // Reorder the view
        for (i = 0; i < ndims; i++) {
            j = i;
            while (true) {
                const k = dim[j];
                dim[j] = j;
                if (k === i) {
                    break;
                } else {
                    this.swapDimensions(j, k);
                }
                j = k;
            }
        }
        return this;
    };

    /** Inverse dimension permutation.
    *
    * __Also see:__
    * {@link MatrixView#permute}.
    *
    * @example
    *     // Create view
    *     var v = new MatrixView([2, 2, 2]);
    *     var d = [0, 1, 2, 3, 4, 5, 6, 7];
    *
    *     // Reverse the order of columns
    *     v.permute([2, 1, 0]);
    *     v.ipermute([2, 1, 0]);
    *     var mat = v.extract(d); // mat =  [0, 1, 2, 3, 4, 5, 6, 7]
    *
    * @param {Integer[]} dim List of dimension on which perform inverse permutation.
    *
    * @memberof MatrixView
    * @method ipermute
    * @chainable
    */
    MatrixView.prototype.ipermute = function (dim) {
        // Create a dim indices Array
        let i;
        const ie = dim.length, indices = [];
        for (i = 0; i < ie; i++) {
            indices[i] = i;
        }

        // Get dim sorted indices.
        const f = function (a, b) {
            return dim[a] - dim[b];
        };
        indices.sort(f);
        return this.permute(indices);
    };

    /** Rotates MatrixView counterclockwise by a multiple of 90 degrees.
    *
    * @example
    *     // Create view
    *     var v = new MatrixView([2, 2]);
    *     var d = [0, 1, 2, 3];
    *
    *     // Rotate matrix
    *     var mat = v.rot90().extract(d); // mat = [2, 0, 3, 1]
    *
    * @param {Integer} [k=1] Defines the number of 90 degrees rotation.
    *
    * @memberof MatrixView
    * @method rot90
    * @chainable
    */
    MatrixView.prototype.rot90 = function (k = 1) {
        const errMsg = `${this.constructor.name}.rot90`;
        if (!Check.isInteger(k)) {
            throw new Error(`${errMsg}: Argument must be an integer.`);
        }
        k %= 4;
        if (k < 0) {
            k += 4;
        }

        // Rotate
        switch (k) {
            case 0:
            return this;
            case 1:
            return this.swapDimensions(0, 1).flipud();
            case 2:
            return this.flipud().fliplr();
            case 3:
            return this.swapDimensions(0, 1).fliplr();
        }
    };

    /** Flip matrix dimension.
    *
    * __Also See:__ {@link MatrixView#flipud}, {@link MatrixView#fliplr}.
    *
    * @param {Integer} d Dimension to reverse.
    *
    * @memberof MatrixView
    * @method flipdim
    * @chainable
    */
    MatrixView.prototype.flipdim = function (d) {
        return this.selectDimByColon(d, [-1, 0]);
    };

    /** Flip matrix left to right.
    *
    * __Also See:__ {@link MatrixView#flipdim}, {@link MatrixView#flipud}.
    *
    * @memberof MatrixView
    * @method fliplr
    * @chainable
    */
    MatrixView.prototype.fliplr = function () {
        return this.select([0, -1], [-1, 0]);
    };

    /** Flip matrix up to down.
    *
    * __Also See:__ {@link MatrixView#flipdim}, {@link MatrixView#fliplr}.
    *
    * @memberof MatrixView
    * @method flipud
    * @chainable
    */
    MatrixView.prototype.flipud = function () {
        return this.select([-1, 0], [0, -1]);
    };

    /** Circular shift on given dimensions of the view.
    *
    * __Also see:__
    * {@link MatrixView#permute}.
    *
    * @example
    *     // Create view
    *     var v = new MatrixView([5, 5]);
    *     var d = [
    *        0,  1,  2,  3,  4,
    *        5,  6,  7,  8,  9,
    *       10, 11, 12, 13, 14,
    *       15, 16, 17, 18, 19,
    *       20, 21, 22, 23, 24
    *     ];
    *     var out = new Array(25);
    *     // Circular permutation of two indices
    *     v.circshift([2, -2]);
    *     var mat = v.extract(d, out);
    *
    * @param {Integer[]} shift Defines the shift on each dimension.
    *
    * @param {Integer[]}  [dimension] To be specified if shift argument
    *  is a scalar. Corresponds to which dimension must be shifted.
    *
    * @memberof MatrixView
    * @method circshift
    * @chainable
    */
    {
        const selectDim = function (v, k, dim) {
            const size = v.getSize(dim), sel = new Array(size);
            k %= size;
            const start = k > 0 ? size - k : -k;
            const end = k > 0 ? k : size + k;
            let i, j;
            for (i = start, j = 0; j < end; i++, j++) {
                sel[j] = i;
            }
            for (i = 0, j = end; j < size; i++, j++) {
                sel[j] = i;
            }
            v.selectDimByIndices(dim, sel);
        };

        MatrixView.prototype.circshift = function (K, dim) {
            const errMsg = "MatrixView.circshift: Invalid arguments.";
            if (Check.isArrayLike(K) && !Check.isSet(dim)) {
                if (K.length > this.getDimLength()) {
                    throw new Error(errMsg);
                }
                let k;
                const ke = K.length;
                for (k = 0; k < ke; k++) {
                    selectDim(this, K[k], k);
                }
                return this;
            }
            if (Check.isInteger(K) && Check.isInteger(dim, 0)) {
                selectDim(this, K, dim);
                return this;
            }
            throw new Error(errMsg);
        };
    }
}
