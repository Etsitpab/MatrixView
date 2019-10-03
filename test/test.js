/* global describe test expect */
import MatrixView, {Check} from "../src/MatrixView";
import getLogger from "@etsitpab/logger";

const logger = getLogger("MatrixView");

describe("MatrixxView First test section", () => {

    test("MatrixView tests", () => {
        const size = [1, 2, 3, 4];
        const view = new MatrixView(size);
        expect(view.getLength()).toBe(24);
        expect(view.getSize()).toEqual(size);
        expect(view.getSize(3)).toEqual(4);
        expect(view.getSize(5)).toEqual(1);
    });

    test("MatrixView shiftDimension", () => {
        const v = new MatrixView([1, 2, 3, 4, 5, 6]);

        v.shiftDimension();
        expect(v.getSize()).toEqual([2, 3, 4, 5, 6]);
        v.restore();

        v.shiftDimension(2);
        expect(v.getSize()).toEqual([3, 4, 5, 6, 1, 2]);
        v.restore();

        v.shiftDimension(-2);
        expect(v.getSize()).toEqual([1, 1, 1, 2, 3, 4, 5, 6]);
        v.restore();

        const v2 = new MatrixView([1, 1, 1, 1, 5]);
        v2.shiftDimension();
        expect(v2.getSize()).toEqual([5, 1]);

    });

    test("MatrixView swapDimensions", () => {
         const v = new MatrixView([4, 3]);
         v.swapDimensions(0, 1);
         expect(v.getSize()).toEqual([3, 4]);
         v.swapDimensions(0, 3);
         expect(v.getSize()).toEqual([1, 4, 1, 3]);

    });

    test("MatrixView getFirst", () => {
        const v = new MatrixView([5, 2]);
        v.select([2, 3]);
        // Get first values
         expect(v.getFirst(0)).toEqual(2);
         expect(v.getFirst(1)).toEqual(0);
    });

    test("MatrixView getIndex", () => {
        const v = new MatrixView([3, 2]);
        expect(v.getIndex([1, 1])).toEqual(4);
    });

    test("MatrixView getInitialSize", () => {
        const v = new MatrixView([5, 5]);
        v.selectIndicesDimension(0, [1, 3, 4]);
        v.selectDimension(0, [0, 2, -1]);
        v.selectIndicesDimension(1, [2]);
        expect(v.getInitialSize()).toEqual([5, 5]);
    });

    test("MatrixView save / restore", () => {
        const v = new MatrixView([5, 5]);
        v.selectIndicesDimension(0, [1, 3, 4]);
        expect(v.getSize()).toEqual([3, 5]);
        v.save();
        v.selectDimension(0, [0, 2, -1]);
        v.selectIndicesDimension(1, [2]);
        expect(v.getSize()).toEqual([2, 1]);
        v.restore();
        expect(v.getSize()).toEqual([3, 5]);
        v.restore();
        expect(v.getSize()).toEqual([5, 5]);
    });

    test("MatrixView selectDimension", () => {
        const v = new MatrixView([5, 5]);
        const data = [
             0,  1,  2,  3,  4,
             5,  6,  7,  8,  9,
            10, 11, 12, 13, 14,
            15, 16, 17, 18, 19,
            20, 21, 22, 23, 24
        ];
        {
            v.selectIndicesDimension(0, [1, 3, 4]);
            v.selectDimension(0, [0, 2, -1]);
            // v.selectIndicesDimension(1, [1, 2, 3, 4]);
            // v.selectIndicesDimension(1, [1]);
            v.selectIndicesDimension(1, [2]);
            let out = new Array(v.getLength());
            v.extractFrom(data, out);
            expect(out).toEqual([11, 14]);
        }
    });

    test("MatrixView extractFrom", () => {
        const v = new MatrixView([5, 5]);
        const data = [
             0,  1,  2,  3,  4,
             5,  6,  7,  8,  9,
            10, 11, 12, 13, 14,
            15, 16, 17, 18, 19,
            20, 21, 22, 23, 24
        ];
        {
            v.selectIndicesDimension(0, [1, 3, 4]);
            v.selectIndicesDimension(1, [2]);
            let out = new Array(v.getLength());
            v.extractFrom(data, out);
            expect(out).toEqual([11, 13, 14]);
        }
        v.restore();
        {
            v.selectDimension(0, [1, 2, 4]);
            v.selectDimension(1, [3]);
            let out = v.extractFrom(data);
            expect(out).toEqual([16, 18]);
        }
    });

    test("MatrixView extractTo", () => {
        const v = new MatrixView([5, 5]);
        {
            v.selectIndicesDimension(0, [1, 3, 4]);
            v.selectIndicesDimension(1, [2]);
            const out = new Uint8Array(25);
            v.extractTo([1, 2, 3], out);

            expect(out).toEqual(Uint8Array.from([
                  0, 0, 0, 0, 0,
                  0, 0, 0, 0, 0,
                  0, 1, 0, 2, 3,
                  0, 0, 0, 0, 0,
                  0, 0, 0, 0, 0
            ]));
        }
        v.restore();
        {
            v.selectDimension(0, [1, 2, 4]);
            v.selectDimension(1, [3]);
            const out = new Uint8Array(25);
            v.extractTo([4, 4], out);
            expect(out).toEqual(Uint8Array.from([
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 4, 0, 4, 0,
                0, 0, 0, 0, 0
            ]));
        }
        v.restore();
        {
            v.selectDimension(0, [2, 4]);
            v.selectDimension(1, 3);
            const out = new Uint8Array(25);
            v.extractTo(4, out);
            expect(out).toEqual(Uint8Array.from([
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 4, 4, 4,
                0, 0, 0, 0, 0
            ]));
        }
        v.restore();
        {
            v.selectIndicesDimension(0, [2, 4]);
            v.selectIndicesDimension(1, [3, 4]);
            const out = new Uint8Array(25);
            v.extractTo([4], out);
            expect(out).toEqual(Uint8Array.from([
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 4, 0, 4,
                0, 0, 4, 0, 4
            ]));
        }
    });

    test("MatrixView extract", () => {
        const v = new MatrixView([5, 5]);
        const data = Uint8Array.from([
             0,  1,  2,  3,  4,
             5,  6,  7,  8,  9,
            10, 11, 12, 13, 14,
            15, 16, 17, 18, 19,
            20, 21, 22, 23, 24
        ]);
        const vOut = new MatrixView([5, 5]);
        {
            v.selectIndicesDimension(0, [1, 3, 4]);
            v.selectIndicesDimension(1, [2]);
            vOut.selectIndicesDimension(1, [1, 3, 4]);
            vOut.selectIndicesDimension(0, [2]);
            let out = new Uint8Array(vOut.getInitialLength());
            v.extract(data, vOut, out);
            expect(out).toEqual(Uint8Array.from([
                 0,  0,  0,  0,  0,
                 0,  0, 11,  0,  0,
                 0,  0,  0,  0,  0,
                 0,  0, 13,  0,  0,
                 0,  0, 14,  0,  0
            ]));
        }
    });

    test("MatrixView information extension", () => {
        const v = new MatrixView([5, 5, 5]);
        expect(v.ndims()).toBe(3);
        expect(v.ismatrix()).toBe(false);
        expect(v.isrow()).toBe(false);
        expect(v.iscolumn()).toBe(false);
        expect(v.isvector()).toBe(false);
        v.select([], [], 0);
        expect(v.ismatrix()).toBe(true);
        expect(v.isvector()).toBe(false);
        expect(v.isrow()).toBe(false);
        expect(v.iscolumn()).toBe(false);
        v.select([], 0, []);
        expect(v.ismatrix()).toBe(true);
        expect(v.isvector()).toBe(true);
        expect(v.isrow()).toBe(false);
        expect(v.iscolumn()).toBe(true);
        v.select(0, [], []);
        expect(v.ismatrix()).toBe(true);
        expect(v.isvector()).toBe(true);
        expect(v.isrow()).toBe(true);
        expect(v.iscolumn()).toBe(true);
        const v2 = new MatrixView([1, 1, 5]);
        expect(v2.isvector()).toBe(false);
        expect(v2.isrow()).toBe(false);
        expect(v2.iscolumn()).toBe(false);
        const v3 = new MatrixView([1, 5]);
        expect(v3.ismatrix()).toBe(true);
        expect(v3.isvector()).toBe(true);
        expect(v3.isrow()).toBe(true);
        const v4 = new MatrixView([5, 1]);
        expect(v4.iscolumn()).toBe(true);
    });

    test("MatrixView manipulation extension", () => {
        {
            const v = new MatrixView([2, 2, 2]);
            const d = [0, 1, 2, 3, 4, 5, 6, 7];
            v.permute([2, 1, 0]);
            let mat = v.extractFrom(d);
            expect(mat).toEqual([0, 4, 2, 6, 1, 5, 3, 7]);

            v.ipermute([2, 1, 0]);
            mat = v.extractFrom(d);
            expect(mat).toEqual(d);
        }
        {
            const v = new MatrixView([2, 2]);
            const d = [0, 1, 2, 3];
            let mat = v.rot90();
            expect(mat.extractFrom(d)).toEqual([2, 0, 3, 1]);
            mat = v.restore().rot90(2);
            expect(mat.extractFrom(d)).toEqual([3, 2, 1, 0]);
            mat = v.restore().rot90(3);
            expect(mat.extractFrom(d)).toEqual([1, 3, 0, 2]);
            mat = v.restore().rot90(-1);
            expect(mat.extractFrom(d)).toEqual([1, 3, 0, 2]);
            mat = v.restore().rot90(4);
            expect(mat.extractFrom(d)).toEqual(d);
        }
        {
            const v = new MatrixView([4, 4]);
            const d = [
                1, 1, 0, 0,
                1, 1, 0, 0,
                0, 0, 0, 0,
                0, 0, 0, 0
            ];
            v.circshift([2, -2]);
            expect(v.extractFrom(d)).toEqual([
                0, 0, 0, 0,
                0, 0, 0, 0,
                0, 0, 1, 1,
                0, 0, 1, 1
            ]);
            v.restore().circshift(1, 0);
            expect(v.extractFrom(d)).toEqual([
                0, 1, 1, 0,
                0, 1, 1, 0,
                0, 0, 0, 0,
                0, 0, 0, 0
            ]);
            v.restore().circshift(1, 1);
            expect(v.extractFrom(d)).toEqual([
                0, 0, 0, 0,
                1, 1, 0, 0,
                1, 1, 0, 0,
                0, 0, 0, 0
            ]);
            v.restore().circshift([1, 1]);
            expect(v.extractFrom(d)).toEqual([
                0, 0, 0, 0,
                0, 1, 1, 0,
                0, 1, 1, 0,
                0, 0, 0, 0
            ]);
            v.restore().circshift([-1, -1]);
            expect(v.extractFrom(d)).toEqual([
                1, 0, 0, 1,
                0, 0, 0, 0,
                0, 0, 0, 0,
                1, 0, 0, 1
            ]);
        }
        {
            const v = new MatrixView([5, 2]);
            const d = [
                0,  1,  2,  3,  4,
                5,  6,  7,  8,  9
            ];
            v.flipdim(0);
            expect(v.extractFrom(d)).toEqual([
                4, 3, 2, 1, 0,
                9, 8, 7, 6, 5
            ]);
            v.flipdim(1);
            expect(v.extractFrom(d)).toEqual([
                9, 8, 7, 6, 5,
                4, 3, 2, 1, 0
            ]);
        }

    });

    test(`Test iterators`, () => {
        logger.log("Test 1");
        const view = new MatrixView([5, 5]);
        const result = [
             0,  1,  2,  3,  4,
             5,  6,  7,  8,  9,
            10, 11, 12, 13, 14,
            15, 16, 17, 18, 19,
            20, 21, 22, 23, 24
        ];

        iteratorTests(view, result);
        view.restore().select([[0, 1, 2, 3, 4]], [[0, 1, 2, 3, 4]]);
        iteratorTests(view, result);
        view.restore().select([], [[0, 1, 2, 3, 4]]);
        iteratorTests(view, result);
        view.restore().select([[0, 1, 2, 3, 4]], []);
        iteratorTests(view, result);
        view.restore().select([true, true, true, true, true], [true, true, true, true, true]);
        iteratorTests(view, result);
        {
            const {iterator: it, begin: b, end: e, getPosition} = view.getIterator(0);
            const positions = [];
            let i, ie;
            for (i = b(), ie = e(); i !== ie; i = it()) {
                positions.push(getPosition(i));
            }
            expect(positions).toEqual([
                [ 0, 0 ], [ 1, 0 ], [ 2, 0 ], [ 3, 0 ], [ 4, 0 ],
                [ 0, 1 ], [ 1, 1 ], [ 2, 1 ], [ 3, 1 ], [ 4, 1 ],
                [ 0, 2 ], [ 1, 2 ], [ 2, 2 ], [ 3, 2 ], [ 4, 2 ],
                [ 0, 3 ], [ 1, 3 ], [ 2, 3 ], [ 3, 3 ], [ 4, 3 ],
                [ 0, 4 ], [ 1, 4 ], [ 2, 4 ], [ 3, 4 ], [ 4, 4 ]
            ]);
        }

        result.reverse();

        view.restore().select([-1, -1, 0], [-1, -1, 0]);
        iteratorTests(view, result);
        view.restore().select([[4, 3, 2, 1, 0]], [[4, 3, 2, 1, 0]]);
        iteratorTests(view, result);
        view.restore().select([[4, 3, 2, 1, 0]], [-1, -1, 0]);
        iteratorTests(view, result);
        view.restore().select([-1, -1, 0], [[4, 3, 2, 1, 0]]);
        iteratorTests(view, result);
        {
            const {iterator: it, begin: b, end: e, getPosition} = view.getIterator(0);
            const positions = [];
            let i, ie;
            for (i = b(), ie = e(); i !== ie; i = it()) {
                positions.push(getPosition(i));
            }
            expect(positions).toEqual([
                [ 0, 0 ], [ 1, 0 ], [ 2, 0 ], [ 3, 0 ], [ 4, 0 ],
                [ 0, 1 ], [ 1, 1 ], [ 2, 1 ], [ 3, 1 ], [ 4, 1 ],
                [ 0, 2 ], [ 1, 2 ], [ 2, 2 ], [ 3, 2 ], [ 4, 2 ],
                [ 0, 3 ], [ 1, 3 ], [ 2, 3 ], [ 3, 3 ], [ 4, 3 ],
                [ 0, 4 ], [ 1, 4 ], [ 2, 4 ], [ 3, 4 ], [ 4, 4 ]
            ]);
        }
        {
            view.restore().select([[4, 3, 2, 1, 0]], [-1, 0]);
            const {iterator: it, begin: b, end: e, getPosition} = view.getIterator(0);
            const positions = [];
            let i, ie;
            for (i = b(), ie = e(); i !== ie; i = it()) {
                positions.push(getPosition(i));
            }
            expect(positions).toEqual([
                [ 0, 0 ], [ 1, 0 ], [ 2, 0 ], [ 3, 0 ], [ 4, 0 ],
                [ 0, 1 ], [ 1, 1 ], [ 2, 1 ], [ 3, 1 ], [ 4, 1 ],
                [ 0, 2 ], [ 1, 2 ], [ 2, 2 ], [ 3, 2 ], [ 4, 2 ],
                [ 0, 3 ], [ 1, 3 ], [ 2, 3 ], [ 3, 3 ], [ 4, 3 ],
                [ 0, 4 ], [ 1, 4 ], [ 2, 4 ], [ 3, 4 ], [ 4, 4 ]
            ]);
        }

    });

    test("Check object test", () => {
        expect(Check.isNumber(3, 1, 3)).toBe(true);
        expect(Check.isNumber(-3, 1, 3)).toBe(false);
        expect(Check.isNumber(-Math.PI)).toBe(true);
        expect(Check.isNumber(NaN)).toBe(false);
        expect(Check.isNumber(true)).toBe(false);
        expect(Check.isNumber("3")).toBe(false);

        expect(Check.isInteger(3, 1, 3)).toBe(true);
        expect(Check.isInteger(-3, 1, 3)).toBe(false);
        expect(Check.isInteger(Math.PI, 1, 4)).toBe(false);

        expect(Check.isBoolean(true)).toBe(true);
        expect(Check.isBoolean(1)).toBe(false);
        expect(Check.isBoolean("")).toBe(false);

        expect(Check.isArrayLike([])).toBe(true);
        expect(Check.isArrayLike("")).toBe(false);
        expect(Check.isArrayLike({0: 3, 1:2, 2: 3.14, length: 3})).toBe(true);

        expect(Check.isArrayOfNumbers([-1, 3.14, 5])).toBe(true);
        expect(Check.isArrayOfNumbers({0: 3, 1:2, 2: 3.14, length: 3})).toBe(true);
        expect(Check.isArrayOfNumbers([1, true, 2])).toBe(false);
        expect(Check.isArrayOfNumbers([])).toBe(false);
        expect(Check.isArrayOfNumbers([1, "", 2])).toBe(false);
        expect(Check.isArrayOfNumbers([1, NaN, 2])).toBe(false);
        expect(Check.isArrayOfNumbers([1, Infinity, 2])).toBe(true);

        expect(Check.isArrayOfIntegers([1, 2, -3])).toBe(true);
        expect(Check.isArrayOfIntegers([1, 2, -3], 1, 3)).toBe(false);
        expect(Check.isArrayOfIntegers([1, 2.2, -3])).toBe(false);
        expect(Check.isArrayOfIntegers([])).toBe(false);
        expect(Check.isArrayOfIntegers(Uint8Array.from([1, 2, 3]), 1, 3)).toBe(true);
        expect(Check.isArrayOfIntegers(Uint16Array.from([1, 2, 3]))).toBe(true);
        expect(Check.isArrayOfIntegers(Int16Array.from([1, 2, 3]))).toBe(true);
        expect(Check.isArrayOfIntegers(Int16Array.from([-1, 2, 3]), -10, 10)).toBe(true);
        expect(Check.isArrayOfIntegers(Int8Array.from([-1, 2, 3]), 1, 3)).toBe(false);
        expect(Check.isArrayOfIntegers(Uint8ClampedArray.from([1, 2, 4]), 1, 3)).toBe(false);

        expect(Check.isArrayOfBooleans([true, false, false])).toBe(true);
        expect(Check.isArrayOfBooleans([1, 0, true])).toBe(false);
        expect(Check.isArrayOfBooleans([])).toBe(false);

        expect(Check.checkColon([0, 1, 10])).toEqual([0, 1, 10]);
        expect(Check.checkColon([[0, 1, 10]])).toEqual([0, 1, 10]);

        expect(Check.checkColon([0, 1, 10], 11)).toEqual([0, 1, 10]);
        expect(Check.checkColon([0, 1, -2], 11)).toEqual([0, 1, 9]);
        expect(Check.checkColon([-10, 0])).toEqual([-10, 1, 0]);
        expect(Check.checkColon([10, -2, 0])).toEqual([10, -2, 0]);

        expect(Check.checkColon([0, 10])).toEqual([0, 1, 10]);
        expect(Check.checkColon(3)).toEqual([3, 1, 3]);
        expect(Check.checkColon([3])).toEqual([3, 1, 3]);

        expect(Check.checkSize(5)).toEqual([5, 1]);
        expect(Check.checkSize([[5, 1]])).toEqual([5, 1]);
        expect(Check.checkSize(5, 'row')).toEqual([1, 5]);
        expect(Check.checkSize(5, 'square')).toEqual([5, 5]);
        expect(Check.checkSize([4, 2, 1])).toEqual([4, 2]);

        expect(Check.checkSizeEquals([1], [1, 1])).toEqual([1, 1]);
        expect(Check.checkSizeEquals([1, 1], [1, 1, 1])).toEqual([1, 1]);
        // expect(Check.checkSizeEquals([1, 1], [1, 1, 1], false)).toThrow(Error);
        // expect(Check.checkSizeEquals([4, 2], [2, 4])).toThrow(Error);

        expect(Check.areArrayEquals([4, 2], [4, 2])).toBe(true);
        expect(Check.areArrayEquals([4, 2], [4, 2, undefined])).toBe(false);
        expect(Check.areArrayEquals([4, 2], [4, 1])).toBe(false);
        expect(Check.areArrayEquals([4, 2], [4, 2, 1])).toBe(false);

        expect(Check.areSizeEquals([1], [1, 1])).toEqual([1, 1]);
        expect(Check.areSizeEquals([1, 1], [1, 1, 1])).toEqual([1, 1]);
        expect(Check.areSizeEquals([4, 2, 1], [4, 2])).toEqual([4, 2]);
        expect(Check.areSizeEquals([4, 2], [4, 2, 1, 1])).toEqual([4, 2]);
        expect(Check.areSizeEquals([1, 1], [1, 1, 1], false)).toBe(false);
        expect(Check.areSizeEquals([4, 2], [2, 4])).toBe(false);
        expect(Check.areSizeEquals([4, 2], [4, 2, 4, 3])).toBe(false);
        expect(Check.areSizeEquals([4, 2, 2], [4, 2])).toBe(false);

        expect(Check.checkOpts({'n': 10, 'b': true},  {'n': 5})).toEqual({'n': 5, 'b': true});

        expect(Check.checkRange([0, 3])).toEqual([0, 3]);

        expect(Check.getTypeConstructor("bool")).toBe(Uint8ClampedArray);
        expect(Check.getTypeConstructor(Uint8Array)).toBe(Uint8Array);

        // checkColon
        // checkRange
        // checkSize
        // checkSizeEquals
        // getTypeConstructor
        // isSet
    });

});

