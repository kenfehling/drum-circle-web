/**
 * Picks notes per beat based on screen size
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global define */

define(['jquery', 'lodash', 'drum-circle-library/constants'],
function($, _, constants) {
    "use strict";
    var MARGIN = 28;

    return {
        pickNotesPerBeat: function(buttonWidth) {
            var chosen = _.min(constants.BEAT_DIVISIONS);  // Use lowest as default
            _.each(constants.BEAT_DIVISIONS, function(choice) {
                var computedWidth = buttonWidth * choice;
                if (computedWidth < $(document).width() - MARGIN) {
                    if (choice > chosen) {
                        chosen = choice;
                    }
                }
            });
            return chosen;
        }
    };
});