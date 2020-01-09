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
		for( let leftRetries = INVOKE_RETRY ; leftRetries ; leftRetries-- ) {
			try {
				return await this.handler.call(
					this.lambdaContext,
					event,
					context
				);
			} catch( error ) { //TODO: design better better...
				//console.dir( error, { depth : null } );
				lastError = error;
				//console.error( error );
				await this._retryInvokeSleep();
				//continue;
			}
		}
		throw lastError;
	}
}

module.exports = Lambda2Process;