"use strict"

let JSONEvent = async ( event, context ) => {
    let message = "=== !!! LAMBDA THROW !!! ==="; 
    console.log( message );
    throw new Error( message );
    return 0;
};
//JSONEvent( null, null ); //TODO: remove or comment
exports.handler = JSONEvent;