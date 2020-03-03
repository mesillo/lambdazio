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

const fs = require( "fs" );
const path = require( "path" );

const INVOKE_DELAY = 1000;
const INVOKE_RETRY = 10;

class Lambda2Process {
	constructor( options ) {// TODO: check the order of the functions (CWD management)...
		if( ! options )
			throw new Error( "Configurations needed!" );
		this.name = options.functionName;
		this.oldCWD = null;
		this.options = options;
		this.lambdaDirectory = this._getFunctionDirectory( options );
		this.configuration = this._getConfigurations();
		this._initLambdaContext();
		this._changeCWD();
		this.handler = this._getHandler();
		this._executionId = 0;
	}

	_getExecutionId( context ) {
		return context.awsRequestId;
	}

	_changeCWD() {
		if( this.lambdaDirectory ) {
			this.oldCWD = process.cwd();
			process.chdir( this.lambdaDirectory );
		}
	}

	_getFunctionDirectory( options ) {
		let directory = options.lambdasStorage + "/" + options.functionName;
		if( ! fs.lstatSync( directory ).isDirectory() )
			throw new Error( `No fs found for lambda ${options.functionName}.` );
		return path.resolve( directory );
	}

	_getConfigurations() {
		if( ! this.lambdaDirectory )
			throw new Error( "Lambda function not configured." );
		let configFile = this.lambdaDirectory + "/lambda.json";
		return require( configFile );
	}

	_getHandler() {
		if( ! this.configuration )
			throw new Error( "Configuration not loaded." );
		let filename = this.lambdaDirectory + "/" + this.configuration.lambdaFile
		return require( filename )[ this.configuration.lambdaHandler ];
	}

	_initLambdaContext() {
		this.lambdaContext = {};
	}

	resetContext() {
		this._initLambdaContext();
	}

	getHandler() {
		if( ! this.handler )
			throw new Error( "Not yet initialized." );
		return this.handler;
	}

	_retryInvokeSleep() {
		return new Promise( ( resolve ) => {
			setTimeout( resolve, INVOKE_DELAY );
		} );
	}

	async invoke( event, context ) {
		let lastError = null;
		let executionId = this._getExecutionId( context );
		let startTime = new Date().getTime();
		for( let leftRetries = INVOKE_RETRY ; leftRetries ; leftRetries-- ) {
			try {
				console.log( `START RequestId: ${executionId} Version: $LATEST` );
				return await this.handler.call(
					this.lambdaContext,
					event,
					context
				);
			} catch( error ) { //TODO: design better better... if possible...
				lastError = error;
				console.log( `RequestId: ${executionId} Error: ${error.message}` );
				await this._retryInvokeSleep();
			} finally {
				let duration = ( new Date().getTime() ) - startTime;
				let memory = process.memoryUsage();
				let memorySize = Math.round( memory.heapTotal / 1024 / 1024 * 100 ) / 100; // TODO: Move this conversion to Utils...
				let memoryUsed = Math.round( memory.heapUsed / 1024 / 1024 * 100 ) / 100;
				console.log( `END RequestId: ${executionId}` );
				console.log( `REPORT RequestId: ${executionId}	Duration: ${duration} ms	Billed Duration: ${duration} ms	Memory Size: ${memorySize} MB	Max Memory Used: ${memoryUsed} MB` );
			}
		}
		throw lastError;
	}
}

module.exports = Lambda2Process;