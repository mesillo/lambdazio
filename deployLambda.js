#! /usr/bin/env node
"use strict";

const fs = require( "fs" );
const unzipper = require( "unzipper" );
const configurations = require( "./etc/config.json" );

///// Functions /////
const createDestDir = async ( destDir ) => {
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
};

const unzipLambda = ( zipName, destDir ) => {
	return fs.createReadStream( zipName ).pipe(
		unzipper.Extract( {
			path: destDir
		} )
	).promise();
}

let createFs = ( config ) => {
	return new Promise( ( resolve, reject ) => {
		let destDir = `${config.lbdfs}/${config.functionName}`;
		let unzipCommand = `unzip -qq ${config.zipName} -d ${destDir}`;
		createDestDir( destDir )
			.then( async () => {
				console.info( `Unzip ${config.zipName}.` );
				unzipLambda( config.zipName, destDir )
					.then( async ( streams ) => {
						await createConfigJOSN( config, destDir );
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
};

let createConfigJOSN = async ( config, destDir ) => {
	let configFile = `${destDir}/${configurations.lambdaConfigFile}`;
	console.info( `Creating config file ${configFile}.` );
	let configContent = JSON.stringify( {
		lambdaFile : config.filename,
		lambdaHandler : config.handler,
		lambdaName : config.functionName
	} );
	fs.writeFileSync( configFile, configContent );
	return;
};

let addLambdaDirectory = async ( options ) => {
	if( options.zipName ) {
		if( ! options.lbdfs ) {
			options.lbdfs = __dirname + "/" + configurations.lambdaFs;
		}
		// TODO: checks on zip file...
		// TODO: checks on function name...
		await createFs( options );
	}// else {
	//	TODO: print error message...
	//}
};

let options = {
	zipName : null,
	lbdfs : null,
	filename : "index",
	handler : "handler",
	functionName : "zipFn"
};

if( process.env.hasOwnProperty( "LAMBDA_STORAGE" ) ) {
	console.info( `Using lambda in ${process.env.LAMBDA_STORAGE}` );
	options.lbdfs = process.env.LAMBDA_STORAGE;
}

for( let i = 0  ; i < process.argv.length ; i++ ) {
	switch( process.argv[ i ] ) {
		case "--zip-file":
			options.zipName = process.argv[++i];
			break;
		case "--lbd-fs":
			options.lbdfs = process.argv[++i];
			break;
		case "--filename":
			options.filename = process.argv[++i];
			break;
		case "--handler":
			options.handler = process.argv[++i];
			break;
		case "--name":
			options.functionName = process.argv[++i];
			break;
		case "--lambda-storage":
			options.lambdaFs = process.argv[++i];
			break;
	}
}

/// Main Task ///
addLambdaDirectory( options );