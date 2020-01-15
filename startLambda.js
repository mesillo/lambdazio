#!/usr/bin/env node
"use strict";

const configurations = require( "./etc/config.json" );

const Lambda = require( "./includes/lambda/lambda" );

let options = {
	functionName : null,
	streamName : null,
	lambdasStorage : __dirname + "/" + configurations.lambdaFs
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
	}
}
///// Main Task /////
Lambda.runLambdaProcess( options );
