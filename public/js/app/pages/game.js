/**
 * Game room
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global define */

define(function (require) {
    "use strict";
    require('../debug/console_redirect');
    require('../ui/browser_warning');
    require('../synth_pad');
    require('../synth_lead');
    require('../drums');
    require('../synth_controller');
    require('../beat_controller');
    require('../step_sequencer');
    require('../audio_initializer');
    require('../time_synchronizer');
    require('../gyro_effects');
    require('../ui/arrows');
    require('../ui/effects');
    require('../url_model_populator');
    require('../ui/pause_on_tab_away');

    var $ = require('jquery'),
        _ = require('lodash'),
        constants = require('drum-circle-library/constants'),
        pubsub = require('pubsub-js'),
        socket = require('../socket'),
        urls = require('drum-circle-library/urls'),
        alertify = require('alertify'),
        browser_utils = require('../browser_utils'),
        rest_client = require('../rest_client');

    function showStartButton() {
        alertify.alert("Start playing", function() {
            pubsub.publishSync(constants.EVENTS.START_PRESSED);
        });
    }

    $(document).ready(function () {
        var gameCode = urls.getGameCodeFromUrl(window.location.href);
        document.title = constants.APP_NAME + " - " + gameCode;

        pubsub.subscribe(constants.EVENTS.EFFECT_SEND, function(msg, data) {
            var player = data.player;
            var effect = data.effect;
            rest_client.sendEffect(gameCode, player.color, effect);
        });

        socket.connect({ channel: gameCode });
        rest_client.getGamePlayers(gameCode, function(players) {
            _.each(players, playerJoined);
        });
        showStartButton();
    });

    function playerJoined(player) {
        pubsub.publishSync(constants.EVENTS.PLAYER_JOIN, player);
    }
});