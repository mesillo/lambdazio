"use strict"

let JSONEvent = async ( event, context ) => {
    console.log(
        "        :::    ::::::::::::::::::::::::: \n",
        "        :+:    :+:    :+:        :+:     \n",
        "        +:+    +:+    +:+        +:+     \n",
        "        +#++:++#++    +#+        +#+     \n",
        "        +#+    +#+    +#+        +#+     \n",
        "        #+#    #+#    #+#        #+#     \n",
        "        ###    ##############    ###     \n"
    );
    return 0;
};
//JSONEvent( null, null ); //TODO: remove or comment
exports.handler = JSONEvent;