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

	_getGetUrl( request ) {
		let paramsArray = request.url.split( "/" );
		while( paramsArray[0] === "" )
			paramsArray.shift();
		return paramsArray;
	}

	async _listStreams( responseBody ) {
		responseBody.action = "listStreams";
		responseBody.status = 200;
		responseBody.response = await this.kinesa.listStreams();
		return responseBody;
	}

	async _createStream( responseBody ) {
		responseBody.action = "createStream";
		return new Promise( ( resolve, reject ) => {
			let streamName = responseBody.parameters[1];
			let shardNum = parseInt( responseBody.parameters[2] );
			this.kinesa.createStream(
				streamName,
				shardNum
			)
			.then( ( result ) => {
				responseBody.status = 200;
				responseBody.response = result;
				resolve( responseBody );
			} )
			.catch( ( error ) => {
				responseBody.status = 500;
				responseBody.error = error.message;
				console.error( error );
				resolve( responseBody );
			} );
		} );
	}

	async _deleteStream( responseBody ) {
		responseBody.action = "deleteStream";
		return new Promise( ( resolve, reject ) => {
			let streamName = responseBody.parameters[1];
			this.kinesa.deleteStream( streamName )
			.then( ( result ) => {
				responseBody.status = 200;
				responseBody.response = result;
				resolve( responseBody );
			} )
			.catch( ( error ) => {
				responseBody.status = 500;
				responseBody.error = error.message;
				console.error( error );
				resolve( responseBody );
			} );
		} );
	}

	async _manageGet( request, response ) {
		let responseBody = {
			parameters: this._getGetUrl( request ),
			action: null,
			status: 500,
			response: null,
			error: null
		};
		switch( responseBody.parameters[0] ) {
			case "listStreams":
				await this._listStreams( responseBody );
				break;
			case "createStream":
				await this._createStream( responseBody );
				break;
			case "deleteStream":
				await this._deleteStream( responseBody );
				break;
			default:
		}
		response.statusCode = responseBody.status;
		response.setHeader( "Content-Type", "application/json" );
		response.setHeader( "Cache-Control", "no-store" );
		response.write( JSON.stringify( responseBody ) );
	}

	async _requestManager( request, response ) {
		switch( request.method ) {
			case "GET":
				await this._manageGet( request, response );
				break;
			default:
				console.log( "Default" );
		}
		response.end();
	}
}

module.exports = ApiServer;
