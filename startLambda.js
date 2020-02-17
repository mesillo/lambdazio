#!/usr/bin/env node

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
	functionName : null,
	streamName : null,
	lambdasStorage : __dirname + "/" + configurations.lambdaFs
};

let printHelp = () => {
	console.log(
		"=== Options ===\n",
		"--stream-name <stream_name>     mandatory   - the name of the kinesalite/kinesis stream to use as data source.\n",
		"--function-name <function_name> mandatory   - the name of lambda function to trigger.\n",
		"--help                                      - print this help. :-)"
		// TODO: help for fs options...
	);
	process.exit( 0 );
};

if( process.env.hasOwnProperty( "LAMBDA_STORAGE" ) ) {
	console.info( `Using lambda in ${process.env.LAMBDA_STORAGE}` );
	options.lambdasStorage = process.env.LAMBDA_STORAGE;
}

for( let i = 0  ; i < process.argv.length ; i++ ) {
	switch( process.argv[ i ] ) {
		case "--function-name":
			options.functionName = process.argv[++i];
			break;
		case "--stream-name":
			options.streamName = process.argv[++i];
			break;
		case "--lambda-storage":
			options.lambdasStorage = process.argv[++i];
			break;
		//// HELP ////
		case "--help":
			printHelp();
			break;
	}
}
///// Main Task /////
Lambda.runLambdaProcess( options );
