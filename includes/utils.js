"use strict";

class Utils {
    static dirArguments() {
        console.dir(
            arguments,
            { depth : null }
        );
        console.log( "=======================================================" );
    }
}

module.exports = Utils;