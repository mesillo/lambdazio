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
 * along with Foobar.  If not, see <https://www.gnu.org/licenses/>.
 */

"use strict";

const http = require( "http" );
const fs = require( "fs" );
const zlib = require( "zlib" );
const kinesaliteClient = require( "../kinesalite/kinesaliteClient" );

const Utils = require( "../utils" );

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

	_getPostUrl( request ) {
		let paramsArray = request.url.split( "/" );
		while( paramsArray[0] === "" )
			paramsArray.shift();
		while( paramsArray[ paramsArray.length - 1 ] === "" )
			paramsArray.pop();
		return paramsArray;
	}

	_getPostBody( request ) {
		return new Promise( ( resolve, reject ) => {
			let bodyContent = "";
			request.on( "data", ( chunk ) => {
				bodyContent += chunk.toString();
			} );
			request.on( "end", () => {
				resolve( bodyContent );
			} );
		} );
	}

	_getGetUrl( request ) {
		return this._getPostUrl( request );
	}

	async _listStreams( responseBody ) {
		responseBody.action = "listStreams";
		responseBody.status = 200;
		responseBody.response = await this.kinesa.listStreams();
		return responseBody;
	}

	async _describeStream( responseBody ) {
		responseBody.action = "describeStream";
		return new Promise( ( resolve, reject ) => {
			let streamName = responseBody.parameters[1];
			this.kinesa.describeStream( streamName )
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

	async _clearStream( responseBody ) {
		responseBody.action = "clearStream";
		return new Promise( async ( resolve, reject ) => {
			let streamName = responseBody.parameters[1];
			let shardNum = await this._getShardNum( streamName );
			this.kinesa.deleteStream( streamName )
			.then( async ( result ) => {
				while( await this.kinesa.streamExists( streamName ) ) {
					await Utils.timerPromise( 1000 ); // TODO: use a const... please...
				}
				this.kinesa.createStream(
					streamName,
					shardNum
				)
				.then( ( result ) => {
					responseBody.status = 200;
					responseBody.response = result;
					resolve( responseBody );
				} )
				/*.catch( ( error ) => {
					responseBody.status = 500;
					responseBody.error = error.message;
					console.error( error );
					resolve( responseBody );
				} )*/; // TODO: needed???
			} )
			.catch( ( error ) => {
				responseBody.status = 500;
				responseBody.error = error.message;
				console.error( error );
				resolve( responseBody );
			} );
		} );
	}

	async _getShardNum( streamName ) {
		return new Promise( ( resolve, reject ) => {
			this.kinesa.describeStream( streamName )
			.then( ( result ) => {
				//console.dir( result.StreamDescription.Shards.length );
				resolve( result.StreamDescription.Shards.length );
			} )
			.catch( ( error ) => {
				reject( error );
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

	async _writeStream( responseBody ) {
		responseBody.action = "writeStream";
		return new Promise( ( resolve, reject ) => {
			let streamName = responseBody.parameters[1];
			let partitonKey = responseBody.parameters[2];
			let data = responseBody.body;
			this.kinesa.writeStream(
				streamName,
				data,
				partitonKey,
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

	async _writeStreamGzip( responseBody ) {
		responseBody.action = "writeStreamGzip";
		return new Promise( ( resolve, reject ) => {
			let streamName = responseBody.parameters[1];
			let partitonKey = responseBody.parameters[2];
			let data = zlib.gzipSync( responseBody.body );
			this.kinesa.writeStream(
				streamName,
				data,
				partitonKey,
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

	async _managePost( request, response ) {
		let responseBody = {
			parameters: this._getPostUrl( request ),
			body: await this._getPostBody( request ),
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
			case "describeStream":
				await this._describeStream( responseBody );
				break;
			case "writeStream":
				await this._writeStream( responseBody );
				break;
			case "writeStreamGzip":
				await this._writeStreamGzip( responseBody );
				break;
			case "clearStream":
				await this._clearStream( responseBody );
				break;
			default:
		}
		response.statusCode = responseBody.status;
		response.setHeader( "Content-Type", "application/json" );
		response.setHeader( "Cache-Control", "no-store" );
		response.write( JSON.stringify( responseBody ) );
	}

	async _manageGet( request, response ) {
		let responseBody = {
			parameters: this._getGetUrl( request ),
			body: null,
			action: null,
			status: 500,
			response: "",
			error: null
		};
		if( responseBody.parameters.length === 0 )
			responseBody.parameters.push( "home" );
		switch( responseBody.parameters[0] ) {
			default:
				//responseBody.parameters[1] = "homepage.html";
				responseBody.status = 200;
				responseBody.action = "static";
		}
		responseBody = Render.getResponseBuffer( responseBody );
		response.statusCode = responseBody.status;
		response.setHeader( "Content-Type", "text/html" );
		response.write( responseBody.response );
		//let render = new Render( responseBody );
		//response.setHeader( "Cache-Control", "no-store" );
		/*response.write(
			render.getHtmlHeader() +
			render.getHtmlBody() +
			render.getHtmlFooter()
		);*/
	}

	async _requestManager( request, response ) {
		switch( request.method ) {
			case "POST":
				await this._managePost( request, response );
				break;
			case "GET":
				await this._manageGet( request, response );
				break;
			default:
				console.error( "Unmanaged Method " + request.method );
		}
		response.end();
	}
}

class Render {
	/*constructor( responseBody ) {
		if( ! responseBody )
			throw new Error( "Constructor need a responseBody!" );
		this.responseBody = responseBody;
	}*/
	static getResponseBuffer( responseBody ) {
		if( responseBody.action === "static" ) {
			let filename =  __dirname + "/static/" + ( responseBody.parameters[1] ? responseBody.parameters[1] : "homepage.html" ); // TODO: use a define... 
			if( ! fs.existsSync( filename ) ) {
				console.error( "Unable to find: " + filename );
				responseBody.status = 404;
				filename = __dirname + "/static/404.html";
			}
			responseBody.response = fs.readFileSync( filename ).toString();
		}
		return responseBody;
	}
	/*getHtmlHeader() {
		return `<!DOCTYPE html>\n<html>\n<head><title>Lambdazio - ${this.responseBody.action}</title></head>\n`;
	}
	getHtmlBody() {
		let bodyBuffer = this.responseBody.response;
		return `<body>\n${bodyBuffer}</body>\n`;
	}
	getHtmlFooter() {
		return "</html>";
	}*/
}

module.exports = ApiServer;
