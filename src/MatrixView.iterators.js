import Check from "./Check.object.js";

export default function iteratorsExtension (MatrixView) {

    /** @class MatrixView */

    /** Get an iterator over the View.
     *
     * An iterator is a object with following properties:
     *
     *  + `Iterator.begin()`:
     *      initialize the iterator on a given dimension and returns the first index.
     *  + `Iterator.iterator()`:
     *      increment the iterator.
     *  + `Iterator.isEnd()`:
     *      return true iff the iterator reached the end of the View.
     *  + `Iterator.end()`:
     *      return the final value of the iterator, this means "end of View".
     *  + `Iterator.getPosition()`:
     *      return (as an Array) the current position of the iterator over the working dimensions.
     *
     * See also:
     *  {@link MatrixView#getSubIterator}.
     *
     * @param {Number} dim
     *  The iterator works on dimensions `dim` and following.
     *  Dimensions before `dim` are not iterated over.
     *
     * @return {Object}
     *
     * @todo redefine the spec; document all members.
     */
    MatrixView.prototype.getIterator = function (dim) {
        // Check parameter
        if (!Check.isSet(dim)) {
            dim = 0;
        } else if (!Check.isInteger(dim, 0)) {
            throw new Error('MatrixView.getIterator: invalid dimension.');
        }

        if (this.isIndicesIndexed(dim)) {
            return new IteratorIndices(this, dim);
        }
        var it = new Iterator(this, dim);
        return it;
    };

    /** Return an iterator over a given dimension of the View.
     *
     * The sub-iterator is a function with following properties:
     *
     *  + `SubIterator.begin(start)`:
     *      initialize the iterator with a starting index, return the first index.
     *  + `SubIterator.iterator()`:
     *      increment the sub-iterator.
     *  + `SubIterator.isEnd()`:
     *      return true iff the sub-iterator reached the end of the dimension.
     *  + `SubIterator.end()`:
     *      return the final value of the iterator, this means "end of Dimension".
     *  + `SubIterator.getPosition()`:
     *      return the current position of the sub-iterator.
     *
     * See also:
     *  {@link MatrixView#getIterator}.
     *
     * @param {Number} dim
     *  Dimension along which to iterate.
     *
     * @return {Function}
     */
    MatrixView.prototype.getSubIterator = function (dim) {
        // Check parameter
        if (!Check.isInteger(dim, 0)) {
            throw new Error('MatrixView.getSubIterator: invalid dimension.');
        }

        if (this.isIndicesIndexed(dim)) {
            return new SubIteratorIndices(this.getIndices(dim), 1);
        }
        var first = this.getFirst(dim);
        var step = this.getStep(dim);
        var end = this.getEnd(dim);
        return new SubIterator(first, step, end);
    };
}

function getSteps (indices, step) {
    var i, l = indices.length;
    var steps = indices.slice();
    for (i = l - 1; i > 0; i--) {
        steps[i] -= steps[i - 1];
        steps[i] *= step;
    }
    steps[0] = 0;
    steps.push(-indices[l - 1] * step - 1);
    return steps;
}

/**
 * @class MatrixView.SubIteratorIndices
 * @private
 */
function SubIteratorIndices (indices, step) {
    var index, stepIndex, stop;
    var first = indices[0], steps = getSteps(indices, step || 1);
    this.iterator = function () {
        return index += steps[++stepIndex];
    };
    this.begin = function (offset) {
        offset = offset || 0;
        stepIndex = 0;
        stop = offset - 1;
        return (index = offset + first);
    };
    this.end = function () {
        return stop;
    };
    this.isEnd = function () {
        return (index === stop);
    };
    this.getPosition = function () {
        return stepIndex;
    };
    this.getIndex = function () {
        return index;
    };
}

/**
 * @class MatrixView.SubIterator
 * @private
 */
function SubIterator (first, step, end) {
    var start, stop, index;
    this.iterator = function () {
        return (index += step);
    };
    this.begin = function (offset = 0) {
        start = offset + first;
        stop = offset + end;
        return (index = start);
    };
    this.end = function () {
        return stop;
    };
    this.isEnd = function () {
        return (index === stop);
    };
    this.getPosition = function () {
        return (index - start) / step | 0;
    };
    this.getIndex = function () {
        return index;
    };
    this.display = function () {
        console.log("start", start, "stop", stop, "index", index);
    };
}

