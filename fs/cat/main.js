"use strict"

const zlib = require( "zlib" );

let JSONEvent = async ( event, context ) => {
	for( let record of event.Records ) {
		let data = Buffer.from( record.kinesis.data, "base64" );
		let textData = "";
		try {
			textData = ( zlib.unzipSync( data ) ).toString();	
		} catch( error ) {
			textData = data.toString();
		}
		console.log( record.kinesis.partitionKey );
		console.log( textData );
	}
	console.log( "\n\n" );
	return 0;
};
exports.handler = JSONEvent;