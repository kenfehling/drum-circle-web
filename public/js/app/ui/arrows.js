/**
 * Arrows
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require */

require(['jquery', 'lodash', 'drum-circle-library/constants', 'pubsub-js',
        'app/device_info', 'drum-circle-library/utils', 'app/browser_utils',
        'drum-circle-library/urls', 'Snap.svg'],
function($, _, constants, pubsub, device_info, utils, browser_utils, urls, Snap) {
    "use strict";
    var HIGHLIGHT_DURATION = 1000;  // milliseconds
    var ORIGINAL_WIDTH = 800;
    var ORIGINAL_HEIGHT = 600;
    var SCALED_WIDTH = 240;
    var SCALED_HEIGHT = 180;
    var DEFAULT_OPACITY = 0.3;
    var SVG_FILE = '/images/player_wheel.svg';
    var ID = 'player_wheel';
    var players = [];

    function loadSvg(callback) {
        var snap = new Snap("#" + ID);
        Snap.load(SVG_FILE, function(data){
            snap.append(data);
            var svg = $("#" + ID).find('svg')[0];
            svg.setAttribute('width', SCALED_WIDTH + 'px');
            svg.setAttribute('height', SCALED_HEIGHT + 'px');
            svg.setAttribute('viewBox', '0 0 ' + ORIGINAL_WIDTH + ' ' + ORIGINAL_HEIGHT);
            svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
            callback();
        });
    }

    function getCssColors(colorNames) {
        return _.map(colorNames, function(c) {
            return browser_utils.getCSS('background-color', ['player', c]);
        });
    }

    function highlight($arrow) {
        $arrow.attr('fill-opacity', '1.0');
    }

    function deactivateIndex(index) {
        var $path = getColorIndexPath(index);
        deactivateArrow($path);
    }

    function activateArrow($arrow) {
        $arrow.attr('fill-opacity', '0.9');
    }

    function deactivateArrow($arrow) {
        $arrow.off('click');
        $arrow.attr('fill-opacity', DEFAULT_OPACITY);
    }

    function deactivateAll() {
        _.each(_.range(constants.MAX_PLAYERS), deactivateIndex);
    }

    function getColorIndexPath(index) {
        return $('#Player' + index);
    }

    function setPlayerColor(index, color) {
        var $path = getColorIndexPath(index);
        var $children = $path.find('path');
        $children.attr('fill', color);
    }

    function setPlayerColors(colors) {
        _.each(colors, function(color, index) {
            setPlayerColor(index, color);
        });
    }

    function addPlayer(player) {
        if (!hasActivePlayerWithColor(player.color)) {
            player.active = true;
            players.push(player);
        }
    }

    function hasActivePlayerWithColor(color) {
        return _.where(players, { color: color, active: true }).length > 0;
    }

    function getYourColorNumber() {
        return parseInt(utils.getHashParams().color);
    }

    pubsub.subscribe(constants.EVENTS.PLAYER_JOIN, function(msg, p) {
        addPlayer(p);
    });

    $(document).ready(function() {
        var colorNumberToPathIndexMap = {};
        loadSvg(function() {  // When finished loading SVG
            deactivateAll();
            var colorNames = getColorNames();
            var colorNumbers = getColorNumbers();
            _.each(colorNumbers, function(colorNumber, index) {
                colorNumberToPathIndexMap[colorNumber] = index;
            });
            var colors = getCssColors(colorNames);
            setPlayerColors(colors);
        });

        function getColorNames() {
            if (urls.isInOpenSession(window.location.href)) {
                return constants.OPEN_SESSION_PLAYER_COLORS;
            }
            else {
                var yourColor = constants.PLAYER_COLORS[getYourColorNumber()];
                return _.without(constants.PLAYER_COLORS, yourColor);
            }
        }

        function getColorNumbers() {
            if (urls.isInOpenSession(window.location.href)) {
                return _.range(constants.MAX_PLAYERS - 1);
            }
            else {
                var yourColor = getYourColorNumber();
                return _.without(_.range(constants.MAX_PLAYERS), yourColor);
            }
        }

        function activateColor(colorNumber) {
            var $path = getColorPath(colorNumber);
            activateArrow($path);
        }

        function getColorPath(colorNumber) {
            var index = colorNumberToPathIndexMap[colorNumber];
            return getColorIndexPath(index);
        }

        function activateArrows(effectToSend) {
            var uniqueColors = _.uniq(_.pluck(players, "color"));
            _.each(uniqueColors, function(colorNumber) {
                if (hasActivePlayerWithColor(colorNumber)) {
                    var $arrow = getColorPath(colorNumber);
                    activateArrow($arrow);
                    $arrow.click(function() {
                        arrowPressed($arrow, colorNumber, effectToSend);
                    });
                }
            });
        }

        function arrowPressed($arrow, colorNumber, effectToSend) {
            deactivateAll();
            highlight($arrow);
            setTimeout(function() {
                deactivateArrow($arrow);
            }, HIGHLIGHT_DURATION);
            pubsub.publish(constants.EVENTS.EFFECT_SEND, {
                player: { color: colorNumber },
                effect: effectToSend
            });
        }

        pubsub.subscribe(constants.EVENTS.EFFECT_SELECTED, function(msg, effect) {
            activateArrows(effect);
        });

        pubsub.subscribe(constants.EVENTS.EFFECT_UNSELECTED, deactivateAll);

        pubsub.subscribe(constants.EVENTS.PLAYER_DISCONNECT, function(msg, p) {
            _.findWhere(players, { color: p.color, active: true }).active = false;
        });

        pubsub.subscribe(constants.EVENTS.PLAYER_RECONNECT, function(msg, p) {
            _.findWhere(players, { color: p.color, active: false }).active = true;
        });

        pubsub.subscribe(constants.EVENTS.PLAYER_LEAVE, function(msg, p) {
            utils.removeItemFromArray(players, p);
        });
    });
});