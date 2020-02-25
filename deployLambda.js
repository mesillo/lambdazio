#! /usr/bin/env node

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

const configurations = require( "./etc/config.json" );

const Lambda = require( "./includes/lambda/lambda" );

let options = {
	zipName : null,
	lbdfs : null,
	filename : "index",
	handler : "handler",
	functionName : "zipFn"
};

let printHelp = () => {
	console.log(
		"=== Options ===\n",
		"--zip-file <filename>    mandatory        - the zip file that contain lambda code.\n",
		"--name <function_name>   mandatory        - the name to assign at the lambda.\n",
		"--filename <js_filename> default index.js - the javascript filename, in the root directory of zip, that contain the handler function.\n",
		"--handler <handler_name> default handler  - the name of the exported function that should be used as lambda handler.\n",
		"--help                                    - print this help. :-)"
		// TODO: help for fs options...
	);
	process.exit( 0 );
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
		case "--lambda-storage":
		case "--lbd-fs":
			options.lbdfs = process.argv[++i]; //TODO: this or lambdaFs *
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
		//case "--lambda-storage":
		//	options.lambdaFs = process.argv[++i]; //TODO: this or lbdfs *
		//	break;
		//// HELP ////
		case "--help":
			printHelp();
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