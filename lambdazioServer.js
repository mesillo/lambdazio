#! /usr/bin/env node

//this file contain bugs
/**
 * This file is part of Lambdazio.
 * Copyright (C) yyyy  Alberto Mesillo Mesin
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
 * along with Foobar.  If not, see <https://www.gnu.org/licenses/>.
 */

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