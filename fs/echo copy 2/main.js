"use strict"

let JSONEvent = async ( event, context ) => {
    console.log( "============================================================" );
    console.log( "\t\tEVENT" );
    console.dir( event, { depth : null } );
    console.log( "\t\tCONTEXT" );
    console.dir( context, { depth : null } );
    console.log( "============================================================" );
    return 0;
};
//JSONEvent( {uno:1}, {due:2} ); //TODO: remove or comment
exports.handler = JSONEvent;