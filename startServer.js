#! /usr/bin/env node
"use strict";

// Returns a standard Node.js HTTP server
const kinesalite = require( "kinesalite" );

const configurations = {
    kinesaPort: 4567
};

let kinesaliteServer = kinesalite( {
    path: "./mydb",
    createStreamMs: 50
} );

kinesaliteServer.on( "request", () => console.info( "request" ) );
kinesaliteServer.on( "connection", () => console.info( "connection" ) );

// Listen on port 4567
kinesaliteServer.listen( configurations.kinesaPort, ( error ) => {
  if( error )
    throw error;
  console.info( `Kinesalite started on port ${configurations.kinesaPort}.` );
} );