"use strict"

const zlib = require( "zlib" );

let counter = 0;

let JSONEvent = async ( event, context ) => {
	console.log( "Counter:" + counter++ );
	return 0;
};
exports.handler = JSONEvent;