const iteratorTests = function (view, result) {
    expect(iterator_test_1_1(view)).toEqual(result);
    expect(iterator_test_1_2(view)).toEqual(result);
    expect(iterator_test_1_3(view)).toEqual(result);

    expect(iterator_test_2_1(view)).toEqual(result);
    expect(iterator_test_2_2(view)).toEqual(result);
    expect(iterator_test_2_3(view)).toEqual(result);
};

// 1.1 - Simplest way to scan the view

const iterator_test_1_1 = (view, indices = []) => {
    // Iterator to scan the view
    const {iterator: it, begin: b, end: e} = view.getIterator(0);
    let i, ie;
    for (i = b(), ie = e(); i !== ie; i = it()) {
        indices.push(i);
    }

    return indices;
};

// 1.2 - Simplest way with control on dimension 0

const iterator_test_1_2 = (view, indices = []) => {
    // Iterator to scan the view on dimension greater than 0
    const {iterator: it, begin:  b, end: e } = view.getIterator(1);
    // Iterator to scan the view with control on dimension 0
    const {iterator: iy, begin: by, end: ey} = view.getSubIterator(0);

    let i, ie, y, ye;
    for (i = b(), ie = e(); i !== ie; i = it()) {
        for (y = by(i), ye = ey(); y !== ye; y = iy()) {
            indices.push(y);
        }
    }

    return indices;
};

