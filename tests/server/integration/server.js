/**
 * Integration tests for web server
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require, describe, it, context, before, beforeEach */

var hippie = require('hippie');
var expect = require('chai').expect;
var server = require('../../../server');
var constants = require('drum-circle-library/constants');
var urls = require('drum-circle-library/urls');
var utils = require('drum-circle-library/utils');
var test_utils = require('drum-circle-library/test_utils');

describe('server', function () {
    "use strict";

    function createGame(callback) {
        hippie(server)
            .json()
            .get('/create-game')
            .expectStatus(302)
            .end(function (err, res) {
                var redirectLocation = res.headers.location;
                var code = urls.getGameCodeFromUrl(redirectLocation);
                callback(code, redirectLocation);
            });
    }

    function startGame(code, callback) {
        hippie(server)
            .json()
            .post('/start-game')
            .send({
                code: code,
                running: 1,
                tempo: 60,
                drum_kit: 0
            })
            .expectStatus(302)
            .expectValue('running', true)
            .end(callback);
    }

    function joinGame(code, callback) {
        hippie(server)
            .json()
            .get('/join-game/?code=' + code)
            .expectStatus(302)
            .end(callback);
    }

    function fillGame(code, done) {
        var i = 0;
        function join() {
            joinGame(code, function() {
                i += 1;
                if (i >= constants.MAX_PLAYERS) {
                    done();
                }
                else {
                    join();
                }
            });
        }
        join();
    }

    function getParams(res) {
        var redirectLocation = res.headers.location;
        test_utils.exists(redirectLocation);
        return utils.getHashParams(redirectLocation);
    }

    describe('/create-game', function () {
        it('creates a game', function (done) {
            createGame(function () {
                done();
            });
        });
    });

    describe('/start-game', function() {
        context('game exists', function() {
            var code;
            beforeEach(function(done) {
                createGame(function(gameCode) {
                    code = gameCode;
                    done();
                });
            });
            it('sets running to true', function(done) {
                startGame(code, function() {
                    done();
                });
            });
        });
        context('game does not exist', function() {
            var code = 'blahhh';
            it('returns a 404 error', function(done) {
                hippie(server)
                    .json()
                    .post('/start-game')
                    .send({
                        code: code,
                        running: 1,
                        tempo: 60,
                        drum_kit: 0
                    })
                    .expectStatus(404)
                    .end(done);
            });
        });
    });

    describe('/join-game', function () {
        context('game exists', function() {
            var code;
            beforeEach(function (done) {
                createGame(function (gameCode) {
                    code = gameCode;
                    done();
                });
            });

            it('sends color and drum', function (done) {
                joinGame(code, function (err, res, body) {
                    var redirectLocation = res.headers.location;
                    test_utils.exists(redirectLocation);
                    var params = utils.getHashParams(redirectLocation);
                    test_utils.exists(params.color);
                    test_utils.exists(params.drum);
                    done();
                });
            });

            context('game is full', function() {
                beforeEach(function (done) {
                    fillGame(code, done);
                });

                it('will return an error', function(done) {
                    hippie(server)
                        .json()
                        .get('/join-game/?code=' + code)
                        .expectStatus(403)
                        .end(done);
                });
            });

            context('game not started', function () {
                it('does not send back start time', function (done) {
                    joinGame(code, function (err, res, body) {
                        var params = getParams(res);
                        expect(params.start_time).to.be.undefined;
                        done();
                    });
                });
            });
            context('game already started', function () {
                beforeEach(function (done) {
                    createGame(function (gameCode) {
                        code = gameCode;
                        startGame(code, function () {
                            done();
                        });
                    });
                });
                it('sends start time, drum kit, and tempo', function (done) {
                    joinGame(code, function (err, res, body) {
                        var params = getParams(res);
                        test_utils.exists(params.start_time);
                        test_utils.exists(params.drum_kit);
                        test_utils.exists(params.tempo);
                        done();
                    });
                });
            });
        });

        context('game does not exist', function() {
            var code = 'blahhh';
            it('returns a 404 error', function (done) {
                hippie(server)
                    .json()
                    .get('/join-game/?code=' + code)
                    .expectStatus(404)
                    .end(done);
            });
        });
    });

    describe('/enter-open-session', function () {
        it('sends color, drum kit, drum, tempo, and start time', function (done) {
            hippie(server)
                .json()
                .post('/enter-open-session')
                .send({
                    tempo: 60,
                    drum_kit: 0,
                    drum: 0,
                    color: 0
                })
                .expectStatus(302)
                .end(function (err, res, body) {
                    var params = getParams(res);
                    test_utils.exists(params.color);
                    test_utils.exists(params.drum_kit);
                    test_utils.exists(params.drum);
                    test_utils.exists(params.tempo);
                    test_utils.exists(params.start_time);
                    done();
                });
        });
    });
});