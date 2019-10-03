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

/** @class MatrixView */
export default function testExtension (MatrixView) {
    /** Function used to test iterators and provide examples on how use them.
    *
    * __Also see:__
    * {@link MatrixView#getIterator},
    * {@link MatrixView#getSubIterator}.
    */
    MatrixView.prototype.iteratorTests = function (result) {

        let t11, t12, t13, t21, t22, t23;
        // tic();
        let indices_1_1 = test_1_1();
        // console.log('Method 1.1 check ! Time: ', t11 = toc(), "ms");
        // tic();
        let indices_1_2 = test_1_2();
        // console.log('Method 1.2 check ! Time: ', t12 = toc(), "ms");
        // tic();
        let indices_1_3 = test_1_3();
        // console.log('Method 1.3 check ! Time: ', t13 = toc(), "ms");

        // tic();
        let indices_2_1 = test_2_1();
        // console.log('Method 2.1 check ! Time: ', t21 = toc(), "ms");
        // tic();
        let indices_2_2 = test_2_2();
        // console.log('Method 2.2 check ! Time: ', t22 = toc(), "ms");
        // tic();
        let indices_2_3 = test_2_3();
        // console.log('Method 2.3 check ! Time: ', t23 = toc(), "ms");
        if (result) {
            let i, ei;
            for (i = 0, ei = result.length; i < ei; i++) {
                const ind = result[i];
                if (ind !== indices_1_1[i]) {
                    throw new Error("iteratorTests: Indices are differents, test 1.1.");
                }
                if (ind !== indices_1_2[i]) {
                    throw new Error("iteratorTests: Indices are differents, test 1.2.");
                }
                if (ind !== indices_1_3[i]) {
                    throw new Error("iteratorTests: Indices are differents, test 1.3.");
                }
                if (ind !== indices_2_1[i]) {
                    throw new Error("iteratorTests: Indices are differents, test 2.1.");
                }
                if (ind !== indices_2_2[i]) {
                    throw new Error("iteratorTests: Indices are differents, test 2.2.");
                }
                if (ind !== indices_2_3[i]) {
                    throw new Error("iteratorTests: Indices are differents, test 2.3.");
                }
            }
            console.log("MatrixView.iteratorTests: Sucess !");
            return this;
        }
        return [t11, t12, t13, t21, t22, t23];
    };

    MatrixView._iteratorTests = function (n = 10) {
        const view = new MatrixView([5, 5]);
        const result = [
             0,  1,  2,  3,  4,
             5,  6,  7,  8,  9,
            10, 11, 12, 13, 14,
            15, 16, 17, 18, 19,
            20, 21, 22, 23, 24
        ];
        view.restore().iteratorTests(result)
            .restore().select([[0, 1, 2, 3, 4]], [[0, 1, 2, 3, 4]]).iteratorTests(result)
            .restore().select([], [[0, 1, 2, 3, 4]]).iteratorTests(result)
            .restore().select([[0, 1, 2, 3, 4]], []).iteratorTests(result);

        result.reverse();
        view.restore().select([-1, -1, 0], [-1, -1, 0]).iteratorTests(result)
            .restore().select([[4, 3, 2, 1, 0]], [[4, 3, 2, 1, 0]]).iteratorTests(result)
            .restore().select([[4, 3, 2, 1, 0]], [-1, -1, 0]).iteratorTests(result)
            .restore().select([-1, -1, 0], [[4, 3, 2, 1, 0]]).iteratorTests(result);
        var i, times = [];
        const u = 10, v = 10, w = 10, x = 10, y = 10, z = 10;
        for (i = 0; i < n; i++) {
            times.push(new MatrixView([u, v, w, x, y, z]).iteratorTests());
        }
        // times = Matrix.fromArray(times);
        // times.mean().display("mean");
        // times.variance().display("variance");
        // times.min().display("min");
        // times.max().display("max");
        return times;
    };
}
