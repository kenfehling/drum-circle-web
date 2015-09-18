/**
 * Main logic for circle placement test
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require */

require(['jquery', 'lodash', 'pubsub-js', 'drum-circle-library/constants'],
function($, _, pubsub, constants) {
    "use strict";
    var DELAY = 1000;

    $(document).ready(function () {
        addTestPlayers();

        function addTestPlayers() {  // For testing UI
            var N = constants.MAX_PLAYERS;
            function fakeJoin(color) {
                pubsub.publish(constants.EVENTS.PLAYER_JOIN, {
                    color: color,
                    active: true
                });
            }
            function fakeLeave(color) {
                pubsub.publish(constants.EVENTS.PLAYER_LEAVE, {
                    color: color
                });
            }
            function addFakePlayers() {
                _.each(_.range(N), function(i) {
                    setTimeout(_.bind(fakeJoin, {}, i), DELAY * (i + 1));
                });
            }
            function removeFakePlayers() {
                _.each(_.range(N), function(i) {
                    setTimeout(_.bind(fakeLeave, {}, i), DELAY * (i + N + 1));
                });
            }
            function addAndRemoveFakePlayers() {
                addFakePlayers();
                removeFakePlayers();
            }
            addAndRemoveFakePlayers();
            setInterval(addAndRemoveFakePlayers, DELAY * N * 2);
        }
    });
});