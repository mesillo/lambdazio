"use strict"

const WAIT_MILLIS = 750;

let JSONEvent = async ( event, context ) => {
	console.log( `Waiting for ${WAIT_MILLIS}ms...` );
	let waitPromise = new Promise( ( resolve ) => { setTimeout( resolve, WAIT_MILLIS ) } );
	await waitPromise;
	console.log( "... done!" );
	return 0;
};
exports.handler = JSONEvent;