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

const crypto = require( "crypto" );

const KinesaliteClient = require( "./kinesaliteClient" );
const DEFAULT_SHARD_NUM = 1;
const DEFAULT_BATCH_SIZE = 1;
const DEFAULT_ITERATOR_TYPE = "TRIM_HORIZON";

const defaultPartitionKeyGenerator = ( data ) => {
	return crypto.createHash( "md5" ).update( data ).digest( "hex" );
}; 

class KinesaliteStreamClient {
	constructor( streamName, shardNum = null, client = null ) {
		this.client = this._getKinesisClient( client );
		this._activePromise = this._setUpStream( streamName, shardNum );
		this.streamName = streamName;
		this.partitionKeyGenerator = defaultPartitionKeyGenerator;
	}

	async _setUpStream( streamName, shardCount ) {
		if( ! await this.client.streamExists( streamName ) ) { //TODO: check the shardCount.
			if( shardCount !== null ) {
				await this.client.createStream( streamName, shardCount );
			} else {
				await this.client.createStream( streamName );
			}
		}
		return await this.client.waitForStream( streamName );
	}

	/*_setUpStream( streamName, shardCount ) {
		let streamPromise = new Promise( ( resolve, reject ) => {
			this.client.streamExists( streamName )
				.then( ( exist ) => {
					console.log( exist );
					if( exist ) {
						resolve( streamName );
					} else {
						if( ! shardCount )
							shardCount = DEFAULT_SHARD_NUM;
						this.client.createStream( streamName, shardCount )
							.then( () => {
								resolve( streamName );
							} );
					}
				} );
		} );
		return new Promise( ( resolve, reject ) => {
			streamPromise.then( ( streamName ) => {
				this.client.waitForStream( streamName )
					.then( () => {
						resolve();
					} );
			} );
		} );
	}*/

	_getKinesisClient( client ) {
		let returnValue = null;
		if( client !== null ) {
			switch( typeof client ) {
				case "string":
					returnValue = new KinesaliteClient( client );
					break;
				case "object":
				case "function":
					returnValue = client;
					break;
				default:
					throw new Error( "Invalid parameter client." ); //TODO: better log.
			}
		} else {
			returnValue = new KinesaliteClient();
		}
		return returnValue;
	}

	async describe() {
		await this._activePromise;
		return await this.client.describeStream( this.streamName );
	}

	async write( data, partitionKey = null ) {
		await this._activePromise;
		if( partitionKey === null ) {
			partitionKey = this.partitionKeyGenerator( data );
		}
		return await this.client.writeStream( this.streamName, data, partitionKey );
	}
	//TODO: manage default handlers and stop for running ones...
	async read( recordHandler = null, batchSize = DEFAULT_BATCH_SIZE, iteratorType = DEFAULT_ITERATOR_TYPE ) {
		if( recordHandler === null )
			return null;
		await this._activePromise;
		return await this.client.readStream( this.streamName, recordHandler, batchSize, iteratorType );
	}
}

module.exports = KinesaliteStreamClient;