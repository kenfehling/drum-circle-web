/**
 * Tests for client side game model
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require, describe, it, before, after, beforeEach */

var expect = require('chai').expect;
var sinon = require('sinon');
var pubsub = require('pubsub-js');
var requireUncached = require('require-uncached');
var constants = require('drum-circle-library/constants');
var utils = require('drum-circle-library/utils');

describe('Game', function() {
    "use strict";
    var game;

    beforeEach(function() {
        game = requireUncached('../../../public/js/app/models/game');
    });

    it('dispatches TEMPO_SET event', function() {
        var callback = sinon.spy();
        pubsub.subscribe(constants.EVENTS.TEMPO_SET, callback);
        game.setTempo(90);
        expect(callback.called).to.be.true;
    });

    it('dispatches START_TIME_SET event', function() {
        var callback = sinon.spy();
        pubsub.subscribe(constants.EVENTS.START_TIME_SET, callback);
        game.setStartTime(12345);
        expect(callback.called).to.be.true;
    });
});