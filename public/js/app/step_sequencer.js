/**
 * Step sequencer controller
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require */

require(['jquery', 'lodash', 'drum-circle-library/constants', 'pubsub-js',
        'app/screen_notes_picker', 'drum-circle-library/utils',
        'app/browser_utils', 'drum-circle-library/time_utils'],
function($, _, constants, pubsub, screen_notes_picker, utils, browser_utils, time_utils) {
    "use strict";
    var notesPerBeat, drum;
    var savedPatterns = {};
    var patternChanged = false;

    pubsub.subscribe(constants.EVENTS.DRUM_SELECTED, function(msg, d) {
        drum = d;
    });

    $(document).ready(function () {
        var BUTTON_CLASS = 'sequencer-button';
        var BUTTON_WIDTH = browser_utils.getCssSizeWithMargins([BUTTON_CLASS])[0];
        var $grid = $('#grid');
        var color = utils.getHashParams().color;
        $grid.addClass(constants.PLAYER_COLORS[color]);

        $(window).on('orientationchange resize', function() {
            calculateNotesPerBeat();
        });

        var EFFECTS = {
            silence: function() {
                var numNotes = notesPerBeat * constants.BEATS_PER_MEASURE;
                _.each(_.range(numNotes), function(note, i) {
                    turnNoteOff(i + 1);
                });
            },
            random: function() {
                var numNotes = notesPerBeat * constants.BEATS_PER_MEASURE;
                _.each(_.range(numNotes), function(note, i) {
                    (Math.random() > 0.5 ? turnNoteOn : turnNoteOff)(i + 1);
                });
            }
        };

        function getSavedPattern(npb) {
            if (typeof savedPatterns[npb] !== 'undefined') {
                return savedPatterns[npb];
            }
            else {
                return null;
            }
        }

        pubsub.subscribe(constants.EVENTS.EFFECT_RECEIVE, function(msg, data) {
            if (color === data.color) {
                var effect = data.effect;
                if (_.contains(_.keys(EFFECTS), effect)) {
                    EFFECTS[effect]();
                }
            }
        });

        pubsub.subscribe(constants.EVENTS.NOTES_PER_BEAT_SET, function(msg, npb) {
            var newPattern;
            if (notesPerBeat && notesPerBeat > 0) {
                if (notesPerBeat !== npb) {
                    var oldPattern = getPattern();
                    if (patternChanged && _.some(oldPattern)) {
                        savedPatterns = {};
                        savedPatterns[notesPerBeat] = oldPattern;
                    }
                    var savedPattern = getSavedPattern(npb);
                    if (savedPattern) {
                        newPattern = savedPattern;
                    }
                    else {
                        var savedNpb = _.find(_.keys(savedPatterns), _.identity);
                        if (savedNpb) {
                            newPattern = time_utils.convertPattern({
                                pattern: savedPatterns[savedNpb],
                                fromNotesPerBeat: savedNpb,
                                toNotesPerBeat: npb
                            });
                        }
                        else if (patternChanged) {
                            newPattern = time_utils.convertPattern({
                                pattern: oldPattern,
                                fromNotesPerBeat: notesPerBeat,
                                toNotesPerBeat: npb
                            });
                        }
                        else {
                            newPattern = getDefaultPattern(npb);
                        }
                    }
                    patternChanged = false;
                    setupGrid(npb);
                    loadPattern(newPattern);
                }
            }
            else {
                setupGrid(npb);
            }
            notesPerBeat = npb;
        });

        pubsub.subscribe(constants.EVENTS.INITIALIZE_AUDIO, function() {
            calculateNotesPerBeat();
            loadPattern(getDefaultPattern());
        });

        function getDefaultPattern(npb) {
            var drumPatterns = constants.DEFAULT_PATTERNS[drum];
            if (!drumPatterns) {
                drumPatterns = constants.DEFAULT_PATTERNS.default;
            }
            return drumPatterns[npb || notesPerBeat];
        }

        function loadPattern(pattern) {
            if (pattern) {
                _.each(pattern, function(note, i) {
                    if (note) {
                        turnNoteOn(i + 1);
                    }
                    else {
                        turnNoteOff(i + 1);
                    }
                });
            }
        }

        function getPattern() {
            return _.map(_.range(1, getGridSize() + 1), function(i) {
                return isNoteOn(i) ? 1 : 0;
            });
        }

        function calculateNotesPerBeat() {
            var npb = screen_notes_picker.pickNotesPerBeat(BUTTON_WIDTH);
            pubsub.publishSync(constants.EVENTS.NOTES_PER_BEAT_SET, npb);
        }

        pubsub.subscribe(constants.EVENTS.NEXT_NOTE, function(msg, noteNumber) {
            $('td').removeClass('active');  // Clear all backgrounds
            var $cell = getNoteCell(noteNumber);
            $cell.addClass('active');
            if (isNoteOn(noteNumber)) {
                pubsub.publishSync(constants.EVENTS.PLAY_DRUM, {
                    noteNumber: noteNumber
                });
            }
        });

        function buttonClicked(event) {
            patternChanged = true;
            var $el = $(event.target);
            if ($el.hasClass("on")) {
                $el.removeClass("on");
            }
            else {
                $el.addClass("on");
            }
        }

        function setupGrid(notesPerBeat) {
            $grid.html('');  // Clear grid
            browser_utils.createTable({
                $el: $grid,
                rows: constants.BEATS_PER_MEASURE,
                cols: notesPerBeat,
                tdCallback: function(data) {
                    var $td = data.$td;
                    var cell = data.cell;
                    $td.addClass(BUTTON_CLASS);
                    $td.attr('id', getNoteCellId(cell + 1));
                    $td.click(buttonClicked);
                }
            });
        }
        function getNoteCellId(note) {
            return 'note-' + note;
        }

        function getNoteCell(note) {
            return $('#' + getNoteCellId(note));
        }

        function getNoteButton(note) {
            return $('#' + getNoteCellId(note));
        }

        function isNoteOn(note) {
            return getNoteButton(note).hasClass("on");
        }

        function turnNoteOn(note) {
            getNoteButton(note).addClass("on");
        }

        function turnNoteOff(note) {
            getNoteButton(note).removeClass("on");
        }

        function getGridSize() {
            return $grid.find('td').size();
        }
    });
});