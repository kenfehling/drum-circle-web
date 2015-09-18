/**
 * Sync test
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require */

require(['jquery', 'drum-circle-library/constants', 'pubsub-js'],
function($, constants, pubsub) {
    "use strict";

    $(document).ready(function () {
        pubsub.subscribe(constants.EVENTS.NEXT_BEAT, function() {
            pubsub.publish(constants.EVENTS.PLAY_DRUM);
        });
    });
});