// 1.3 - Simplest way with control on dimension 0 and 1

const iterator_test_1_3 = (view, indices = []) => {
    // Iterator to scan the view with iterator on dimension 2)
    const {iterator: it, begin: b,  end: e } = view.getIterator(2);
    // Iterators to scan the dimension 1 and 0
    const {iterator: ix, begin: bx, end: ex} = view.getSubIterator(1);
    const {iterator: iy, begin: by, end: ey} = view.getSubIterator(0);

    let i, ie, x, xe, y, ye;
    for (i = b(), ie = e(); i !== ie; i = it()) {
        for (x = bx(i), xe = ex(); x !== xe; x = ix()) {
            for (y = by(x), ye = ey(); y !== ye; y = iy()) {
                indices.push(y);
            }
        }
    }

    return indices;
};

// 2.1 - Same but more efficient way

const iterator_test_2_1 = (view, indices = []) => {
    // Scaning the from the second dimension (dim = 1)
    const {iterator: it, begin: b, end: e} = view.getIterator(1);
    // First x value, end x value
    const f = view.getFirst(0), l = view.getEnd(0);

    let x, xe, i, ie;
    if (view.isIndicesIndexed(0)) {
        // Steps between 2 x values
        let s, steps = view.getSteps(0);
        for (i = b(), ie = e(); i !== ie; i = it()) {
            for (s = 0, x = i + f, xe = i + l; x !== xe; x += steps[++s]) {
                indices.push(x);
            }
        }
    } else {
        // Step between 2 x values
        let n, d = view.getStep(0);
        for (i = b(), ie = e(); i !== ie; i = it()) {
            for (x = i + f, n = i + l; x !== n; x += d) {
                indices.push(x);
            }
        }
    }

    return indices;
};

