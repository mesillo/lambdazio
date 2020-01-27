#! /usr/bin/env node

//this file contain bugs
/**
 * This file is part of Lambdazio.
 * Copyright (C) yyyy  Alberto Mesillo Mesin
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

const configurations = require( "./etc/config.json" );

const Lambda = require( "./includes/lambda/lambda" );

let options = {
	zipName : null,
	lbdfs : null,
	filename : "index",
	handler : "handler",
	functionName : "zipFn"
};

if( process.env.hasOwnProperty( "LAMBDA_STORAGE" ) ) {
	console.info( `Using lambda in ${process.env.LAMBDA_STORAGE}` );
	options.lbdfs = process.env.LAMBDA_STORAGE;
}

for( let i = 0  ; i < process.argv.length ; i++ ) {
	switch( process.argv[ i ] ) {
		case "--zip-file":
			options.zipName = process.argv[++i];
			break;
		case "--lbd-fs":
			options.lbdfs = process.argv[++i];
			break;
		case "--filename":
			options.filename = process.argv[++i];
			break;
		case "--handler":
			options.handler = process.argv[++i];
			break;
		case "--name":
			options.functionName = process.argv[++i];
			break;
		case "--lambda-storage":
			options.lambdaFs = process.argv[++i];
			break;
	}
}
if( ! options.lbdfs ) {
	options.lbdfs = __dirname + "/" + configurations.lambdaFs;
}
// TODO: checks on zip file...
// TODO: checks on function name...
/// Main Task ///
Lambda.addLambdaDirectory( options );