"use strict";

const kinesisConfig = {
	region : "us-east-1",
	endpoint : "http://localhost:4567"
};

const defaultRecordHandler = ( records ) => {
	console.dir(
		records,
		{ depth : null }
	);
	//console.log( "received " + records.Records.length + " records." );
};

const libConfigs = {
	checkCreationPollingTimer : 500,
	waitForShardReadRetry : 1000,
	defaultBatchSize : 10,
	defaultRecordHandler : defaultRecordHandler,
	defaultIteratorType : "TRIM_HORIZON"
};

const AWS = require( "aws-sdk" );

AWS.config = new AWS.Config( {
		accessKeyId : "AKID",
		secretAccessKey : "SECRET",
		region : "us-east-1"
} );

const timerPromise = ( millis ) => {
	return new Promise( ( resolve, reject ) => {
		setTimeout( resolve, millis );
	} );
};

class KinesaliteClient {
	constructor( endpoint = null ) {
		if( endpoint )
			kinesisConfig.endpoint = endpoint;
		this.kinesis = new AWS.Kinesis( kinesisConfig );
		this.streams = [];
	}

	createStream( streamName, shardCount = 1 ) {
		return new Promise( ( resolve, reject ) => {
			let streamInfos = {
				StreamName: streamName,
				ShardCount: shardCount
			};
			this.kinesis.createStream(
				streamInfos,
				( error, data ) => {
					if( error ) {
						reject( error )
					} else {
						this.streams.push( streamInfos );
						resolve( data );
					}
				}
			);
		} );
	}

	describeStream( streamName ) {
		return new Promise( ( resolve, reject ) => {
			this.kinesis.describeStream(
				{
					StreamName : streamName
				},
				( error, data ) => {
					if( error ) {
						reject( error )
					} else {
						resolve( data );
					}
				}
			);
		} );
	}

	waitForStream( streamName ) {
		return new Promise( async ( resolve, reject ) => {
			let creating = true;
			while( creating ) {
				creating = ( await this.describeStream( streamName ) ).StreamDescription.StreamStatus !== "ACTIVE" ? true : false;
				await timerPromise( libConfigs.checkCreationPollingTimer );
			}
			resolve();
		} );
	}

	writeStream( streamName, data, partitionKey ) {
		return new Promise( ( resolve, reject ) => {
			let recordParams = {
				Data : data,
				PartitionKey : partitionKey,
				StreamName : streamName
			};
			this.kinesis.putRecord(
				recordParams,
				( error, data ) => {
					if( error ) {
						reject( error )
					} else {
						resolve( data );
					}
				}
			);
		} );
	}

	async _getNextShardIterator( record ) {
		if( record.Records.length === 0 || record.MillisBehindLatest === 0 ) { //TODO: is the rigth way??
			await timerPromise( libConfigs.waitForShardReadRetry );
		}
		return record.NextShardIterator;
	}

	_recordHandlerExecutor( recordHandler, records ) {
		if( records.Records.length ) {
			recordHandler( records );
		}
	}

	readShardIterator( shardIterator, recordHandler, batchSize ) {
		this.kinesis.getRecords(
			{
				ShardIterator : shardIterator.ShardIterator,
    			Limit : batchSize
			},
			async ( error, records ) => {
				if( error ) {
					throw error;
				} else {
					let nextIterator = await this._getNextShardIterator( records );
					this._recordHandlerExecutor( recordHandler, records );
					this.readShardIterator(
						{
							ShardIterator : nextIterator
						},
						recordHandler,
						batchSize
					);
				}
			}
		);
	}

	readShard( streamName, shardId, recordHandler, batchSize, iteratorType ) {
		let shardInfos = {
			StreamName : streamName,
			ShardId : shardId,
			ShardIteratorType : iteratorType
		};
		this.kinesis.getShardIterator(
			shardInfos,
			( error, data ) => {
				if( error ) {
					throw error;
				} else {
					//console.dir( data );
					this.readShardIterator( data, recordHandler, batchSize );
				}
			}
		);
	}

	async readStream( streamName, recordHandler = libConfigs.defaultRecordHandler, batchSize = libConfigs.batchSize, iteratorType = libConfigs.defaultIteratorType ) {
		let shards = ( await this.describeStream( streamName ) ).StreamDescription.Shards;
		for( let shard of shards ) {
			this.readShard( streamName, shard.ShardId, recordHandler, batchSize, iteratorType );
		}
	}

	listStreams() {
		return new Promise( ( resolve, reject ) => {
			this.kinesis.listStreams( ( error, data ) => {
				if( error ) {
					reject( error );
				} else {
					//TODO: and if HasMoreStreams is true???
					resolve( data.StreamNames );
				}
			} );
		} );
	}

	async streamExists( streamName ) {
		let streamsNames = await this.listStreams();
		return streamsNames.includes( streamName );
	}

	deleteStream( streamName ) {
		let deleteStreamData = {
			StreamName: streamName,
			EnforceConsumerDeletion: true
		};
		return new Promise( ( resolve, reject ) => {
			this.kinesis.deleteStream(
				deleteStreamData,
				( error, data ) => {
					if( error ) {
						reject( error );
					} else {
						resolve( data );
					}
				}
			);
		} );
	}

	/* TODO: it seems to be not supported by Kinesalite... :-(
	listConsumers( streamName ) {
		let description = null;
		if( this.streamExists( streamName ) ) {
			return new Promise( async ( resolve, reject ) => {
				let streamInfos = await this.describeStream( streamName );
				//console.dir( streamInfos );
				this.kinesis.listStreamConsumers(
					{ StreamARN : streamInfos.StreamDescription.StreamARN },
					( error, data ) => {
						if( error ) {
							console.dir( error );
							reject( error );
						} else {
							resolve( data );
						}
					}
				);
			} );
		} else {
			return Promise.resolve( description );
		}
	}*/
}

module.exports = KinesaliteClient;