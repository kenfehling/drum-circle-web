/**
 * Gets the difference between client and server clock.
 * Publishes a TIME_SYNCHRONIZE event when it's finished.
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global define */

define(['jquery', 'lodash', 'drum-circle-library/constants'],
function($, _, constants) {
    "use strict";

    function toAbsolute(url) {
        var host = window.location.hostname;
        if (host.indexOf('localhost') === 0 || host.indexOf('192.168') === 0) {
            return 'http://' + host + ":" + constants.DEFAULT_API_PORT + url;
        }
        else {
            return constants.REMOTE_API_HOST + url;
        }
    }

    function get(url, callback) {
        $.getJSON(toAbsolute(url), callback);
    }

    function post(url, data, callback) {
        $.post(toAbsolute(url), data, callback, 'json');
    }

    return {
        getTime: _.bind(get, {}, '/time'),
        getGamePlayers: function(code, callback) {
            get('/games/' + code + '/players', callback);
        },
        sendEffect: function(code, color, effect, callback) {
            post('/games/' + code + '/' + color + '/' + effect, {}, callback);
        }
    };
});