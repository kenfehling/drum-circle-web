/**
 * Shows players where to place themselves in the circle
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require */

require(['jquery', 'lodash', 'drum-circle-library/constants',
        'pubsub-js', 'drum-circle-library/utils', 'app/browser_utils'],
function($, _, constants, pubsub, utils, browser_utils) {
    "use strict";
    var players = [];

    function hasActivePlayerWithColor(color) {
        return _.where(players, { color: color, active: true }).length > 0;
    }

    $(document).ready(function() {
        var yourColor = parseInt(utils.getHashParams().color);
        var $grid = $("#grid");

        browser_utils.createTable({
            $el: $grid,
            rows: 5,
            cols: 5
        });

        var $allCells = $grid.find('td');
        
        function getCell(row, col) {
            return $($($('#grid').find('tr')[row - 1]).find('td')[col - 1]);    
        }

        // Based (loosely) on a clock: twelve is 12 o'clock (top center)
        var $12 = getCell(1, 3);
        var $1 = getCell(1, 4);
        var $3 = getCell(3, 5);
        var $4 = getCell(5, 5);
        var $5 = getCell(5, 4);
        var $6 = getCell(5, 3);
        var $7 = getCell(5, 2);
        var $8 = getCell(5, 1);
        var $9 = getCell(3, 1);
        var $11 = getCell(1, 2);

        var $CELLS_BY_NUM_PLAYERS = [
            [],
            [$12],
            [$12, $6],
            [$12, $8, $4],
            [$12, $3, $6, $9],
            [$12, $3, $5, $7, $9],
            [$1, $3, $5, $7, $9, $11]
        ];

        function clearAllCells() {
            $allCells.html('');
            $allCells.removeClass();
        }

        function sortPlayers() {
            players = _.sortBy(players, function(player) {
                return _.findIndex(_.range(constants.MAX_PLAYERS), function(c) {
                    return player.color === c;
                });
            });
        }

        function drawPlayer(player, $cell) {
            $cell.addClass('player');
            $cell.addClass(constants.PLAYER_COLORS[player.color]);
            $cell.html(player.color === yourColor ? 'You' : '♫');
        }

        function drawPlayers() {
            clearAllCells();
            sortPlayers();
            var $cells = $CELLS_BY_NUM_PLAYERS[players.length];
            _.each(players, function(player, i) {
                drawPlayer(player, $cells[i]);
            });
        }

        function addPlayer(player) {
            if (!hasActivePlayerWithColor(player.color)) {
                player.active = true;
                players.push(player);
                drawPlayers();
            }
        }

        function removePlayer(player) {
            utils.removeItemFromArrayWhere(players, { color: player.color });
            drawPlayers();
        }

        pubsub.subscribe(constants.EVENTS.PLAYER_JOIN, function(msg, player) {
            addPlayer(player);
        });

        pubsub.subscribe(constants.EVENTS.PLAYER_LEAVE, function(msg, player) {
            removePlayer(player);
        });
    });
});