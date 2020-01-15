#! /usr/bin/env node
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