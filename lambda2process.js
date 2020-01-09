#!/usr/bin/env node

"use strict";

const configurations = require( "./etc/config.json" );
const L2P = require( "./includes/l2p/l2p" );
const KinesaStream = require( "./includes/kinesalite/kinesaliteStreamClient" );
const BatchTransformer = require( "./includes/batchTransformer/batchtransformer" );

const runLambdaProcess = ( options ) => {
	let lambda = new L2P( options );
	let stream = new KinesaStream( options.streamName );
	let batchTransformer = new BatchTransformer();
	let kinesisHandler = async ( records ) => {
		let event = batchTransformer.toKinesisEvent( records );
		let context = batchTransformer.getContext();
		try {
			await lambda.invoke( event, context );
		} catch( error ) {
			console.error( error );
			process.exit( -1 );
		}
	};
	stream.read( kinesisHandler );
};

let options = {
	functionName : null,
	streamName : null,
	lambdasStorage : configurations.lambdasStorage
};
for( let i = 0  ; i < process.argv.length ; i++ ) {
	switch( process.argv[ i ] ) {
		case "--function-name":
			options.functionName = process.argv[++i];
			break;
		case "--stream-name":
			options.streamName = process.argv[++i];
			break;
	}
}
///// Main Task /////
runLambdaProcess( options );
