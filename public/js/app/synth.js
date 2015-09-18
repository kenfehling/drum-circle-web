/**
 * Synth object
 * Works on Chrome and Safari
 *
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global define */

define(['lodash', 'pubsub-js', 'drum-circle-library/constants',
        'app/web_audio_utils', 'drum-circle-library/utils', 'adsr'],
function(_, pubsub, constants, web_audio_utils, utils, ADSR) {
    "use strict";

    return function(options) {  // Constructor
        var ctx = options.context;
        var envelope_params = options.envelope_params;
        var oscillator_params = options.oscillators;
        var eq_params = options.eq_params;
        var callback = options.callback || function() {};
        var envelope, envelopeGain, masterGain, pseudoTouchResponse, bandPassFilter;
        var oscillators = [];
        var started = false;

        function setVolume(vol) {
            if (isStarted()) {
                masterGain.gain.value = vol;
            }
        }

        function setBandPassFilterFrequency(frequency) {
            if (bandPassFilter) {
                if (bandPassFilter.frequency.value !== frequency) {
                    bandPassFilter.frequency.value = frequency;
                }
            }
        }

        function setBandPassFilterQ(Q) {
            if (bandPassFilter) {
                if (bandPassFilter.Q.value !== Q) {
                    bandPassFilter.Q.value = Q;
                }
            }
        }

        function stopOscillator(osc) {
            osc.disconnect();
            web_audio_utils.stopOsc(osc);
            utils.removeItemFromArray(oscillators, osc);
        }

        pubsub.subscribe(constants.EVENTS.GYROSCOPE_BEND, function(msg, event) {
            var x = event.x;
            var y = event.y;
            setBandPassFilterFrequency(utils.scaleValue({
                inputValue: x,
                inputRange: constants.GYROSCOPE_X_RANGE,
                outputRange: constants.EQ.SYNTH_FREQ_RANGE
            }));
            setBandPassFilterQ(utils.scaleValue({
                inputValue: y,
                inputRange: constants.GYROSCOPE_Y_RANGE,
                outputRange: constants.EQ.SYNTH_Q_RANGE
            }));
        });

        pubsub.subscribe(constants.EVENTS.PAUSE_AUDIO, function() {
            //_.each(oscillators, stopOscillator);
        });

        function _start() {
            started = true;
            masterGain = web_audio_utils.createGain(ctx);
            envelopeGain = web_audio_utils.createGain(ctx);

            envelope = ADSR(ctx);
            envelope.attack = envelope_params[0];  // seconds
            envelope.decay = envelope_params[1];  // seconds
            envelope.sustain = envelope_params[2];  // multiply gain.gain.value
            envelope.release = envelope_params[3]; // seconds
            envelope.connect(envelopeGain.gain);
            
            pseudoTouchResponse = web_audio_utils.pseudoTouchResponse(
                ctx, constants.PSEUDO_TOUCH_RESPONSE_VARIATION);

            _.each(oscillator_params, function(osc) {
                osc = web_audio_utils.createOscillator(ctx, osc);
                osc.gain.connect(pseudoTouchResponse);
                web_audio_utils.startOsc(osc);
                oscillators.push(osc);
            });

            bandPassFilter = ctx.createBiquadFilter();
            bandPassFilter.type = bandPassFilter.BANDPASS;
            bandPassFilter.frequency.value = 500;
            bandPassFilter.frequency.value = 500;
            bandPassFilter.Q.value = 0.5;

            web_audio_utils.chain(pseudoTouchResponse, envelopeGain, masterGain);

            if (eq_params) {
                var eq = ctx.createBiquadFilter();
                bandPassFilter.type = eq_params.type;
                bandPassFilter.frequency.value = eq_params.frequency;
                bandPassFilter.Q.value = eq_params.Q;
                web_audio_utils.chain(masterGain, eq, bandPassFilter);
            }
            else {
                masterGain.connect(bandPassFilter);
            }

            web_audio_utils.monoToStereo(ctx, bandPassFilter, ctx.destination);
        }

        function isStarted() {
            return typeof ctx !== 'undefined' && started;
        }

        _start();
        if (callback) {
            setVolume(0);
            callback();
        }

        return {
            setFrequency: function(freq) {
                if (isStarted()) {
                    var now = ctx.currentTime;
                    envelope.stop(now);
                    pseudoTouchResponse.trigger();
                    envelope.start(now);

                    _.each(oscillators, function(osc) {
                        osc.frequency.value = freq;
                    });
                }
            },
            getVolume: function() {
                return masterGain.gain.value;
            },
            setVolume: setVolume,
            isStarted: isStarted
        };
    };
});