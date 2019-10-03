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
        var size = this.getSize();
        return (size.length === 2 && size[0] === 1);
    };

    /** Test if the view correponds to a column vector or not.
    *
    * @return{Boolean}.
    * @memberof MatrixView
    */
    MatrixView.prototype.iscolumn = function () {
        var size = this.getSize();
        return (size.length === 2 && size[1] === 1);
    };

    /** Test if the view corresponds to a vector or not.
    *
    * @return{Boolean}
    * @memberof MatrixView
    */
    MatrixView.prototype.isvector = function () {
        var size = this.getSize();
        return (size.length === 2 && (size[1] === 1 || size[0] === 1));
    };

    /** Test if the view corresponds to a matrix or not.
    *
    * @return{Boolean}
    * @memberof MatrixView
    */
    MatrixView.prototype.ismatrix = function () {
        return this.getSize().length === 2;
    };
}
