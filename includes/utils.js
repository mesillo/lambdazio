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
	/**
	 * Print a cow that say the provided message
	 * @param {string} message 
	 */
	static printCow( message ) {
		Utils._printRow( "_", message.length, " _", "_ " );
		console.log( "| "+ message +" |" );
		Utils._printRow( "-", message.length, " -", "- " );
		console.log(
			"       \\   ^__^\n" +
			"        \\  (oo)\_______\n" +
			"           (__)\       )\\/\\\n" +
			"               ||----w |\n" +
			"               ||     ||\n"
		);
	}
	/**
	 * Repeat the repeat params times time. :-P
	 * Prepend prepend and postpend postpend.
	 * @param {string} repeat 
	 * @param {number} times 
	 * @param {string} prepend 
	 * @param {string} postpend 
	 */
	static _printRow( repeat, times, prepend = "", postpend = "" ) {
		let repeated = "";
		for( let i = 0 ; i < times ; i++ ) {
			repeated += repeat;
		}
		console.log( prepend + repeated + postpend );
	}
}

module.exports = Utils;