/**
 * The logic that sits behind the synth test UI.
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require */

require(['jquery', 'lodash', 'drum-circle-library/constants', 'pubsub-js',
        'app/synth_pad'],
function($, _, constants, pubsub, synth_pad) {
    "use strict";
    var LOCKOUT_TIME = 150;
    var lastPress = 0;

    $(document).ready(function () {
        var $start_button = $('#start-button');
        var $note_buttons = $('#note-buttons');
        var $all_note_buttons = $('.note');

        pubsub.subscribe(constants.EVENTS.SYNTH_STARTED, function() {
            $note_buttons.css('visibility', 'visible');
        });

        function playNote(note) {
            synth_pad.setFrequency(note);
        }

        $start_button.click(function() {
            pubsub.publishSync(constants.EVENTS.START_PRESSED);
            $start_button.css('visibility', 'hidden');
        });

        $all_note_buttons.on('mouseup touchend', function() {
            lastPress = new Date().getTime();
        });

        $all_note_buttons.on('mousedown touchstart', function(event) {
            if (lastPress + LOCKOUT_TIME < new Date().getTime()) {
                var note = event.target.id;
                playNote(constants.NOTES[note]);
                lastPress = new Date().getTime();
            }
        });
    });
});