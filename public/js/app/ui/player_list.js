/**
 * Allows displaying players that join and leave in real time.
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global define */

define(['jquery', 'lodash', 'drum-circle-library/constants', 'pubsub-js',
        'drum-circle-library/urls', 'app/browser_utils', 'drum-circle-library/utils'],
    function ($, _, constants, pubsub, urls, browser_utils, utils) {
    "use strict";
    var SHOW_INACTIVE = false;
    var DISCONNECTED = 'disconnected';

    function addTestPlayers() {  // For testing UI
        var DELAY = 1000;
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

    $(document).ready(function () {
        var yourColor = parseInt(utils.getHashParams().color);
        var $players = $('#players');

        function addPlayer(player) {
            var color = player.color;
            var $player = getPlayerElement(color);
            if ($player.length === 0) {  // if player doesn't already exist
                $player = $(document.createElement('span'));
                $player.addClass('player');
                $player.addClass(constants.PLAYER_COLORS[color]);
                if (SHOW_INACTIVE && !player.active) {
                    $player.addClass(DISCONNECTED);
                }
                $player.attr('id', color);
                $player.html(color === yourColor ? 'You' : '♫');
                $players.append($player);
            }
        }

        function getPlayerElement(color) {
            return $($players.find('.' + constants.PLAYER_COLORS[color]));
        }

        function removePlayer(player) {
            var $player = getPlayerElement(player.color);
            $player.remove();
        }

        if (browser_utils.isWithoutServer()) {
            addTestPlayers();
        }

        pubsub.subscribe(constants.EVENTS.PLAYER_DISCONNECT, function(msg, p) {
            var $player = getPlayerElement(p.color);
            $player.addClass(DISCONNECTED);
        });

        pubsub.subscribe(constants.EVENTS.PLAYER_RECONNECT, function(msg, p) {
            var $player = getPlayerElement(p.color);
            $player.removeClass(DISCONNECTED);
        });

        pubsub.subscribe(constants.EVENTS.PLAYER_JOIN, function(msg, player) {
            addPlayer(player);
        });

        pubsub.subscribe(constants.EVENTS.PLAYER_LEAVE, function(msg, player) {
            removePlayer(player);
        });
    });

    return {
        addTestPlayers: addTestPlayers,
        getNumPlayers: function() {
            return $('.player').size();
        }
    };
});