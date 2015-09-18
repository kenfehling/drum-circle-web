/**
 * The logic that sits behind the sync test UI.
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require */

require(['jquery', 'drum-circle-library/constants', 'pubsub-js', 'app/device_info'],
function($, constants, pubsub, device_info) {
    "use strict";
    var START = "Start", STOP = "Stop";

    $(document).ready(function () {
        var $start_button = $('#start-button');
        var $message = $('#message');
        var $device_info = $('#device-info');
        $start_button.css('visibility', 'hidden');
        $message.html("Please wait");
        $device_info.html("Calculating clock difference");

        $start_button.click(function() {
            if ($start_button.html() === START) {
                $start_button.html(STOP);
                pubsub.publishSync(constants.EVENTS.START_PRESSED);
            }
            else {
                $start_button.html(START);
                pubsub.publish(constants.EVENTS.PAUSE_PRESSED);
            }
        });

        pubsub.subscribe(constants.EVENTS.INITIALIZE_AUDIO, function() {
            $message.html("Starting...");
        });

        pubsub.subscribe(constants.EVENTS.NEXT_BEAT, function(msg, beat) {
            $message.html(beat);
        });

        pubsub.subscribe(constants.EVENTS.TIME_SYNCHRONIZED, function(msg, data) {
            $start_button.css('visibility', 'visible');
            $message.html("Press start button to begin");
            var timeDiff = data.timeDifference;
            $device_info.html("<p>Clock difference: " + timeDiff + " ms</p>");
            $device_info.append("<p>OS: " + device_info.os + "</p>");
            $device_info.append("<p>Browser: " + device_info.browser + "</p>");
            $device_info.append("<p>Version: " + device_info.browser_version + "</p>");
            $device_info.append("<p>Width: " + device_info.width + "</p>");
            $device_info.append("<p>Height: " + device_info.height + "</p>");
        });
    });
});