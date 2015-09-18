/**
 * Audio state model
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require, module */

// Let it be used on both client (browser) and command line mocha tests
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['pubsub-js', 'drum-circle-library/constants', 'javascript-state-machine'],
function(pubsub, constants, StateMachine) {
    "use strict";

    var fsm = StateMachine.create({
        initial: constants.STATES.AUDIO.NOT_STARTED,
        events: [
            {
                name: 'startPlaying',
                from: constants.STATES.AUDIO.NOT_STARTED,
                to: constants.STATES.AUDIO.PLAYING
            },
            {
                name: 'systemPause',
                from: constants.STATES.AUDIO.PLAYING,
                to: constants.STATES.AUDIO.PAUSED_BY_SYSTEM
            },
            {
                name: 'userPause',
                from: constants.STATES.AUDIO.PLAYING,
                to: constants.STATES.AUDIO.PAUSED_BY_USER
            },
            {
                name: 'systemUnpause',
                from: constants.STATES.AUDIO.PAUSED_BY_SYSTEM,
                to: constants.STATES.AUDIO.PLAYING
            },
            {
                name: 'userUnpause',
                from: constants.STATES.AUDIO.PAUSED_BY_USER,
                to: constants.STATES.AUDIO.PLAYING
            },
            {
                name: 'reset',
                from: '*',
                to: constants.STATES.AUDIO.NOT_STARTED
            }

        ],
        callbacks: {
            onstartPlaying:  function() {
                pubsub.publishSync(constants.EVENTS.INITIALIZE_AUDIO);
                pubsub.publishSync(constants.EVENTS.PLAY_AUDIO);
            },
            onsystemPause: function() {
                pubsub.publishSync(constants.EVENTS.PAUSE_AUDIO);
            },
            onuserPause: function() {
                pubsub.publishSync(constants.EVENTS.PAUSE_AUDIO);
            },
            onsystemUnpause: function() {
                pubsub.publishSync(constants.EVENTS.PLAY_AUDIO);
            },
            onuserUnpause: function() {
                pubsub.publishSync(constants.EVENTS.PLAY_AUDIO);
            }
        }
    });

    function doIfCan(event) {
        if (fsm.can(event)) {
            fsm[event]();
        }
    }

    return {
        startPlaying: function() { doIfCan('startPlaying'); },
        systemPause: function() { doIfCan('systemPause'); },
        systemUnpause: function() { doIfCan('systemUnpause'); },
        userPause: function() { doIfCan('userPause'); },
        userUnpause: function() { doIfCan('userUnpause'); },
        reset: function() { doIfCan('reset'); },
        get: function() { return fsm.current; }
    };
});