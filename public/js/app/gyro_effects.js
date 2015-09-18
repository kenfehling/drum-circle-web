/**
 * Gyroscope effects
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require */

require(['jquery', 'drum-circle-library/constants', 'pubsub-js'],
function($, constants, pubsub) {
    "use strict";

    $(document).ready(function () {
        window.ondevicemotion = function(event) {
            var x = event.accelerationIncludingGravity.x;
            var y = event.accelerationIncludingGravity.y;
            x = Math.min(
                Math.max(x, constants.GYROSCOPE_X_RANGE[0]),
                constants.GYROSCOPE_X_RANGE[1]);
            y = Math.min(
                Math.max(y, constants.GYROSCOPE_Y_RANGE[0]),
                constants.GYROSCOPE_Y_RANGE[1]);
            pubsub.publish(constants.EVENTS.GYROSCOPE_BEND, { x: x, y: y });
        };
    });
});