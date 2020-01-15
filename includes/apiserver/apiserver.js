"use strict";

const http = require( "http" );
const kinesaliteClient = require( "../kinesalite/kinesaliteClient" );

const configurations = require( "../../etc/config.json" );

class ApiServer {
	constructor( port = configurations.apiPort ) {
		this.port = port;
		this.server = http.createServer( ( req, res ) => {
			this._requestManager( req, res );
		} );
		this.kinesa = new kinesaliteClient(); // TODO: use the conf, Luke!
	}

	start() {
		this.server.listen( this.port );
		console.info( `ApiServer listen on ${this.port}.` );
	}

	async _manageGet( request, response ) {
		console.log( request.url );
		response.write( "GET" );
	}

	async _requestManager( request, response ) {
		switch( request.method ) {
			case "GET":
				this._manageGet( request, response );
				break;
			default:
				console.log( "Default" );
		}
		response.end();
	}
}

module.exports = ApiServer;
