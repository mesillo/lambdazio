#! /usr/bin/env node
"use strict";

// Returns a standard Node.js HTTP server
const kinesalite = require( "kinesalite" );
const configurations = require( "./etc/config.json" );

let kinesaliteServer = kinesalite( {
	path: __dirname + "/" + configurations.dfFs,
	createStreamMs: 50
} );

// Start Kinesalite.
kinesaliteServer.listen( configurations.kinesaPort, ( error ) => {
	if( error )
		throw error;
	console.info( `Kinesalite started on port ${configurations.kinesaPort}.` );
} );
