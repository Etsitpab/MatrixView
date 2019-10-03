import Check from "./Check.object.js";

export default function extractionExtension (MatrixView) {

    /** Extract the data of an array to a new array equiped with the current View.
     *
     * The new array will have the same type as the input array.
     * An output array can be provided instead of creating a new array.
     *
     * See also:
     *  {@link MatrixView#extractFrom}.
     *
     * @param {Array} dataIn
     *  Input data array, to be read using the current View.
     *
     * @param {Array} [dataOut]
     *  Output data array.
     *
     * @return {Array}
     *  Output data of extracted values.
     *
     * @todo create the new array? write example
     */
    MatrixView.prototype.extractTo = function (dataIn, dataOut) {

        // Check arguments
        if (!Check.isArrayLike(dataOut)) {
            throw new Error('MatrixView.extractTo: invalid output data.');
        }
        if (dataOut.length !== this.getInitialLength()) {
            throw new Error('MatrixView.extractTo: Output data length is invalid.');
        }

        // Input iterator
        var iterator = this.getIterator(1);
        var i, ie, it = iterator.iterator, b = iterator.begin, e = iterator.end;
        var y, ye, fy = this.getFirst(0), ly = this.getEnd(0);
        var steps, ny, dy, s;
        var yo;

        if (Check.isArrayLike(dataIn) && dataIn.length === this.getLength()) {

            // Copy an array
            if (dataOut === dataIn) {
                throw new Error('MatrixView.extractTo: cannot perform in-place extraction.');
            }
            if (this.isIndicesIndexed(0)) {
                steps = this.getSteps(0);
                for (i = b(), ie = e(), yo = 0; i !== ie; i = it()) {
                    for (s = 0, y = i + fy, ye = i + ly; y !== ye; yo++, y += steps[++s]) {
                        dataOut[y] = dataIn[yo];
                    }
                }
            } else {
                dy = this.getStep(0);
                for (i = b(), ie = e(), yo = 0; i !== ie; i = it()) {
                    for (y = i + fy, ny = i + ly; y !== ny; y += dy, yo++) {
                        dataOut[y] = dataIn[yo];
                    }
                }
            }

        } else if (dataIn.length === 1 || typeof dataIn  === 'number') {

            // Copy a number
            if (dataIn.length === 1) {
                dataIn = dataIn[0];
            }
            if (this.isIndicesIndexed(0)) {
                steps = this.getSteps(0);
                for (i = b(), ie = e(); i !== ie; i = it()) {
                    for (s = 0, y = i + fy, ye = i + ly; y !== ye; y += steps[++s]) {
                        dataOut[y] = dataIn;
                    }
                }
            } else {
                dy = this.getStep(0);
                for (i = b(), ie = e(); i !== ie; i = it()) {
                    for (y = i + fy, ny = i + ly; y !== ny; y += dy) {
                        dataOut[y] = dataIn;
                    }
                }
            }

        } else {
            throw new Error('MatrixView.extractTo: invalid input length.');
        }

        return dataOut;
    };

    /** Extract data from an array equiped with the current View to a new Array.
     *
     * The new array will have the same type as the input array.
     * An output array can be provided instead of creating a new array.
     *
     * See also:
     *  {@link MatrixView#extractTo}.
     *
     * @example
     *     // Create a View and some data
     *     var v = new MatrixView([3, 3]);
     *     var d = [0, 1, 2, 3, 4, 5, 6, 7, 8];
     *
     *     // Select third column
     *     v.selectDimension(1, [2]);
     *
     *     // Extract the associated data
     *     var out = v.extract(d);   // out is: [6, 7, 8]
     *
     * @param {Array} dataIn
     *  Input data array, to be read using the current View.
     *
     * @param {Array} [dataOut]
     *  Output data array.
     *
     * @return {Array}
     *  Output data of extracted values.
     */
    MatrixView.prototype.extractFrom = function (dataIn, dataOut) {

        // Check input array
        if (!Check.isArrayLike(dataIn)) {
            throw new Error('MatrixView.extractFrom: invalid input data.');
        }
        if (dataIn.length !== this.getInitialLength()) {
            throw new Error('MatrixView.extractFrom: input data dimensions mismatch.');
        }

        // Check output array
        dataOut = dataOut || new dataIn.constructor(this.getLength());
        if (!Check.isArrayLike(dataOut)) {
            throw new Error('MatrixView.extractFrom: invalid output data.');
        }
        if (dataOut.length !== this.getLength()) {
            throw new Error('MatrixView.extractFrom: output data dimensions mismatch.');
        }
        if (dataOut === dataIn) {
            throw new Error('MatrixView.extractFrom: cannot perform on-place extraction.');
        }

        // Input iterator
        var iterator = this.getIterator(1);
        var i, ie, it = iterator.iterator, b = iterator.begin, e = iterator.end;
        var y, ye, fy = this.getFirst(0), ly = this.getEnd(0);
        var yo;

        // Perform copy
        if (this.isIndicesIndexed(0)) {
            var steps = this.getSteps(0), s;
            for (i = b(), ie = e(), yo = 0; i !== ie; i = it()) {
                for (s = 0, y = i + fy, ye = i + ly; y !== ye; yo++, y += steps[++s]) {
                    dataOut[yo] = dataIn[y];
                }
            }
        } else {
            var dy = this.getStep(0);
            for (i = b(), ie = e(), yo = 0; i !== ie; i = it()) {
                for (y = i + fy, ye = i + ly; y !== ye; y += dy, yo++) {
                    dataOut[yo] = dataIn[y];
                }
            }
        }

        return dataOut;
    };

    /** Extract data from an array to a new Array.
     *
     * The new array will have the same type as the input array.
     * An output array can be provided instead of creating a new array.
     *
     * See also:
     *  {@link MatrixView#extract}.
     *
     * @example
     *     // Create input View and data
     *     var dIn = [0, 1, 2, 3, 4, 5, 6, 7, 8];
     *     var vIn = new MatrixView([3, 3]);
     *     // select third column: 6, 7, 8
     *     vIn.selectDimension(1, [2]);
     *
     *     // Create output View and data
     *     var dOut = [0, 1, 2, 3, 4, 5, 6, 7, 8];
     *     var vOut = new MatrixView([3, 3]);
     *     // select first row: 1, 3, 6
     *     vOut.selectDimension(0, [0]);
     *
     *     // Extract Data
     *     var out = vIn.extract(dIn, vOut, dOut);
     *     // out is: [6, 1, 2, 7, 4, 5, 8, 7, 8]
     *
     * @param {Array} inputData
     *  Input data, equipped with the current View.
     *
     * @param {MatrixView} outputView
     *  View for the output array.
     *
     * @param {Array} outputData
     *  Output data, equipped with the `outputView`.
     *
     * @return {Array}
     *  Output data of extracted values.
     *
     * @todo merge with 'extractFrom'; output view/data optionals and in any order
     * @fixme replace !e() by a faster instruction.
     */
    MatrixView.prototype.extract = function (dataIn, viewOut, dataOut) {

        // Check arguments
        if (!Check.isArrayLike(dataIn)) {
            throw new Error('MatrixView.extract: invalid input data.');
        }
        if (!(viewOut instanceof MatrixView)) {
            throw new Error('MatrixView.extract: invalid output view.');
        }
        if (!Check.isArrayLike(dataOut)) {
            throw new Error('MatrixView.extract: invalid output data.');
        }

        // Check dimensions
        if (dataIn.length !== this.getInitialLength()) {
            throw new Error('MatrixView.extract: invalid input data length.');
        }
        if (dataOut.length !== viewOut.getInitialLength()) {
            throw new Error('MatrixView.extract: invalid output data length.');
        }
        if (dataOut === dataIn) {
            throw new Error('MatrixView.extract: cannot perform on-place extraction.');
        }

        // Iterators
        const {iterator: it, begin: b, end: e} = this.getIterator(0);
        const {begin: bo, iterator: ito} = viewOut.getIterator(0);
        let i, io, ei;
        for (i = b(), io = bo(), ei = e(); i !== ei; i = it(), io = ito()) {
            dataOut[io] = dataIn[i];
        }
        return dataOut;
    };
}
