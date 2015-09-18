/**
 * Fills drumkit and drum options and detects selection change
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require */

require(['jquery', 'lodash', 'drum-circle-library/constants',
        'pubsub-js', 'app/browser_utils'],
function($, _, constants, pubsub, browser_utils) {
    "use strict";

    $(document).ready(function() {
        var $drum_kit = $('#drum_kit');
        var $drum = $('#drum');

        function fillDrumOptions() {
            var i = $drum_kit.prop('selectedIndex');
            var drums = constants.DRUM_KITS[i].drums;
            browser_utils.fillSelectBox({
                $select: $drum,
                itemNames: drums,
                //itemNames: _.map(drums, function(d) { return d.toLowerCase(); }),
                random: true
            });
        }

        if ($drum_kit.length > 0) {
            browser_utils.fillSelectBox({
                $select: $drum_kit,
                itemNames: _.pluck(constants.DRUM_KITS, 'name'),
                random: true
            });
            $drum_kit.change(function() {
                fillDrumOptions();
            });

            if ($drum.length > 0) {
                fillDrumOptions();
            }
        }
    });
});