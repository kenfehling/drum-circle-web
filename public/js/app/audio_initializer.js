/**
 * Controls sequence of setup events for initializing sequencer and audio system
 * Also initializes web audio context that can be used both by drums and synth
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global define, module, alert */

define(['pubsub-js', 'drum-circle-library/constants',
        './models/sequencer_state', '../app/web_audio_utils'],
    function(pubsub, constants, sequencer_state, web_audio_utils) {
    "use strict";

    pubsub.subscribe(constants.EVENTS.INITIALIZE_AUDIO, function() {
        web_audio_utils.createAudioContext(
            function(ctx) {
                pubsub.publishSync(constants.EVENTS.WEB_AUDIO_CONTEXT_CREATED, ctx);
            },
            function(err) {
                alert(err);
            }
        );
    });

    pubsub.subscribe(constants.EVENTS.START_PRESSED, function() {
        sequencer_state.startPlaying();
    });

    pubsub.subscribe(constants.EVENTS.PAUSE_PRESSED, function() {
        sequencer_state.userPause();
    });
});