// 2.2 - With control on the 2 first dimensions

const iterator_test_2_2 = (view, indices = []) => {
    const {iterator: it, begin: b, end: e} = view.getIterator(2);
    // Scaning the from the second dimension (dim = 1)
    // First value, step between 2 values, end value
    const {iterator: ix, begin: bx, end: ex} = view.getSubIterator(1);
    const fy = view.getFirst(0), ly = view.getEnd(0);
    let i, ie, x, xe, y, ye;
    if (view.isIndicesIndexed(0)) {
        let sy;
        const ySteps = view.getSteps(0);
        for (i = b(), ie = e(); i !== ie; i = it()) {
            for (x = bx(i), xe = ex(); x !== xe; x = ix()) {
                for (sy = 0, y = x + fy, ye = x + ly; y !== ye; y += ySteps[++sy]) {
                    indices.push(y);
                }
            }
        }
    } else {
        let ny;
        const dy = view.getStep(0);
        for (i = b(), ie = e(); i !== ie; i = it()) {
            for (x = bx(i), xe = ex(); x !== xe; x = ix()) {
                for (y = x + fy, ny = x + ly; y !== ny; y += dy) {
                    indices.push(y);
                }
            }
        }
    }
    return indices;
};

// 2.3 - The extremist way

const iterator_test_2_3 = (view, indices = []) => {
    // Scaning the from the second dimension (dim = 1)
    const {iterator: it, begin: b, end: e} = view.getIterator(2);
    // First value, step between 2 values, end value
    const fx = view.getFirst(1), lx = view.getEnd(1);
    const fy = view.getFirst(0), ly = view.getEnd(0);

    let i, ie, x, xe, y, ye;
    if (view.isIndicesIndexed(1)) {
        let sx;
        const xSteps = view.getSteps(1);
        if (view.isIndicesIndexed(0)) { // NOT OK
            let sy;
            const ySteps = view.getSteps(0);
            for (i = b(), ie = e(); i !== ie; i = it()) {
                for (sx = 0, x = i + fx, xe = i + lx; x !== xe; x += xSteps[++sx]) {
                    for (sy = 0, y = x + fy, ye = x + ly; y !== ye; y += ySteps[++sy]) {
                        indices.push(y);
                    }
                }
            }
        } else { // NOT OK
            let ny;
            const dy = view.getStep(0);
            for (i = b(), ie = e(); i !== ie; i = it()) {
                for (sx = 0, x = i + fx, xe = i + lx; x !== xe; x += xSteps[++sx]) {
                    for (y = x + fy, ny = x + ly; y !== ny; y += dy) {
                        indices.push(y);
                    }
                }
            }
        }
    } else {
        let nx;
        const dx = view.getStep(1);
        if (view.isIndicesIndexed(0)) { // OK
            let sy;
            const ySteps = view.getSteps(0);
            for (i = b(), ie = e(); i !== ie; i = it()) {
                for (x = i + fx, nx = i + lx; x !== nx; x += dx) {
                    for (sy = 0, y = x + fy, ye = x + ly; y !== ye; y += ySteps[++sy]) {
                        indices.push(y);
                    }
                }
            }
        } else { // OK !
            let ny;
            const dy = view.getStep(0);
            for (i = b(), ie = e(); i !== ie; i = it()) {
                for (x = i + fx, nx = i + lx; x !== nx; x += dx) {
                    for (y = x + fy, ny = x + ly; y !== ny; y += dy) {
                        indices.push(y);
                    }
                }
            }
        }
    }
    return indices;

};
