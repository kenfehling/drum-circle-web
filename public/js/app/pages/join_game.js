/**
 * Join room
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global define */

define(function (require) {
    "use strict";
    require('../debug/console_redirect');
    require('../ui/circle_placement');

    var $ = require('jquery'),
        _ = require('lodash'),
        pubsub = require('pubsub-js'),
        constants = require('drum-circle-library/constants'),
        urls = require('drum-circle-library/urls'),
        utils = require('drum-circle-library/utils'),
        socket = require('../socket'),
        rest_client = require('../rest_client'),
        browser_utils = require('../browser_utils');

    $(document).ready(function () {
        var gameCode = urls.getGameCodeFromUrl(window.location.href);
        document.title = constants.APP_NAME + " - Join Game - " + gameCode;
        gotoGameOnStart(gameCode);
        rest_client.getGamePlayers(gameCode, function(players) {
            _.each(players, playerJoined);
        });
    });

    function gotoGame(game) {
        var paramKeys = ['drum_kit', 'tempo', 'start_time'];
        var params = utils.getHashParams(window.location.href);
        _.each(paramKeys, function(key) {
            utils.copyParamIfDefined(key, game, params);
        });
        var paramString = utils.paramsToParamString(params);
        var url = urls.createRelativeGameUrl(game._id + "#" + paramString);
        window.location.href = browser_utils.toAbsoluteUrl(url);
    }

    function gotoGameOnStart(code) {
        if (utils.getHashParams().start_time) {  // Game already started
            var f = _.bind(gotoGame, {}, { _id: code });
            setTimeout(f, constants.CIRCLE_POSITION_SCREEN_DURATION);
        }
        else {
            socket.connect({ channel: code });
            pubsub.subscribe(constants.EVENTS.GAME_STARTED, function(msg, game) {
                gotoGame(_.extend({ _id: code }, game));
            });
        }
    }

    function addParamIfExists(paramString, params, key) {
        if (params) {
            var value = params[key];
            if (value) {
                paramString += '&' + key + '=' + value;
            }
        }
        return paramString;
    }

    function addParamsIfExist(paramString, params, keys) {
        _.each(keys, _.bind(addParamIfExists, {}, paramString, params));
        return paramString;
    }

    function playerJoined(player) {
        pubsub.publishSync(constants.EVENTS.PLAYER_JOIN, player);
    }
});