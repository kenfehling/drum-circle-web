/**
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global define, unescape, alert */

define(['jquery', 'lodash', 'pubsub-js', 'drum-circle-library/constants',
         'drum-circle-library/utils', 'app/browser_utils', 'app/web_audio_utils'],
    function($, _, pubsub, constants, utils, browser_utils, web_audio_utils) {
    "use strict";
    var ctx;
    var buffer;
    var gainNode;
    var bandPassFilter;
    var drum_kit;
    var drum;
    var effects = [];
    var sprite = createSprite();
    var effectString = getEffectString();

    pubsub.subscribe(constants.EVENTS.WEB_AUDIO_CONTEXT_CREATED, function(msg, c) {
        ctx = c;
        var url = getDrumUrl({
            drum_kit: drum_kit,
            drum: drum,
            effects: effects
        });
        loadSound(url, function(loadedBuffer) {
            buffer = loadedBuffer;
        });
        gainNode = web_audio_utils.createGain(ctx, constants.DRUM_VOLUME);
        if (constants.USE_DRUM_EQ) {
            bandPassFilter = createBandPassFilter();
            gainNode.connect(bandPassFilter);
            web_audio_utils.monoToStereo(ctx, bandPassFilter, ctx.destination);
        }
        else {
            web_audio_utils.monoToStereo(ctx, gainNode, ctx.destination);
        }
    });

    function createSprite() {
        var length = constants.SECONDS_PER_DRUM_SAMPLE;
        return {
            clean: [0, length],
            reverb: [length, length],
            bitcrush: [length * 2, length],
            reverb_bitcrush: [length * 3, length]
        };
    }

    function loadSound(url, callback) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            // request.response is encoded... so decode it now
            ctx.decodeAudioData(request.response, function(loadedBuffer) {
                callback(loadedBuffer);
            }, function(err) {
                throw new Error(err);
            });
        };
        request.send();
    }

    function getDrumUrl() {
        return constants.URLS.DRUMS + drum_kit.path + "/" + drum + ".mp3";
    }

    function getEffectString() {
        if (effects.length === 0) {
            return 'clean';
        }
        else if (effects.length === 1) {
            return effects[0];
        }
        else {
            return "reverb_bitcrush";
        }
    }

    function createBandPassFilter() {
        var bandPassFilter = ctx.createBiquadFilter();
        bandPassFilter.type = bandPassFilter.BANDPASS;
        bandPassFilter.frequency.value =
            utils.average(constants.EQ.DRUM_FREQ_RANGE);
        bandPassFilter.Q.value =
            utils.average(constants.EQ.DRUM_Q_RANGE);
        return bandPassFilter;
    }

    pubsub.subscribe(constants.EVENTS.PLAY_DRUM, function() {
        if (ctx && buffer) {
            var sound = ctx.createBufferSource();
            sound.buffer = buffer;
            web_audio_utils.connect(sound, gainNode);
            var spriteItem = sprite[effectString];
            var position = spriteItem[0];
            var duration = spriteItem[1];
            if (typeof sound.start === 'undefined') {
                sound.noteGrainOn(0, position, duration);
            } else {
                sound.start(0, position, duration);
            }
        }
    });

    function applyEffect(effect) {
        effects = _.union(effects, [effect]);
    }

    function removeEffect(effect) {
        utils.removeItemFromArray(effects, effect);
    }

    pubsub.subscribe(constants.EVENTS.EFFECT_RECEIVE, function(msg, data) {
        var effect = data.effect;
        if (_.contains(constants.EFFECTS.DRUM, effect)) {
            var color = parseInt(data.color);
            var yourColor = parseInt(utils.getHashParams().color);
            if (color === yourColor) {
                if (_.contains(effects, effect)) {
                    removeEffect(effect);
                }
                else {
                    applyEffect(effect);
                }
                effectString = getEffectString();
            }
        }
    });

    function setDrum(kit, d) {
        drum_kit = constants.DRUM_KITS[kit];
        drum = drum_kit.drums[d];
        pubsub.publish(constants.EVENTS.DRUM_SELECTED, drum);
    }

    function selectRandomDrum() {
        setDrum(0, _.sample(_.range(constants.NUM_DRUMS_IN_KIT)));
    }

    pubsub.subscribe(constants.EVENTS.GYROSCOPE_BEND, function(event) {
        if (constants.USE_DRUM_EQ) {
            if (bandPassFilter) {
                var x = event.x;
                var y = event.y;
                bandPassFilter.frequency.value = utils.scaleValue({
                    inputValue: x,
                    inputRange: constants.GYROSCOPE_X_RANGE,
                    outputRange: constants.EQ.DRUM_FREQ_RANGE
                });
                bandPassFilter.Q.value = utils.scaleValue({
                    inputValue: y,
                    inputRange: constants.GYROSCOPE_Y_RANGE,
                    outputRange: constants.EQ.DRUM_Q_RANGE
                });
            }
        }
    });

    $(document).ready(function() {
        var hashParams = utils.getHashParams();
        var drum_kit = hashParams.drum_kit;
        var drum = hashParams.drum;
        if (drum_kit && drum) {
            setDrum(drum_kit, drum);
        }
        else {
            selectRandomDrum();
        }
    });

    return {
        getDrumName: function() {
            return drum;
        }
    };
});