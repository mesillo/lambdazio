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
 * along with Foobar.  If not, see <https://www.gnu.org/licenses/>.
 */

"use strict";

const child_process = require( "child_process" );

class Executor {
    static execute( command ) {
        return new Promise( ( resolve, reject ) => {
            child_process.exec( command, ( error, stdout, stderr ) => {
                if( error ) {
                    reject( error );
                }
                resolve( {
                    stdout: stdout,
                    stderr: stderr
                } );
            } );
        } );
    };
}

module.exports = Executor;