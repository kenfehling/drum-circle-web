/**
 * Background synth pad
 * Works on Chrome and Safari
 *
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global define */

define(['jquery', 'lodash', 'pubsub-js', 'drum-circle-library/constants',
        'app/web_audio_utils', 'app/synth', 'drum-circle-library/utils'],
function($, _, pubsub, constants, web_audio_utils, Synth, utils) {
    "use strict";
    var changeInterval;
    var firstMeasure;

    pubsub.subscribe(constants.EVENTS.TEMPO_SET, function(msg, tempo) {
        changeInterval = pickChangeInterval(tempo);
    });

    function pickChangeInterval(tempo) {
        var choices = constants.SYNTH_PAD_BEAT_DURATIONS_BY_TEMPO[tempo];
        return _.sample(choices);
    }

    function shouldChangeNote(beat) {
        switch (changeInterval) {
            case 1: return true;
            case 2: return beat === 1 || beat === 3;
            case 4: return beat === 1;
            default: return false;
        }
    }

    function getSynthNotes() {
        var noteRange = constants.SYNTH_PAD_NOTE_RANGE;
        return _.filter(constants.NOTES, function(note) {
            return note >= noteRange[0] && note <= noteRange[1];
        });
    }

    function onSynthSetup() {
        pubsub.publish(constants.EVENTS.SYNTH_STARTED);
    }

    function getIncreasedVolume(measureCount) {
        var FADE_IN_START_MEASURE = 3;
        var FADE_DURATION_IN_MEASURES = 16;
        var FADE_IN_END_MEASURE = FADE_IN_START_MEASURE + FADE_DURATION_IN_MEASURES;
        if (measureCount > FADE_IN_END_MEASURE) {
            return constants.MAX_SYNTH_VOLUME;
        }
        else if (measureCount < FADE_IN_START_MEASURE) {
            return 0;
        }
        else {
            return utils.scaleValue({
                inputValue: measureCount,
                inputRange: [FADE_IN_START_MEASURE, FADE_IN_END_MEASURE],
                outputRange: [0, constants.MAX_SYNTH_VOLUME]
            });
        }
    }

    return {
        setup: function(ctx) {
            var notes = getSynthNotes();
            var sawFreqTable = [[
                0.9, 0.8, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45,
                0.4, 0.35, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3
            ], [
                0.9, 0.8, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45,
                0.4, 0.35, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3
            ]];
            var synth = new Synth({
                context: ctx,
                oscillators: [
                    { frequencyTable: sawFreqTable, volume: 1.0 },
                    { frequencyTable: sawFreqTable, volume: 0.8, detune: 700 }
                ],
                envelope_params: constants.SYNTH_PAD_ENVELOPE,
                eq_params: {
                    type: "lowpass",
                    frequency: 400,
                    Q: 0.8
                },
                callback: onSynthSetup
            });

            pubsub.subscribe(constants.EVENTS.NEXT_BEAT, function(msg, beat) {
                if (shouldChangeNote(beat)) {
                    synth.setFrequency(selectRandomNote());
                }
            });

            pubsub.subscribe(constants.EVENTS.NEXT_MEASURE, function(msg, measure) {
                if (!firstMeasure) {
                    firstMeasure = measure;
                }
                var measureCount = measure - firstMeasure;
                synth.setVolume(getIncreasedVolume(measureCount));
            });

            function selectRandomNote() {
                return _.sample(notes);
            }
        }
    };
});