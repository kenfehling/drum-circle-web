/**
 * The logic that sits behind the pattern test UI.
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require */

require(['jquery', 'drum-circle-library/constants', 'pubsub-js',
        'app/browser_utils', 'alertify'],
function($, constants, pubsub, browser_utils, alertify) {
    "use strict";
    var DEFAULT_NOTES_PER_BEAT = 4;

    pubsub.subscribe(constants.EVENTS.NOTES_PER_BEAT_SET, function(msg, npb) {
        $('#notes-per-beat').val(npb);
    });

    function setNotesPerBeat(npb) {
        pubsub.publishSync(constants.EVENTS.NOTES_PER_BEAT_SET, npb);
    }

    $(document).ready(function () {
        var $notes_per_beat = $('#notes-per-beat');

        browser_utils.fillSelectBox({
            $select: $notes_per_beat,
            items: constants.BEAT_DIVISIONS,
            defaultItem: DEFAULT_NOTES_PER_BEAT
        });

        $notes_per_beat.change(function(event) {
            var notesPerBeat = event.target.value;
            setNotesPerBeat(notesPerBeat);
        });

        alertify.alert("Start playing", function() {
            pubsub.publishSync(constants.EVENTS.START_PRESSED);
        });
    });
});