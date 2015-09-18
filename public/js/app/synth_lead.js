/**
 * Synth lead
 * Works on Chrome and Safari
 *
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global define */

define(['jquery', 'lodash', 'pubsub-js', 'drum-circle-library/constants',
        'app/web_audio_utils', 'app/synth', 'app/drums'],
function($, _, pubsub, constants, web_audio_utils, Synth, drums) {
    "use strict";
    var tempo;

    pubsub.subscribe(constants.EVENTS.TEMPO_SET, function(msg, t) {
        tempo = t;
    });

    function getSynthNotes() {
        var drum = drums.getDrumName();
        var notes = constants.SYNTH_LEAD_NOTES[drum];
        if (!notes) {
            notes = constants.SYNTH_LEAD_NOTES.default;
        }
        return notes;
    }

    function onSynthSetup() {

    }

    return {
        setup: function(ctx) {
            var notes = getSynthNotes();
            //var d = 60/tempo;
            var synth = new Synth({
                context: ctx,
                oscillators: [
                    { type: 'sine', volume: 0.1 }
                    //{ type: 'sine', volume: 0.005, detune: 336 }
                ],
                envelope_params: [0.05, 0.5, 0.1, 0.05],
                callback: onSynthSetup
            });

            pubsub.subscribe(constants.EVENTS.PLAY_DRUM, function(msg, data) {
                var noteNumber = data.noteNumber;
                var note = selectNote(noteNumber);
                if (note) {
                    synth.setFrequency(note);
                }
            });

            function selectNote(noteNumber) {
                if (noteNumber % 4 === 1) {
                    return notes[0];
                }
                else if (noteNumber % 2 === 1) {
                    return notes[1];
                }
                else {
                    return null;
                }
            }
        }
    };
});