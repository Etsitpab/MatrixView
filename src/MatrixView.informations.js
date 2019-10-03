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
export default function informationExtension (MatrixView) {
    /** Returns the number of array dimensions.
    * It is a Matlab alias for {@link MatrixView#getDimLength},
    *
    * @return {Number}
    * @memberof MatrixView
    */
    MatrixView.prototype.ndims = function () {
        return this.getDimLength();
    };

    /** Test if a the view corresponds to a row vector or not.
    *
    * @return{Boolean}
    * @memberof MatrixView
    */
    MatrixView.prototype.isrow = function () {
        const size = this.getSize();
        if (size[0] !== 1) {
            return false;
        }
        if (size.length > 2) {
            let i, ie;
            for (i = 2, ie = size.length; i < ie; i++) {
                if (size[i] !== 1) {
                    return false;
                }
            }
        }
        return true;
    };

    /** Test if the view correponds to a column vector or not.
    *
    * @return{Boolean}.
    * @memberof MatrixView
    */
    MatrixView.prototype.iscolumn = function () {
        const size = this.getSize();
        if (size[1] !== 1) {
            return false;
        }
        if (size.length > 2) {
            let i, ie;
            for (i = 2, ie = size.length; i < ie; i++) {
                if (size[i] !== 1) {
                    return false;
                }
            }
        }
        return true;
    };

    /** Test if the view corresponds to a vector or not.
    *
    * @return{Boolean}
    * @memberof MatrixView
    */
    MatrixView.prototype.isvector = function () {
        const size = this.getSize();
        if (size[0] !== 1 && size[1] !== 1) {
            return false;
        }
        if (size.length > 2) {
            let i, ie;
            for (i = 2, ie = size.length; i < ie; i++) {
                if (size[i] !== 1) {
                    return false;
                }
            }
        }
        return true;
    };

    /** Test if the view corresponds to a matrix or not.
    *
    * @return{Boolean}
    * @memberof MatrixView
    */
    MatrixView.prototype.ismatrix = function () {
        const size = this.getSize();
        if (size.length > 2) {
            let i, ie;
            for (i = 2, ie = size.length; i < ie; i++) {
                if (size[i] !== 1) {
                    return false;
                }
            }
        }
        return true;
    };
}
