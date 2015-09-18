/**
 * The logic that sits behind the processing test UI.
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require, Processing */

require(['jquery', 'lodash', 'pubsub-js', 'drum-circle-library/constants'],
function($, _, pubsub, constants) {
    "use strict";
    var CANVAS_ID = 'pjs-canvas';

    $(document).ready(function () {
        var $all_note_buttons = $('.note');

        $all_note_buttons.on('mouseup touchend', function() {

        });

        $all_note_buttons.on('mousedown touchstart', function(event) {
            var note = event.target.id;
            pubsub.publish(constants.EVENTS.NEXT_NOTE, note);
        });

        pubsub.subscribe(constants.EVENTS.NEXT_NOTE, function(msg, noteNumber) {
            var pjs = getProcessingCanvas();
            pjs.drawText(noteNumber);
        });
    });

    function getProcessingCanvas() {
        return Processing.getInstanceById(CANVAS_ID);
    }
});