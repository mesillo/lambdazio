"use strict";

const defaultContext = JSON.stringify( {
	//callbackWaitsForEmptyEventLoop: [Getter/Setter],
	//succeed: [Function],
	//fail: [Function],
	//done: [Function],
	functionVersion: "$LATEST",
	functionName: "unamed",
	memoryLimitInMB: "128",
	logGroupName: "/aws/lambda/unamed",
	logStreamName: "1970/01/01/[$LATEST]00000000000000000000000000000000",
	clientContext: undefined,
	identity: undefined,
	invokedFunctionArn: 'arn:aws:lambda:eu-central-1:102165533286:function:unamed',
	awsRequestId: '00000000-0000-0000-0000-000000000000',
	//getRemainingTimeInMillis: [Function: getRemainingTimeInMillis]
} );

const defaultEvent = JSON.stringify( {
	Records: []
} );

const baseRecordStruct = JSON.stringify( {
	//eventID: 'shardId-000000000000:49595160041073623401520312716573683571199835999744032770',
	eventID: 'shardId-000000000000:00000000000000000000000000000000000000000000000000000000',
	//eventSourceARN: 'arn:aws:kinesis:us-east-1:000000000000:stream/test-stream',
	eventSourceARN: 'arn:aws:kinesis:us-east-1:000000000000:stream/unamed',
	kinesis: {
		//partitionKey: '48748',
		partitionKey: '00000',
		//data: 'eyJ2YWx1ZSI6IjE4ID0+IFJhbmQ6IDYifQ==',
		data: '00',
		//sequenceNumber: '49595160041073623401520312716573683571199835999744032770'
		sequenceNumber: '00000000000000000000000000000000000000000000000000000000'
	}
} );

class BatchTranformer {
	toKinesisEvent( records ) {
		let LRecords = [];
		for( let kinesisRecord of records.Records ) {
			LRecords.push( this._convertRecord( kinesisRecord ) );
		}
		return this._getRecordStructure( LRecords );
	}
	/*{
		Records: [
			{
    			SequenceNumber: '49602159052169182985118470184069715370891255409436262402',
    			ApproximateArrivalTimestamp: 2019-12-09T15: 26: 15.509Z,
    			Data: Buffer[Uint8Array][...],
				PartitionKey: '7ee0c703ed8d63a44382f6a40137113b'
			}
  		],
		NextShardIterator: 'AAAAAAAAAAHHEtmbWZu/eTpphaDzrIq2vS4mwA7d2kCOeM6BpG2fDltenj7wSlB8W9MOeL8ELekqbmd3Tj6VobKliDlcwMR0N9eFYvXknYfTIRXi6Yjue/Lh/kH1ctvbN+pqbSu9rZcP2WeveaUyOJv096FKwwhvPOR4iUs6ycVZo/rD3eDq/KBZSo/HY9R747iOa56sLew=',
		MillisBehindLatest: 0
	}*/
	_convertRecord( kinesisRecord ) {
		let lambdaRecord = JSON.parse( baseRecordStruct );
		lambdaRecord.kinesis.partitionKey = kinesisRecord.PartitionKey;
		lambdaRecord.kinesis.data = kinesisRecord.Data.toString( "base64" ); //TODO: Check format??
		lambdaRecord.kinesis.sequenceNumber = kinesisRecord.SequenceNumber;
		return lambdaRecord;
	}

	getContext() {
		return JSON.parse( defaultContext );
	}

	_getRecordStructure( recordsArray ) {
		let returnValue = JSON.parse( defaultEvent );
		returnValue.Records = recordsArray;
		return returnValue;
	}
}

module.exports = BatchTranformer;