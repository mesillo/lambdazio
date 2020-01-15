"use strict";

const L2P = require( "../l2p/l2p" );
const KinesaStream = require( "../kinesalite/kinesaliteStreamClient" );
const BatchTransformer = require( "../batchTransformer/batchtransformer" );
const fs = require( "fs" );
const unzipper = require( "unzipper" );

const configurations = require( "./etc/config.json" ); // TODO: get rid of this...
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
    	let batchTransformer = new BatchTransformer();
    	let kinesisHandler = async ( records ) => {
    		let event = batchTransformer.toKinesisEvent( records );
    		let context = batchTransformer.getContext();
    		try {
    			await lambda.invoke( event, context );
    		} catch( error ) {
    			console.error( error );
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
        if( options.zipName ) {
            if( ! options.lbdfs ) {
                options.lbdfs = __dirname + "/" + configurations.lambdaFs;
            }
            // TODO: checks on zip file...
            // TODO: checks on function name...
            await Lambda._createFs( options );
        }// else {
        //	TODO: print error message...
        //}
    }

    static async _createDestDir( destDir ) {
        console.info( `Checking ${destDir}...` );
        if( fs.existsSync( destDir ) ) {
            fs.rmdirSync(
                destDir,
                { recursive : true }
            );
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