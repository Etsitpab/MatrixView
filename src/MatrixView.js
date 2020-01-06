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

import MatrixView from "./MatrixView.class.js";
export default MatrixView;
import Check from "./Check.object.js";
export {Check};

import iteratorsExtension from "./MatrixView.iterators.js";
iteratorsExtension(MatrixView);

import extractionExtension from "./MatrixView.extraction.js";
extractionExtension(MatrixView);

import informationExtension from "./MatrixView.informations.js";
informationExtension(MatrixView);

import manipulationExtension from "./MatrixView.manipulation.js";
manipulationExtension(MatrixView);
