/**
 * Tests for audio state model
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require, describe, it, before, after, beforeEach, afterEach */

var expect = require('chai').expect;
var sinon = require('sinon');
var constants = require('drum-circle-library/constants');
var pubsub = require('pubsub-js');
var sequencer_state = require('../../../public/js/app/models/sequencer_state');

describe('AudioState', function() {
    "use strict";

    afterEach(function () {
        sequencer_state.reset();
    });

    it('resets', function() {
        sequencer_state.startPlaying();
        sequencer_state.reset();
        expect(sequencer_state.get()).to.equal(constants.STATES.AUDIO.NOT_STARTED);
    });

    it('starts', function() {
        sequencer_state.startPlaying();
        expect(sequencer_state.get()).to.equal(constants.STATES.AUDIO.PLAYING);
    });

    it('sends start signal', function() {
        var callback = sinon.spy();
        pubsub.subscribe(constants.EVENTS.INITIALIZE_AUDIO, callback);
        sequencer_state.startPlaying();
        expect(callback.called).to.be.true;
    });

    it('does send start signal twice', function() {
        var callback = sinon.spy();
        sequencer_state.startPlaying();
        pubsub.subscribe(constants.EVENTS.PAUSE_AUDIO, callback);
        sequencer_state.startPlaying();
        expect(sequencer_state.get()).to.equal(constants.STATES.AUDIO.PLAYING);
    });

    it('does not respond to system pause if not playing yet', function() {
        var callback = sinon.spy();
        pubsub.subscribe(constants.EVENTS.PAUSE_AUDIO, callback);
        sequencer_state.systemPause();
        expect(callback.called).to.be.false;
    });

    it('responds to system pause if playing', function() {
        var callback = sinon.spy();
        sequencer_state.startPlaying();
        pubsub.subscribe(constants.EVENTS.PAUSE_AUDIO, callback);
        sequencer_state.systemPause();
        expect(callback.called).to.be.true;
    });
});