/**
 * CEWIT Laser Light Show!
 * Author: Ken Fehling & Mike Liuzzi
 */

/*jshint strict: true */
/*global define */

define(function (require) {
    "use strict";
    var NOTES_PER_BEAT = 4;
    require('../beat_controller');
    require('../time_synchronizer');
    require('../url_model_populator');

    var $ = require('jquery');
    var paper = require('paper');
    var pubsub = require('pubsub-js');
    var constants = require('drum-circle-library/constants');
    var sequencer_state = require('../models/sequencer_state');

    $(document).ready(function() {
        // Get a reference to the canvas object
        var canvas = document.getElementById('myCanvas');
        // Create an empty project and a view for the canvas:
        paper.setup(canvas);

        pubsub.subscribe(constants.EVENTS.NEXT_MEASURE, function(msg, measure) {
            drawLine('red');
        });

        pubsub.subscribe(constants.EVENTS.NEXT_BEAT, function(msg, beat) {
            drawLine('yellow');
        });

        pubsub.subscribe(constants.EVENTS.NEXT_NOTE, function(msg, noteNumber) {
            drawLine('white');
        });

        function drawLine(color) {
            // Create a Paper.js Path to draw a line into it:
            var path = new paper.Path();
            // Give the stroke a color
            path.strokeColor = color;
            var start = new paper.Point(Math.random() * 200, Math.random() * 200);
            // Move to start and draw a line from there
            path.moveTo(start);
            // Note that the plus operator on Point objects does not work
            // in JavaScript. Instead, we need to call the add() function:
            path.lineTo(start.add([ Math.random() * 200, Math.random() * 200 ]));
            // Draw the view now:
            paper.view.draw();
        }

        pubsub.publishSync(constants.EVENTS.NOTES_PER_BEAT_SET, NOTES_PER_BEAT);
        sequencer_state.startPlaying();
    });
});