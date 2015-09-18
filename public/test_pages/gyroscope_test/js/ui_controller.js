/**
 * The logic that sits behind the gyroscope test UI.
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require */

require(['jquery', 'lodash', 'drum-circle-library/constants', 'pubsub-js',
        'app/synth_pad', 'jcanvas'],
function($, _, constants, pubsub, synth_pad) {
    "use strict";
    var MAX_SYNTH_VOLUME = 0.8;
    var START = "Start", STOP = "Stop";
    var drawColor = "#111";

    pubsub.subscribe(constants.EVENTS.SYNTH_STARTED, function() {
        synth_pad.setVolume(MAX_SYNTH_VOLUME);
        synth_pad.setFrequency(440);
    });

    $(document).ready(function () {
        var $start_button = $('#start-button');
        var $message = $('#message');
        var $display = $('#display');

        function drawLocation(x, y) {
            $display.clearCanvas();
            $display.drawEllipse({
                strokeStyle: drawColor,
                strokeWidth: 1,
                x: x, y: y,
                width: 12, height: 12
            });
            $display.drawLine({
                strokeStyle: drawColor,
                strokeWidth: 1,
                x1: 0, y1: y,
                x2: $display.width(), y2: y
            });
            $display.drawLine({
                strokeStyle: drawColor,
                strokeWidth: 1,
                x1: x, y1: 0,
                x2: x, y2: $display.height()
            });
        }

        $start_button.click(function() {
            if ($start_button.html() === START) {
                $start_button.html(STOP);
                pubsub.publishSync(constants.EVENTS.START_PRESSED);
            }
            else {
                $start_button.html(START);
                pubsub.publishSync(constants.EVENTS.PAUSE_PRESSED);
            }
        });

        pubsub.subscribe(constants.EVENTS.GYROSCOPE_BEND, function(msg, event) {
            var x = event.x;
            var y = event.y;
            $message.html(Math.round(x * 10) / 10 + ", " + Math.round(y * 10) / 10);
            var displayX = (x + 5) * $display.width() / 10;
            var displayY = (y + 10) * $display.height() / 20;
            drawLocation(displayX, displayY);
        });
    });
});