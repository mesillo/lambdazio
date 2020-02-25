//this file contain bugs
/**
 * This file is part of Lambdazio.
 * Copyright (C) 2020  Alberto Mesillo Mesin
 * Lambdazio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 * 
 * Lambdazio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with Foobar.  If not, see <https://www.gnu.org/licenses/>.
 */

"use strict";

const fs = require( "fs" );

class Utils {
	static dirArguments() {
		console.dir(
			arguments,
			{ depth : null }
		);
		console.log( "=======================================================" );
	}

	static timerPromise( millis ) {
		return new Promise( ( resolve, reject ) => {
			setTimeout( resolve, millis );
		} );
	};
	/**
	 * Credit : https://gist.github.com/geedew/cf66b81b0bcdab1f334b#file-node-rm-rf-js
	 * @param {string} path 
	 */
	static deleteFolderRecursive( path ) {
		if( fs.existsSync( path ) ) {
			let fileList = fs.readdirSync( path );
			for( let file of fileList ) {
				let curPath = path + "/" + file;
				if( fs.lstatSync( curPath ).isDirectory() ) { // directory => recurse
					Utils.deleteFolderRecursive( curPath );
				} else { // file => delete
					fs.unlinkSync( curPath );
				}
			}
			fs.rmdirSync( path );
		}
	}
}

module.exports = Utils;