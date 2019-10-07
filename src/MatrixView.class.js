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

/** A ND-View on any Array.
 *
 * This class provides a multi-dimensional interpretation of any Array.
 *
 * It also defines tools such as iterators to deal with it.
 *
 * @example
 *     // Create a 3D View of size 2x3x4:
 *     var view = new MatrixView([2, 3, 4]);
 *
 * @param {Array | MatrixView} arg
 *  Can be:
 *
 *  + an `Array`: the size the matrix.
 *  + a `MatrixView`: perform a copy of this view.
 *
 * @constructor
 * @todo set most of the getters as protected?
 */
export default class MatrixView {

    constructor(arg) {

        //////////////////////////////////////////////////////////////////
        //                   Initialization Functions                   //
        //////////////////////////////////////////////////////////////////


        let first;          // Start points for each dimension
        let step;           // Step between two values
        let size;           // Number of points
        let indices;        // Selected indices, instead of first/step/size

        const views = [];     // stack of Views
        const initial = {};   // backup of the original View

        // Initialization from size
        this._setFromSize = sizeIn => {
            size = Check.checkSize(sizeIn);
            indices = [];

            // Create view
            let i;
            const ie = size.length;
            for (first = [], step = [], i = 0; i < ie; i++) {
                first[i] = 0;
                step[i]  = (size[i - 1] || 1) * (step[i - 1] || 1);
            }

            // Save original view
            initial.first = first.slice();
            initial.step = step.slice();
            initial.size = size.slice();
            initial.indices = [];
            return this;
        };

        // Copy constructor
        this._setFromView = view => {
            first = [];
            step = [];
            size = [];
            indices = [];
            let i;
            const ndims = view.getDimLength();
            for (i = 0; i < ndims; i++) {
                first.push(view.getFirst(i));
                size.push(view.getSize(i));
                if (view.isIndicesIndexed(i)) {
                    indices.push(view.getIndices(i));
                    step.push(undefined);
                } else {
                    step.push(view.getStep(i));
                }
            }
            return this;
        };


        //////////////////////////////////////////////////////////////////
        //                  Stack of Views manipulation                 //
        //////////////////////////////////////////////////////////////////

        /** Save the current MatrixView on the Stack.
         *
         * See also:
         *  {@link MatrixView#restore}.
         *
         * @chainable
         */
        this.save = () => {
            views.push(new MatrixView(this));
            return this;
        };

        /** Restore the previous MatrixView from the Stack.
         *
         * If there is no stacked view, restore the initial view.
         *
         * See also:
         *  {@link MatrixView#save}.
         *
         * @example
         *     // Declare a view
         *     var v = new MatrixView([5]);
         *
         *     // Reverse and save it
         *     v.flipdim(1).save();
         *
         *     // Select some elements
         *     v.selectDimByColon(1, [0, 2, 4]);
         *
         *     // Restore the previous view, and then the initial View
         *     v.restore();
         *     v.restore();
         *
         * @chainable
         */
        this.restore = () => {
            const v = views.pop();
            if (Check.isSet(v)) {
                this._setFromView(v);
            } else {
                first = initial.first.slice();
                step  = initial.step.slice();
                size  = initial.size.slice();
                indices = []; // = initial.indices.slice();
            }
            return this;
        };


        //////////////////////////////////////////////////////////////////
        //                         Basics Getters                       //
        //////////////////////////////////////////////////////////////////

        /** Get the number of dimensions.
         *
         * @example
         *     // Declare a 3D View
         *     var v = new MatrixView([5, 5, 5]);
         *
         *     // Get its number of dimensions
         *     var nDims = v.getDimLength();   // nDims is: 3
         *
         * @return {Number}
         *
         * @todo rename
         */
        this.getDimLength = () => size.length;

        /** Get the number of elements indexed by the View.
         *
         * @example
         *     // Declare a view
         *     var v = new MatrixView([5, 5, 5]);
         *
         *     // Get its length
         *     var n = v.getLength();      // n is: 125
         *
         * @return {Number}
         *
         * @todo length vs. numel
         */
        this.getLength = () => {
            let i, nel;
            const ie = this.getDimLength();
            for (i = 0, nel = 1; i < ie; i++) {
                nel *= size[i];
            }
            return nel;
        };

        /** Get the size of the View.
         *
         * Get the number of elements along a given dimension or along all dimensions.
         *
         * @example
         *     // Create a View
         *     var v = new MatrixView([2, 3, 4]);
         *
         *     // Get its size
         *     var size = v.getSize();     // size is: [2, 3, 4]
         *
         *     // Get size along dimension 1
         *     var size = v.getSize(1);    // size is: 3
         *
         * @param {Number} [dim]
         *  If specified, get the size along this dimension.
         *
         * @return {Array | Number}
         *
         *  + If `dimension` is given: number of elements along the specified dimension.
         *  + If no `dimension`: array containng the number of element along each dimension.
         */
        this.getSize = d => {
            if (!Check.isSet(d)) {
                return size.slice();
            }
            if (!Check.isInteger(d, 0)) {
                throw new Error('MatrixView.getSize: invalid dimension.');
            }
            return Check.isSet(size[d]) ? size[d] : 1;
        };

        /** Test whether the view is indexed by indices.
         *
         * See also:
         *  {@link MatrixView#selectDimByIndices},
         *  {@link MatrixView#selectDimByColon}.
         *
         * @example
         *     // Create a View, shuffle indices along the first dimension
         *     var v = new MatrixView([3, 4]);
         *     v.selectDimByIndices(0, [0, 2, 1]);
         *
         *     // Check which dimension is indexed by indices
         *     var test = v.isIndicesIndexed(0);    // test is: true
         *     test = v.isIndicesIndexed(1);        // test is: false
         *
         * @param {Number} dim
         *  Dimension to be tested.
         * @return {Boolean}
         *  True iff the given dimension is indexed by indices.
         */
        this.isIndicesIndexed = d => {
            if (!Check.isInteger(d, 0)) {
                throw new Error('MatrixView.isIndicesIndexed: invalid dimension.');
            }
            return Check.isSet(indices[d]);
        };

        /** If indexed by indices: get the selected indices.
         *
         * See also:
         *  {@link MatrixView#isIndicesIndexed},
         *  {@link MatrixView#getSteps}.
         *
         * @example
         *     // Create a View and select indices along 2nd dim.
         *     var v = new MatrixView([2, 3]);
         *     v.selectDimByIndices(1, [0, 2, 1]);
         *
         *     // Retrieve the indices along dimension 1
         *     var indices = v.getIndices(1);       // indices is: [0, 4, 2]
         *
         * @param {Number} dim
         *  Dimension along which to get the indice.
         * @return {Array}
         *  Array containing the selected indices of the View along the given dimension.
         *
         * @todo check the example [0, 4, 2]
         */
        this.getIndices = d => {
            if (!Check.isInteger(d, 0)) {
                throw new Error('MatrixView.getIndices: invalid dimension.');
            }
            if (!this.isIndicesIndexed(d)) {
                throw new Error('MatrixView.getIndices: ' +
                                'dimension isn\'t indexed by indices.');
            }
            return indices[d].slice();
        };

        /** If indexed by indices: get the steps to be used to explore the array.
         *
         * See also:
         *  {@link MatrixView#this.isIndicesIndexed},
         *  {@link MatrixView#getIndices}.
         *
         * @example
         *     // Create a View and select indices along 2nd dim.
         *     var v = new MatrixView([2, 3]);
         *     v.selectDimByIndices(1, [0, 2, 1]);
         *
         *     // Retrieve the steps along dimension 1
         *     var steps = v.getSteps(1);      // steps is: [0, 4, -2, -Infinity]
         *
         * @param {Number} dim
         *  Dimension along which to compute the step.
         *
         * @return {Array}
         *  Array containing the list of steps along the specified dimension.
         *  Last element is -Infinity to easily detect the end.
         *
         * @todo check the example; return NaN as last?
         */
        this.getSteps = d => {
            if (!Check.isInteger(d, 0)) {
                throw new Error('MatrixView.getSteps: invalid dimension.');
            }
            if (!this.isIndicesIndexed(d)) {
                throw new Error('MatrixView.getSteps: ' +
                                'Dimension isn\'t indexed with indices.');
            }
            const steps = indices[d].slice();
            let i;
            for (i = steps.length - 1; i > 0; i--) {
                steps[i] -= steps[i - 1];
            }
            // steps.push(-Infinity);
            const last = indices[d][indices[d].length - 1];
            steps.push(-(last + 1));
            steps[0] = 0;
            return steps;
        };

        /** Number of elements in the original View (i.e. when it was created).
         *
         * See also:
         *  {@link MatrixView#getInitialSize}.
         *
         * @example
         *     // Create a View
         *     var v = new MatrixView([3, 3]);
         *
         *     // Number of elements
         *     var nel = v.getLength();    // nel is: 9
         *
         *     // Select some elements along dimension 1
         *     v.selectDimByIndices(1, [0, 2]);
         *
         *     // Number of elements
         *     nel = v.getLength();        // nel is: 6
         *     nel = v.getInitialLength(); // nel is: 9
         *
         * @return {Number}
         *
         * @todo rename?
         */
        this.getInitialLength = () => {
            let i, nel;
            const ie = initial.size.length;
            for (i = 0, nel = 1; i < ie; i++) {
                nel *= initial.size[i];
            }
            return nel;
        };

        /** Size of the original View (i.e. when it was created).
         *
         * See also:
         *  {@link MatrixView#getInitialLength}.
         *
         * @example
         *     // Create a View
         *     var v = new MatrixView([3, 3]);
         *
         *     // Select some elements along dimension 1
         *     v.selectDimByIndices(1, [0, 2]);
         *
         *     // Size
         *     var size = v.getSize();     // size is: [3, 2]
         *     size = v.getInitialSize();  // size is: [3, 3]
         *
         * @return {Array}
         *
         */
        this.getInitialSize = () => initial.size.slice();

        /** Convert a ND-indice into a linear indice.
         *
         * @example
         *     // Create a View
         *     var v = new MatrixView([3, 2]);
         *
         *     // Linear index of (1,1)
         *     var index = v.getIndex([1, 1]);     // index is: 4
         *
         * @param {Array} coordinates
         *  A ND-indice, e.g. (x,y) in a 2D Matrix.
         *
         * @return {Number}
         *  Linear indice k associated to (x,y).
         *
         * @todo useful for a View (we don't know the size)? What if indices-indexed?
         */
        this.getIndex = coordinates => {
            const ndims = this.getDimLength();
            const l = coordinates.length;
            if (l > 1 && l !== ndims) {
                throw new Error('MatrixView.getIndex: invalid ND-index.');
            }
            let i, indice;
            for (i = 0, indice = 0; i < l; i++) {
                if (coordinates[i] < 0 || coordinates[i] >= size[i]) {
                    throw new Error('MatrixView.getIndex: invalid index.');
                }
                indice += first[i] + coordinates[i] * step[i];
            }
            return indice;
        };

        /** Indice of the first selected element on a given dimension.
         *
         * See also:
         *  {@link MatrixView#getStep},
         *  {@link MatrixView#getEnd},
         *  {@link MatrixView#getSize}.
         *
         * @example
         *     // Create a View and select a part of it
         *     var v = new MatrixView([5, 2]);
         *     v.select([2, 3]);
         *
         *     // Get first values
         *     var first = v.getFirst(0);  // first is: 2
         *     first = v.getFirst(1);      // first is: 0
         *
         * @param {Number} dim
         *  Dimension along which to get the indice.
         *
         * @return {Number}
         *  Indice of the first selected element.
         *
         * @todo what if indices-indexed?
         */
        this.getFirst = d => {
            if (!Check.isInteger(d, 0)) {
                throw new Error('MatrixView.getFirst: invalid dimension.');
            }
            return Check.isSet(first[d]) ? first[d] : 0;
        };

        /** Downsampling step along a given dimension.
         *
         * See also:
         *  {@link MatrixView#getFirst},
         *  {@link MatrixView#getEnd},
         *  {@link MatrixView#getSize}.
         *
         * @example
         *     // Create view
         *     var v = new MatrixView([5, 2]);
         *
         *     // Select a sub part
         *     v.select([2, 3]);
         *
         *     // Get step values
         *     var step = v.getStep(0); // Return 1
         *     step = v.getStep(1);     // Return 5
         *
         * @param {Number} dim
         *  Dimension along with to get the step.
         *
         * @return {Number}
         *  Indices step between 2 values.
         *
         */
        this.getStep = d => {
            if (!Check.isInteger(d, 0)) {
                throw new Error('MatrixView.getStep: invalid dimension.');
            }
            if (this.isIndicesIndexed(d)) {
                throw new Error('MatrixView.getStep: dimension is indexed by indices.');
            }
            return Check.isSet(step[d]) ? step[d] : 1;
        };

        /** Indice+1 of the last selected element on a given dimension.
         *
         * See also:
         *  {@link MatrixView#getFirst},
         *  {@link MatrixView#getStep},
         *  {@link MatrixView#getSize}.
         *
         * @example
         *     // Create a View and select a part of it
         *     var v = new MatrixView([5, 2]);
         *     v.select([[4, 2, 0]]);
         *
         *     // Get end values
         *     var end = v.getEnd(0);  // end is: -Infinity
         *     end = v.getEnd(1);      // end is: 10
         *
         * @param {Number} dim
         *  Dimension along which to get the indice.
         *
         * @return {Number}
         *  Indice+1 of the last selected element.
         *
         * @todo indice-indexed case (now return -Inf)?
         */
        this.getEnd = d => {
            if (!Check.isInteger(d, 0)) {
                throw new Error('MatrixView.getEnd: invalid dimension.');
            }
            if (this.isIndicesIndexed(d)) {
                return -1;
            }
            const s = Check.isSet(size[d]) ? size[d] : 1;
            return (first[d] || 0) + s * (step[d] || 1);
        };


        //////////////////////////////////////////////////////////////////
        //                      Basics manipulations                    //
        //////////////////////////////////////////////////////////////////

        /** Add a singleton dimensions at the end.
         *
         * @param {Number} n
         *  Number of singleton dimension to be added.
         *
         * @chainable
         * @private
         *
         * @todo Other name (in matrix)? Not private? Remove?
         */
        this._pushSingletonDimensions = n => {
            if (!Check.isInteger(n, 0)) {
                throw new Error('MatrixView.pushSingletonDimensions: invalid dimension.');
            }
            let i;
            for (i = 0; i < n; i++) {
                first.push(0);
                step.push(1);
                size.push(1);
            }
            return this;
        };

        /** Select slices of the View along a dimension.
         *
         * See also:
         *  {@link MatrixView#selectDimByIndices},
         *  {@link MatrixView#swapDimensions},
         *  {@link MatrixView#shiftDimension}.
         *
         * @example
         *     // Create a View
         *     var v = new MatrixView([6, 4]);
         *
         *     // Along first dim., select one value out of 2, from #1 to #5
         *     v.selectDimByColon(0, [1, 2, 5]);
         *
         *     //  | 0  6 12 18 |
         *     //  | 1  7 13 19 |
         *     //  | 2  8 14 20 |      | 1  7 13 19 |
         *     //  | 3  9 15 21 |  ->  | 3  9 15 21 |
         *     //  | 4 10 16 22 |      | 5 11 17 23 |
         *     //  | 5 11 17 23 |
         *
         * @param {Number} dim
         *  Dimension along which the selection is performed.
         *
         * @param {Array | Number} selection
         *  Can be:
         *
         *  + `[]`: select all.
         *  + `[indice]` or `indice`: select only 1 slice.
         *  + `[start, end]`: select all the slices from `start` to `end` indices.
         *  + `[start, step, end]`: same, but select only 1 slice out of `step`.
         *
         *  Negative values are interpreted as indices from the end of the array:
         *  the last indice is `-1`, then `-2`, etc.
         *
         * @chainable
         */
        this.selectDimByColon = (d, sel) => {
            if (!Check.isInteger(d, 0)) {
                throw new Error('MatrixView.select: invalid dimension.');
            }
            sel = Check.checkColon(sel, this.getSize(d));
            if (!this.isIndicesIndexed(d)) {
                first[d] = this.getFirst(d) + sel[0] * this.getStep(d);
                step[d] = this.getStep(d) * sel[1];
                size[d] = Math.floor(Math.abs((sel[2] - sel[0]) / sel[1])) + 1;
            } else {
                const ind = indices[d], indOut = [];
                const [, ie, s] = sel;
                let i;
                for (i = sel[0]; i <= ie; i += s) {
                    indOut.push(ind[i]);
                }
                first[d] = indOut[0];
                indices[d] = indOut;
                size[d] = indOut.length;
            }
            return this;
        };

        /** Select slices of the View along a dimension, indexing by indices.
         *
         * See also:
         *  {@link MatrixView#selectDimByColon},
         *  {@link MatrixView#swapDimensions},
         *  {@link MatrixView#shiftDimension}.
         *
         * @example
         *     // Create view
         *     var v = new MatrixView([6, 4]);
         *
         *     // Along first dim, select slices of indices 4, 3, and 1
         *     v.selectDimByIndices(0, [4, 3, 1]);
         *
         *     //  | 0  6 12 18 |
         *     //  | 1  7 13 19 |
         *     //  | 2  8 14 20 |      | 4 10 16 22 |
         *     //  | 3  9 15 21 |  ->  | 3  9 15 21 |
         *     //  | 4 10 16 22 |      | 1  7 13 19 |
         *     //  | 5 11 17 23 |
         *
         * @param {Number} dim
         *  Dimension along which the selection is performed.
         *
         * @param {Array | Number} selection
         *  Indices to be selected.
         *
         * @chainable
         */
        this.selectDimByIndices = (d, ind) => {

            if (!Check.isInteger(d, 0)) {
                throw new Error('MatrixView.selectDimByIndices: Dimension ' +
                                'must be a positive integer.');
            }

            if (!Check.isArrayOfIntegers(ind, 0, this.getSize(d) - 1)) {
                throw new Error('MatrixView.selectDimByIndices: Invalid index.');
            }
            ind = Array.prototype.slice.apply(ind);

            const ie = ind.length;
            let i;
            if (!this.isIndicesIndexed(d)) {
                const f = this.getFirst(d), dx = this.getStep(d);
                for (i = 0; i < ie; i++) {
                    ind[i] *= dx;
                    ind[i] += f;
                }
            } else {
                for (i = 0; i < ie; i++) {
                    ind[i] = indices[ind[i]];
                }
            }
            if (ind[0] === undefined) {
                ind[0] = -1;
            }
            first[d]   = ind[0];
            step[d]    = 1;
            size[d]    = ind.length;
            indices[d] = ind;
            return this;
        };

        /** Select slices of the View along a dimension, indexing by booleans.
         *
         * See also:
         *  {@link MatrixView#selectDimByColon},
         *  {@link MatrixView#selectDimByIndices},
         *  {@link MatrixView#swapDimensions},
         *  {@link MatrixView#shiftDimension}.
         *
         * @param {Number} dimension
         *  Dimension along which the selection is performed.
         *
         * @param {Array} selection
         *  Array of boolean of the same size as the dimension `dim`.
         *
         * @chainable
         */
        this.selectDimByBooleans = (d, boolInd) => {
            if (!Check.isInteger(d, 0)) {
                throw new Error('MatrixView.selectDimByBooleans: invalid dimension.');
            }
            if (boolInd.length !== this.getSize(d)) {
                throw new Error('MatrixView.selectDimByBooleans: array dimensions mismatch.');
            }

            const ei = boolInd.length, ind = new Array(boolInd.length);
            let i, o;
            for (i = 0, o = 0; i < ei; i++) {
                if (boolInd[i]) {
                    ind[o] = i;
                    o += 1;
                }
            }
            return this.selectDimByIndices(d, ind.slice(0, o));
        };

        /** Swap (transpose) 2 dimensions.
         *
         * Note that the View is modified: it is an on-place transposition.
         *
         * See also:
         *  {@link MatrixView#shiftDimension}.
         *
         * @param {Number} dimA
         *  First dimension to be swapped.
         *
         * @param {Number} dimB
         *  Second dimension to be swapped.
         *
         * @example
         *     // Create a View and transpose it.
         *     var v = new MatrixView([4, 3]);
         *     v.swapDimensions(0, 1);
         *
         *     //  | 0 4  8 |
         *     //  | 1 5  9 |      | 0  1  2  3 |
         *     //  | 2 6 10 |  ->  | 4  5  6 10 |
         *     //  | 3 7 11 |      | 8  9 10 11 |
         *
         * @todo rename it as a transposition?
         *
         * @chainable
         */
        this.swapDimensions = (dimA, dimB) => {
            const ndims = this.getDimLength();
            if (!Check.isInteger(dimA, 0)) {
                throw new Error('MatrixView.swapDimensions: invalid dimensions.');
            }
            if (!Check.isInteger(dimB, 0)) {
                throw new Error('MatrixView.swapDimensions: invalid dimensions.');
            }

            const n = Math.max(dimA, dimB) + 1 - ndims;
            if (n > 0) {
                this._pushSingletonDimensions(n);
            }
            swap(first, dimA, dimB);
            swap(step, dimA, dimB);
            swap(size, dimA, dimB);
            swap(indices, dimA, dimB);

            return this;
        };

        /** Shift dimensions of the matrix, circularly.
         *
         * See also:
         *  {@link MatrixView#swapDimensions}.
         *
         * @example
         *     // Create view
         *     var v = new MatrixView([1, 1, 3]);
         *
         *     // Tranpose the view
         *     var shift = v.shiftDimension();
         *     var size = v.getSize();      // size is: [3, 1]
         *
         * @param {Number} [n]
         *  Shift size:
         *
         *  + if omitted: first singleton dimensions are removed.
         *  + if positive: shift to the right, last `n` dimensions becomes the first ones.
         *  + if negative: add n singleton dimensions.
         *
         * @todo make it consistent with Matlab & the doc; allow 1D array?
         *
         * @chainable
         */
        this.shiftDimension = n => {
            let i;
            if (!Check.isSet(n)) {
                for (i = 0; size.length > 0 && size[0] === 1; i++) {
                    first.shift();
                    step.shift();
                    size.shift();
                }
                // TODO: allow it?
                if (this.getDimLength() === 1) {
                    first.push(0);
                    step.push(1);
                    size.push(1);
                }
            } else {
                const ndims = this.getDimLength();
                if (!Check.isInteger(n, 1 - ndims, ndims - 1)) {
                    throw new Error('MatrixView.shiftDimension: invalid shift.');
                }
                for (i = 0; i < n; i++) {
                    first.push(first.shift());
                    step.push(step.shift());
                    size.push(size.shift());
                }
                for (i = n; i < 0; i++) {
                    first.unshift(0);
                    step.unshift(1);
                    size.unshift(1);
                }
            }
            return this;
        };


        //////////////////////////////////////////////////////////////////
        //                          Constructor                         //
        //////////////////////////////////////////////////////////////////

        // New view constructor
        if (Check.isArrayLike(arg)) {
            return this._setFromSize(arg);
        }

        // Copy constructor
        if (arg instanceof MatrixView) {
            this._setFromView(arg);
            initial.first = first.slice();
            initial.step = step.slice();
            initial.size = size.slice();
            return this;
        }

        // Otherwise, argument is invalid
        throw new Error('MatrixView: invalid argument.');
    }

}

const swap = (tab, i, j) => {
    const tmp = tab[i];
    tab[i] = tab[j];
    tab[j] = tmp;
};
