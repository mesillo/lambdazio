#! /usr/bin/env node
"use strict";

const ApiServer = require( "./includes/apiserver/apiserver" );
const kinesalite = require( "kinesalite" );
// const Utils = require( "./includes/utils" ); // TODO: remove...

const configurations = require( "./etc/config.json" );

let kinesaliteServer = kinesalite( {
	path: __dirname + "/" + configurations.dfFs,
	createStreamMs: 50
} );

let apiServer = new ApiServer();
/// TEST /// // TODO: remove...
// kinesaliteServer.on( "connection", Utils.dirArguments );
////////////
// Start Kinesalite.
kinesaliteServer.listen( configurations.kinesaPort, ( error ) => {
	if( error )
		throw error;
	console.info( `Kinesalite started on port ${configurations.kinesaPort}.` );
} );

apiServer.start();