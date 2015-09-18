/**
 * Create game
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global define */

define(function (require) {
    "use strict";
    require('../debug/console_redirect');
    require('../ui/browser_warning');
    require('../ui/tempo_select');
    require('../ui/drum_select');

    var $ = require('jquery');
    var _ = require('lodash');
    var constants = require('drum-circle-library/constants');
    var urls = require('drum-circle-library/urls');
    var utils = require('drum-circle-library/utils');
    var pubsub = require('pubsub-js');
    var alertify = require('alertify');
    var socket = require('../socket');
    var rest_client = require('../rest_client');
    var player_list = require('../ui/player_list');
    var browser_utils = require('../browser_utils');

    $(document).ready(function () {
        var $game_code = $('#game-code');
        var $code = $('input#code');
        var $drum = $('input#drum');
        var $color = $('input#color');
        var $join_game_url = $('#join-game-url');
        var $form = $("form");
        var $submit_button = $form.find('input:submit');

        var gameCode = urls.getGameCodeFromUrl(window.location.href);
        var hashParams = utils.getHashParams();
        $game_code.html(gameCode);
        $code.val(gameCode);
        $drum.val(hashParams.drum);
        $color.val(hashParams.color);
        var joinGameUrl = getJoinGameUrl(gameCode);
        $join_game_url.html(joinGameUrl);
        $join_game_url.attr('href', joinGameUrl);

        $form.submit(function() {
            if (browser_utils.isWithoutServer()) {
                window.location.href = "../game/index.html";
                return false; // Prevent form from actually submitting
            }
            else {
                var min = constants.MIN_PLAYERS;
                if (player_list.getNumPlayers() < min) {
                    alertify.alert("Must have at least " + min + " players");
                    return false; // Prevent form from actually submitting
                }
                else {
                    browser_utils.lockForm($form);
                    return true;
                }
            }
        });

        document.title = constants.APP_NAME + " - Create Game - " + gameCode;
        socket.connect({ channel: gameCode });
        rest_client.getGamePlayers(gameCode, function(players) {
            _.each(players, playerJoined);
        });

        $submit_button.attr('disabled', null);
    });

    function getJoinGameUrl(gameCode) {
        return browser_utils.toAbsoluteUrl(urls.createRelativeJoinGameUrl(gameCode));
    }

    function playerJoined(player) {
        pubsub.publishSync(constants.EVENTS.PLAYER_JOIN, player);
    }
});