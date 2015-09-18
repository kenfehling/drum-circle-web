/**
 * Controls audio pausing/unpausing and the beat.
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global define */

define(['pubsub-js', 'drum-circle-library/constants',
         'drum-circle-library/time_utils', 'app/steadyBeat'],
function(pubsub, constants, time_utils, steadyBeat) {
    "use strict";
    var beatsPerMeasure = constants.BEATS_PER_MEASURE;
    var tempo, notesPerBeat = 1;
    var timeDifference, startTime, measureNumber = 0;
    var lastNoteNumber, lastBeatNumber;

        function resetIfNeeded() {
        if (steadyBeat.isStarted()) {
            steadyBeat.stop();
        }
        startBeat();
    }

    pubsub.subscribe(constants.EVENTS.NOTES_PER_BEAT_SET, function(msg, npb) {
        notesPerBeat = npb;
        resetIfNeeded();
    });

    pubsub.subscribe(constants.EVENTS.TEMPO_SET, function(msg, t) {
        tempo = t;
        resetIfNeeded();
    });

    pubsub.subscribe(constants.EVENTS.START_TIME_SET, function(msg, st) {
        startTime = st;
        resetIfNeeded();
    });

    function startBeat() {
        if (tempo && startTime && notesPerBeat) {
            var beatDuration = (60000 / tempo);
            var noteDuration = beatDuration / notesPerBeat;
            var measuresInCycle = 1;
            beatDuration = 60000 / tempo;
            steadyBeat.setReturnLoop(function () {
                var noteNumber = time_utils.calculateNoteNumber({
                    clientTime: new Date().getTime(),
                    beatDuration: beatDuration,
                    timeDifference: timeDifference,
                    beatsPerMeasure: beatsPerMeasure,
                    notesPerBeat: notesPerBeat,
                    measuresInCycle: measuresInCycle
                });
                if (notesPerBeat === 1 || noteNumber % notesPerBeat === 1) {
                    var beatNumber = Math.ceil(noteNumber / notesPerBeat);
                    nextBeat(beatNumber);
                }
                if (!isNaN(noteNumber) && noteNumber !== lastNoteNumber) {
                    pubsub.publishSync(constants.EVENTS.NEXT_NOTE, noteNumber);
                    lastNoteNumber = noteNumber;
                }
            });
            calculateMeasureNumber();
            var timeUntilNextBeat = time_utils.calculateTimeUntilNextBeat({
                clientTime: new Date().getTime(),
                beatDuration: beatDuration,
                timeDifference: timeDifference,
                beatsPerMeasure: beatsPerMeasure,
                notesPerBeat: notesPerBeat
            });
            steadyBeat.start(noteDuration, timeUntilNextBeat, constants.GRANULARITY);
        }
    }

    pubsub.subscribe(constants.EVENTS.TIME_SYNCHRONIZED, function(msg, data) {
        timeDifference = data.timeDifference;
    });

    function nextBeat(beatNumber) {
        if (!isNaN(beatNumber) && beatNumber !== lastBeatNumber) {
            pubsub.publishSync(constants.EVENTS.NEXT_BEAT, beatNumber);
            if (beatNumber === 1) {
                calculateMeasureNumber();
            }
            lastBeatNumber = beatNumber;
        }
    }

    function calculateMeasureNumber() {
        measureNumber = time_utils.calculateMeasureNumber({
            startTime: startTime,
            clientTime: new Date().getTime(),
            beatDuration: (60000 / tempo),
            timeDifference: timeDifference,
            beatsPerMeasure: beatsPerMeasure
        });
        if (!isNaN(measureNumber)) {
            pubsub.publishSync(constants.EVENTS.NEXT_MEASURE, measureNumber);
        }
    }

    pubsub.subscribe(constants.EVENTS.PLAY_AUDIO, function() {
        startBeat();
    });

    pubsub.subscribe(constants.EVENTS.PAUSE_AUDIO, function() {
        if (steadyBeat.isStarted()) {
            steadyBeat.stop();
        }
    });
});