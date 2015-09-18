/**
 * Useful abstractions over the Web Audio API
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global define */

define(['lodash'], function(_) {
    "use strict";

    function isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    // Supports multiple inputs and support for Tuna effects
    function connect(input, output) {
        if (isArray(input)) {
            _.each(input, function(item) {
                connect(item, output);
            });
        }
        else {
            try {
                input.connect(output);  // For native Web Audio
            }
            catch (err) {
                input.connect(output.input);  // For Tuna
            }
        }
    }

    function createOscillator(ctx, options) {
        var oscillator = ctx.createOscillator();
        options = options || {};
        if (options.frequencyTable) {
            setOscFrequencyTable(ctx, oscillator, options.frequencyTable);
        }
        else if (options.type) {
            oscillator.type = options.type;
        }
        if (options.frequency) {
            oscillator.frequency.value = options.frequency;
        }
        if (options.detune) {
            oscillator.detune.value = options.detune;
        }
        var gain = createGain(ctx, options.volume);
        oscillator.connect(gain);
        oscillator.gain = gain;
        return oscillator;
    }

    function createGain(ctx, level) {
        var gain = (typeof ctx.createGain === 'undefined') ?
            ctx.createGainNode() : ctx.createGain();
        if (typeof level !== 'undefined') {
            gain.gain.value = level;
        }
        return gain;
    }

    function startOsc(osc, time) {  // Comptability with both Chrome and Safari
        osc[osc.start ? 'start' : 'noteOn'](time);
    }

    function stopOsc(osc, time) {  // Comptability with both Chrome and Safari
        osc[osc.stop ? 'stop' : 'noteOff'](time);
    }

    // curves: 2 sets of values, one for sine curve, one for cosine curve
    // First value is DC offset, then fundamental freq & 15 harmonics
    function setOscFrequencyTable(ctx, osc, curves) {
        var table = createFrequencyTable(ctx, curves[0], curves[1]);
        osc[osc.setWaveTable ? 'setWaveTable' : 'setPeriodicWave'](table);
    }

    function convertToFrequencyTableArray(array) {
        array.splice(0, 0, 0);  // Insert a 0 for DC offset
        return new Float32Array(array);
    }

    function createFrequencyTable(ctx, curve1, curve2) {
        curve1 = convertToFrequencyTableArray(curve1);
        curve2 = convertToFrequencyTableArray(curve2);
        return ctx[ctx.createWaveTable ?
                'createWaveTable' : 'createPeriodicWave'](curve1, curve2);
    }

    function randomizeIfRange(param) {
        if (isArray(param)) {
            var low = param[0];
            var high = param[1];
            return Math.random() * (high - low) + low;
        }
        return param;
    }

    return {
        lfo: function(ctx, options) {
            var target = options.target;
            var frequency = options.frequency;
            var modulator = createOscillator(ctx, {
                type: options.type,
                frequencyTable: options.frequencyTable,
                volume: options.range
            });
            modulator.frequency.value = frequency;
            modulator.gain.connect(target);
            startOsc(modulator);
            return { frequency: modulator.frequency };
        },

        chain: function() {
            var n = arguments.length;
            for (var i = 1; i < n; i++) {
                connect(arguments[i - 1], arguments[i]);
            }
        },

        pseudoTouchResponse: function(ctx, variation) {
            var gain = createGain(ctx), on = true;
            gain.trigger = function() {
                if (on) {
                    gain.value = Math.random() * variation + 1 - variation;
                }
                else {
                    gain.gain.value = 1.0;
                }
            };
            gain.toggle = function(b) {
                on = b;
            };
            return gain;
        },

        monoToStereo: function(ctx, input, output) {
          var splitter = ctx.createChannelSplitter(2);
          var merger = ctx.createChannelMerger(2);
          input.connect(splitter);
          splitter.connect(merger, 0, 0);
          splitter.connect(merger, 0, 1);
          merger.connect(output);
        },

        split: function(ctx, src, dests) {
            var splitter = ctx.createChannelSplitter(dests.length);
            src.connect(splitter);
            _.each(dests, function(dest, i) {
                splitter.connect(dest, i);
            });
        },
        
        createAudioContext: function(callback, errback) {
            var ContextClass = (window.AudioContext ||
                window.webkitAudioContext ||
                window.mozAudioContext ||
                window.oAudioContext ||
                window.msAudioContext);
            if (!ContextClass) {
                errback("Web Audio API not available");
            }

            var ctx = new ContextClass();

            // All this craziness is required for iOS
            var osc = createOscillator(ctx); // .. and discard it.
            startOsc(osc);

            // This gets the clock running at some point.
            var count = 0;
            function wait() {
                if (ctx.currentTime === 0) {
                    // Not ready yet.
                    ++count;
                    if (count > 600) {
                        errback('Web Audio timeout');
                    } else {
                        setTimeout(wait, 100);
                    }
                } else {
                    // Ready. Pass on the valid audio audioContext.
                    callback(ctx);
                }
            }
            wait();
        },
        startOsc: startOsc,
        stopOsc: stopOsc,
        createFrequencyTable: createFrequencyTable,
        setOscFrequencyTable: setOscFrequencyTable,
        createGain: createGain,
        createOscillator: createOscillator,
        connect: connect
    };
});