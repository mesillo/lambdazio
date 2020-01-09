"use strict"

const zlib = require( "zlib" );

let JSONEvent = async ( event, context ) => {
	//console.log( "===" + ( new Date() ).toString() + "=>" + JSON.stringify( event ) + "===" );
	for( let record of event.Records ) {
		let data = record.kinesis.data;
		let message = zlib.unzipSync( Buffer.from( data, "base64" ) ).toString( "ascii" );
		let object = JSON.parse( message );
		console.log( message );
		console.dir(
			object,
			{ depth : null }
		);
	}
	return 0;
};
exports.handler = JSONEvent;