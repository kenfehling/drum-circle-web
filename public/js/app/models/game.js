/**
 * Client game model
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require, module */

// Let it be used on both client (browser) and command line mocha tests
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['lodash', 'pubsub-js', 'drum-circle-library/constants'],
function(_, pubsub, constants) {
    "use strict";
    var tempo, start_time;

    return {
        setTempo: function(t) {
            tempo = t;
            pubsub.publishSync(constants.EVENTS.TEMPO_SET, t);
        },
        setStartTime: function(st) {
            start_time = st;
            pubsub.publishSync(constants.EVENTS.START_TIME_SET, st);
        }
    };
});