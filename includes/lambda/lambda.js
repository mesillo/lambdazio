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

const L2P = require( "../l2p/l2p" );
const KinesaStream = require( "../kinesalite/kinesaliteStreamClient" );
const BatchTransformer = require( "../batchTransformer/batchtransformer" );
const utils = require( "../utils" );
const fs = require( "fs" );
const unzipper = require( "unzipper" );

const configurations = require( "../../etc/config.json" ); // TODO: get rid of this...
//TODO: omogenize options...

class Lambda {
	//// Running a Lambda Process ////
	/**
	 * @param {
	 * functionName : string;
	 * streamName : string,
	 * lambdasStorage : string;
	 * } options 
	 */
	static runLambdaProcess ( options ) {
		let lambda = new L2P( options );
		let stream = new KinesaStream( options.streamName );
		let batchTransformer = new BatchTransformer( options.streamName );
		let kinesisHandler = async ( records ) => {
			let event = batchTransformer.toKinesisEvent( records );
			let context = batchTransformer.getContext();
			try {
				await lambda.invoke( event, context );
			} catch( error ) {
				//console.error( error );
				process.exit( -1 );
			}
		};
		stream.read( kinesisHandler );
	}

	//// Deploy new lambda ////
	/**
	 * @param {
	 * zipName : string;
	 * lbdfs : string|null;
	 * filename : string;
	 * handler : string;
	 * functionName : string;
	 * } options 
	 */
	static async addLambdaDirectory( options ) {
		if( options.zipName && options.lbdfs ) {
			await Lambda._createFs( options );
		} else {
			console.error( "Necessary parameters not provided. Nothing to Execute." );
			process.exit( -1 );
		}
	}

	static async _createDestDir( destDir ) {
		console.info( `Checking ${destDir}...` );
		if( fs.existsSync( destDir ) ) {
			//fs.rmdirSync( destDir, { recursive : true } );
			utils.deleteFolderRecursive( destDir );
			console.info( "... removed!" );
		} else {
			console.info( "... not exists!" );
		}
		console.info( `Creating ${destDir}.` );
		fs.mkdirSync( destDir );
		return true;
	}
	
	static _unzipLambda( zipName, destDir ) {
		return fs.createReadStream( zipName ).pipe(
			unzipper.Extract( {
				path: destDir
			} )
		).promise();
	}
	
	static _createFs( config ) {
		return new Promise( ( resolve, reject ) => {
			let destDir = `${config.lbdfs}/${config.functionName}`;
			Lambda._createDestDir( destDir )
				.then( async () => {
					console.info( `Unzip ${config.zipName}.` );
					Lambda._unzipLambda( config.zipName, destDir )
						.then( async ( streams ) => {
							await Lambda._createConfigJOSN( config, destDir );
							console.info( "Done!" );
							resolve();
						} )
						.catch( ( error ) => {
							console.error( error );
							process.exit( 255 ); //TODO: redefine...
						} );
				} )
				.catch( ( error ) => {
					console.error( error );
					process.exit( 255 ); //TODO: redefine...
				} );
		} );
	}
	
	static async _createConfigJOSN( config, destDir ) {
		let configFile = `${destDir}/${configurations.lambdaConfigFile}`;
		console.info( `Creating config file ${configFile}.` );
		let configContent = JSON.stringify( {
			lambdaFile : config.filename,
			lambdaHandler : config.handler,
			lambdaName : config.functionName
		} );
		fs.writeFileSync( configFile, configContent );
		return;
	}
}

module.exports = Lambda;