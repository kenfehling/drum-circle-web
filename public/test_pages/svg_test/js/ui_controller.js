/**
 * The logic that sits behind the SVG test UI.
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require */

require(['jquery', 'lodash', 'pubsub-js', 'drum-circle-library/constants', 'Snap.svg'],
function($, _, pubsub, constants, Snap) {
    "use strict";
    var ID = "rsr";
    var ORIGINAL_WIDTH = 800;
    var ORIGINAL_HEIGHT = 600;
    var SCALED_WIDTH = 320;
    var SCALED_HEIGHT = 240;
    var COLORS = [ 'Green', 'Red', 'Orange', 'Purple', 'Blue' ];
    var DEFAULT_OPACITY = 0.3;

    function setupSVG() {
        var snap = new Snap("#" + ID);
        Snap.load('./test.svg', function(data){
            snap.append(data);
            var svg = $("#" + ID).find('svg')[0];
            svg.setAttribute('width', SCALED_WIDTH + 'px');
            svg.setAttribute('height', SCALED_HEIGHT + 'px');
            svg.setAttribute('viewBox', '0 0 ' + ORIGINAL_WIDTH + ' ' + ORIGINAL_HEIGHT);
            svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
        });
    }

    function activateColor(color) {
        var $path = getPath(color);
        if ($path.attr('fill-opacity') < 1) {
            $path.attr('fill-opacity', '1');
        }
        else {
            $path.attr('fill-opacity', DEFAULT_OPACITY);
        }
    }

    function getPath(color) {
        return $('#' + color + 'Button');
    }

    $(document).ready(function() {
        var $all_buttons = $('.note');

        $all_buttons.on('mouseup touchend', function() {

        });

        $all_buttons.on('mousedown touchstart', function(event) {
            var note = event.target.id;
            pubsub.publish(constants.EVENTS.NEXT_NOTE, note);
        });

        pubsub.subscribe(constants.EVENTS.NEXT_NOTE, function(msg, noteNumber) {
            activateColor(COLORS[noteNumber - 1]);
        });

        setupSVG();
        _.each(COLORS, function(color) {
            var $path = getPath(color);
            $path.attr('fill-opacity', DEFAULT_OPACITY);
            $path.on('mousedown touchstart', function() {
                activateColor(color);
            });
        });
    });

});