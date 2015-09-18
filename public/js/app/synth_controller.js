/**
 * Controls playing the synth.
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require */
require(['pubsub-js', 'app/synth_pad', 'app/synth_lead',
         'drum-circle-library/constants', 'drum-circle-library/utils'],
function(pubsub, synth_pad, synth_lead, constants) {
    "use strict";

    pubsub.subscribe(constants.EVENTS.WEB_AUDIO_CONTEXT_CREATED, function(msg, ctx) {
        synth_pad.setup(ctx);
        //synth_lead.setup(ctx);
    });
});