/**
 * The logic that sits behind the effect test UI.
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require */

require(['jquery', 'drum-circle-library/constants', 'pubsub-js'],
function($, constants, pubsub) {
    "use strict";
    var EFFECT = 'bitcrush';
    var START = "Start", STOP = "Stop";
    var EFFECT_ON = "Effect on", EFFECT_OFF = "Effect off";

    $(document).ready(function () {
        var $start_button = $('#start-button');
        var $message = $('#message');
        var $effect_button = $('#effect');
        $start_button.css('visibility', 'hidden');
        $effect_button.css('visibility', 'hidden');
        $message.html("Please wait");
        $effect_button.html(EFFECT_ON);

        $effect_button.click(function() {
            if ($effect_button.html() === EFFECT_ON) {
                $effect_button.html(EFFECT_OFF);
            }
            else {
                $effect_button.html(EFFECT_ON);
            }
            pubsub.publish(constants.EVENTS.EFFECT_RECEIVE, {
                effect: EFFECT
            });
        });
        
        $start_button.click(function() {
            if ($start_button.html() === START) {
                $start_button.html(STOP);
                $effect_button.css('visibility', 'visible');
                pubsub.publishSync(constants.EVENTS.START_PRESSED);
            }
            else {
                $start_button.html(START);
                $effect_button.css('visibility', 'hidden');
                pubsub.publish(constants.EVENTS.PAUSE_PRESSED);
            }
        });

        pubsub.subscribe(constants.EVENTS.INITIALIZE_AUDIO, function() {
            $message.html("Starting...");
        });

        pubsub.subscribe(constants.EVENTS.NEXT_BEAT, function(msg, beat) {
            $message.html(beat);
        });

        pubsub.subscribe(constants.EVENTS.TIME_SYNCHRONIZED, function() {
            $start_button.css('visibility', 'visible');
            $message.html("Press start button to begin");
        });
    });
});