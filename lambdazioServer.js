#! /usr/bin/env node

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
 * along with Lambdazio.  If not, see <https://www.gnu.org/licenses/>.
 */

"use strict";

const ApiServer = require( "./includes/apiserver/apiserver" );
const kinesalite = require( "kinesalite" );
const Utils = require( "./includes/utils" );
const configurations = require( "./etc/config.json" );

let printHelp = () => {
	console.log(
		"=== Options ===\n",
		"--webui-port    <portnum>      - the listening port for web interface.\n",
		"--kinesa-port   <portnum>      - the listening port for kinesalite endpoint.\n",
		"--enable-cow                   - print the Cow.\n",
		"--help                         - print this help. :-)"
		// TODO: help for fs options...
	);
	process.exit( 0 );
};
/// TEST /// // TODO: remove...
// kinesaliteServer.on( "connection", Utils.dirArguments );
////////////
let options = {
	kinesaPort : configurations.kinesaPort,
	webuiPort : configurations.apiPort
};
for( let i = 0  ; i < process.argv.length ; i++ ) {
	switch( process.argv[ i ] ) {
		case "--webui-port":
			options.webuiPort = process.argv[++i];
			break;
		case "--kinesa-port":
			options.kinesaPort = process.argv[++i];
			break;
		//// ???? ////
		case "--enable-cow":
			Utils.printCow( "Running the server..." );
			break;
		//// HELP ////
		case "--help":
			printHelp();
			break;
	}
}
///// Main Task /////
// Start Kinesalite.
let kinesaliteServer = kinesalite( {
	path: __dirname + "/" + configurations.dfFs,
	createStreamMs: 50
} );
let apiServer = new ApiServer( options.webuiPort, options.kinesaPort );
kinesaliteServer.listen( options.kinesaPort, ( error ) => {
	if( error )
		throw error;
	console.info( `Kinesalite started on port ${options.kinesaPort}.` );
} );
apiServer.start();