/**
 * @class MatrixView.Iterator
 * @private
 * @constructor Create an iterator for a colon indexed dimension.
 *
 * @param {MatrixView} view
 *  View to iterate on.
 * @param {Integer} dim
 *  First dimension to iterate on.
 */
function Iterator (view, dim) {
    // Subiterators on upper dimensions
    var it, index, dimLength, first, step, end, stop;
    function iterateDim (d) {
        if (d >= dimLength) {
            return -1;
        }
        var i = it[d], val = i.iterator();
        if (i.isEnd()) {
            val = iterateDim(d + 1);
            return (val !== -1) ? i.begin(val) : -1;
        }
        return val;
    }
    this.iterator = function () {
        index += step;
        if (index === stop) {
            var val = iterateDim(dim + 1);
            index = (val === -1) ? - 1 : val + first;
            stop = val + end;
        }
        return index;
    };
    this.begin = function () {
        first = view.getFirst(dim);
        step = view.getStep(dim);
        end = view.getEnd(dim);
        dimLength = view.getDimLength();
        var i, begin;
        it = new Array(dimLength);
        for (i = dimLength - 1; i > dim; i--) {
            it[i] = view.getSubIterator(i);
            begin = it[i].begin(begin || 0);
            // if (it[i].isEnd()) {
            //     index = -1;
            //     return index;
            // }
        }

        for (index = 0, i = dim + 1; i < dimLength; i++) {
            index += view.getFirst(i);
        }
        stop = (index + end);
        index += first;
        return index;
    };
    this.isEnd = function () {
        return index === -1;
    };
    this.end = function () {
        return -1;
    };
    this.getPosition = function () {
        var i, ie, pos = [], start;
        if (it[dim + 1]) {
            start = it[dim + 1].getIndex();
        } else {
            start = 0;
        }
        pos[0] = (index - start - first) / step | 0;
        for (i = dim + 1, ie = it.length; i < ie; i++) {
            pos[i - dim] = it[i].getPosition();
        }
        return pos;
    };
}


/**
 * @class MatrixView.IteratorIndices
 * @private
 * @constructor Create an iterator for a indice indexed dimension.
 *
 * @param {MatrixView} view
 *  View to iterate on.
 * @param {Integer} dim
 *  First dimension to iterate on.
 */
function IteratorIndices (view, dim) {
    // For View indiexed by indices
    var it, index, subIndex, dimLength, first, stop;
    var indices  = view.getIndices(dim);
    var steps    = view.getSteps(dim);
    var iterateDim = function (d) {
        var i = it[d];
        if (!i) {
            return -1;
        }
        var val = i.iterator();
        if (i.isEnd()) {
            val = iterateDim(d + 1);
            return (val !== -1) ? i.begin(val) : -1;
        }
        return val;
    };
    /** Iterate and return the new index. */
    this.iterator = function () {
        subIndex++;
        if (subIndex === stop) {
            var val = iterateDim(dim + 1);
            if (val === -1) {
                return (index = -1);
            }
            index = val + first;
            subIndex = 0;
        }
        index += steps[subIndex];
        return index;
    };
    /** Return the first index. */
    this.begin = function () {
        first = view.getFirst(dim);
        dimLength = view.getDimLength();
        var i, begin;
        it = new Array(dimLength);
        for (i = dimLength - 1; i > dim; i--) {
            it[i] = view.getSubIterator(i);
            begin = it[i].begin(begin || 0);
        }
        for (subIndex = 0, index = 0, i = dim; i < dimLength; i++) {
            index += view.getFirst(i);
        }
        stop = indices.length;
        return index;
    };
    /** Test if the end index is reached. */
    this.isEnd = function () {
        return index === -1;
    };
    /** Return the end index. */
    this.end = function () {
        return -1;
    };
    /** Return the position of the iterator. */
    this.getPosition = function () {
        var i, ie, pos = [];
        pos[0] = subIndex;
        for (i = dim + 1, ie = it.length; i < ie; i++) {
            pos[i - dim] = it[i].getPosition();
        }
        return pos;
    };
}
