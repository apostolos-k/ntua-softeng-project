const mongoose = require('mongoose');

/**
 * MongoDB connection states:
 * 0: disconnected
 * 1: connected
 * 2: connecting
 * 3: disconnecting
 */

function connected() {
    if (mongoose.connection.readyState == 1) {
        return 1;
    } 
    else {
        return 0;
    }
};

module.exports =  connected;