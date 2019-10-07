import Check from "./Check.object.js";
import {Iterator, IteratorIndices, SubIterator, SubIteratorIndices} from "./Iterators.class.js";

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
    MatrixView.prototype.getIterator = function (dim = 0) {
        // Check parameter
        if (!Check.isInteger(dim, 0)) {
            throw new Error('MatrixView.getIterator: invalid dimension.');
        }

        if (this.isIndicesIndexed(dim)) {
            return new IteratorIndices(this, dim);
        }
        return new Iterator(this, dim);
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
     * @param {Number} [offset=0]
     *  offset to initialize from a ahigher iterator
     *
     * @return {Function}
     */
    MatrixView.prototype.getSubIterator = function (dim, offset = 0) {
        // Check parameter
        if (!Check.isInteger(dim, 0)) {
            throw new Error('MatrixView.getSubIterator: invalid dimension.');
        }

        if (this.isIndicesIndexed(dim)) {
            return new SubIteratorIndices(this.getIndices(dim), offset);
        }
        const first = this.getFirst(dim);
        const step = this.getStep(dim);
        const end = this.getEnd(dim);
        return new SubIterator(first, step, end, offset);
    };

}
