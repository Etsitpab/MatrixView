/**
* @class MatrixView.SubIterator
* @private
*/
export class SubIterator {
    constructor(first, step, end, offset = 0) {
        let stop, index, start;
        this.iterator = () => index += step;
        this.begin = (off = offset) => {
            start = off + first;
            stop  = off + end;
            index = start;
            return start;
        };
        this.end = () => stop;
        this.isEnd = () => index === stop;
        this.getPosition = () => (index - start) / step | 0;
        this.getIndex = () => index;
        this[Symbol.iterator] = function* (off = offset) {
            let stop  = off + end, index = off + first, s = step;
            while (index !== stop) {
                yield index;
                index += s;
            }
        };
        this.display = () => console.log("start:", start, "stop:", stop, "index:", index);
    }
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
export class Iterator {
    constructor(view, dim) {
        let first, step, end, dimLength, it, index, stop;
        // Subiterators on upper dimensions
        const iterateDim = d => {
            if (d >= dimLength) {
                return -1;
            }
            let i = it[d], val = i.iterator();
            if (i.isEnd()) {
                val = iterateDim(d + 1);
                return (val !== -1) ? i.begin(val) : -1;
            }
            return val;
        };
        this.iterator = () => {
            index += step;
            if (index === stop) {
                let val = iterateDim(dim + 1);
                index = (val === -1) ? -1 : val + first;
                stop = val + end;
            }
            return index;
        };
        this[Symbol.iterator] = function* () {
            let index = this.begin();
            while (index !== -1) {
                yield index;
                index += step;
                if (index === stop) {
                    let val = iterateDim(dim + 1);
                    index = (val === -1) ? -1 : val + first;
                    stop = val + end;
                }
            }
        };
        this.begin = () => {
            first = view.getFirst(dim);
            step = view.getStep(dim);
            end = view.getEnd(dim);
            dimLength = view.getDimLength();
            it = new Array(dimLength);
            for (let i = dimLength - 1, begin; i > dim; i--) {
                it[i] = view.getSubIterator(i);
                begin = it[i].begin(begin);
            }
            index = 0;
            for (let i = dim + 1; i < dimLength; i++) {
                index += view.getFirst(i);
            }
            stop = (index + end);
            index += first;
            return index;
        };
        this.isEnd = () => index === -1;
        this.end = () => -1;
        this.getPosition = () => {
            let pos = [], start;
            if (it[dim + 1]) {
                start = it[dim + 1].getIndex();
            } else {
                start = 0;
            }
            pos[0] = (index - start - first) / step | 0;
            for (let i = dim + 1, ie = it.length; i < ie; i++) {
                pos[i - dim] = it[i].getPosition();
            }
            return pos;
        };
    }
}

/**
* @class MatrixView.SubIteratorIndices
* @private
*/
export class SubIteratorIndices {
    constructor(indices, step = 1, offset = 0) {
        let index, stepIndex, stop;
        const first = indices[0];
        const steps = SubIteratorIndices.getSteps(indices, step);
        this.iterator = () => index += steps[++stepIndex];
        this.begin = (off = offset) => {
            stepIndex = 0;
            stop = off - 1;
            return (index = off + first);
        };
        this.end = () => stop;
        this.isEnd = () => index === stop;
        this.getPosition = () => stepIndex;
        this.getIndex = () => index;
        this[Symbol.iterator] = function* (off = offset) {
            const stop = off - 1;
            let stepIndex = 0, index = off + first;
            while (index !== stop) {
                yield index;
                index += steps[++stepIndex];
            }
        };
    }

    static getSteps(indices, step) {
        let l = indices.length;
        const steps = indices.slice();
        for (let i = l - 1; i > 0; i--) {
            steps[i] -= steps[i - 1];
            steps[i] *= step;
        }
        steps[0] = 0;
        steps.push(-indices[l - 1] * step - 1);
        return steps;
    }
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
export class IteratorIndices {
    constructor(view, dim) {
        const indices = view.getIndices(dim),
            steps = view.getSteps(dim);

        let index, subIndex, first, stop, dimLength, it;
        // For View indiexed by indices
        const iterateDim = d => {
            const i = it[d];
            if (!i) {
                return -1;
            }
            let val = i.iterator();
            if (i.isEnd()) {
                val = iterateDim(d + 1);
                return (val !== -1) ? i.begin(val) : -1;
            }
            return val;
        };
        /** Iterate and return the new index. */
        this.iterator = () => {
            subIndex++;
            if (subIndex === stop) {
                const val = iterateDim(dim + 1);
                if (val === -1) {
                    return (index = -1);
                }
                index = val + first;
                subIndex = 0;
            }
            index += steps[subIndex];
            return index;
        };
        this[Symbol.iterator] = function* () {
            let index = this.begin();
            while (index !== -1) {
                yield index;
                subIndex++;
                if (subIndex === stop) {
                    const val = iterateDim(dim + 1);
                    if (val === -1) {
                        return;
                    }
                    index = val + first;
                    subIndex = 0;
                }
                index += steps[subIndex];
            }
        };
        /** Return the first index. */
        this.begin = () => {
            first = view.getFirst(dim);
            dimLength = view.getDimLength();
            it = new Array(dimLength);
            for (let i = dimLength - 1, begin; i > dim; i--) {
                it[i] = view.getSubIterator(i);
                begin = it[i].begin(begin || 0);
            }
            subIndex = 0;
            index = 0;
            for (let i = dim; i < dimLength; i++) {
                index += view.getFirst(i);
            }
            stop = indices.length;
            return index;
        };
        /** Test if the end index is reached. */
        this.isEnd = () => index === -1;
        /** Return the end index. */
        this.end = () => -1;
        /** Return the position of the iterator. */
        this.getPosition = () => {
            const pos = [subIndex];
            for (let i = dim + 1, ie = it.length; i < ie; i++) {
                pos[i - dim] = it[i].getPosition();
            }
            return pos;
        };

    }
}
