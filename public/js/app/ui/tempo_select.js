/**
 * Fills tempo select drop down with tempo options and detects selection change
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require */

require(['jquery', 'lodash', 'drum-circle-library/constants',
        'pubsub-js', 'app/browser_utils'],
function($, _, constants, pubsub, browser_utils) {
    "use strict";

    $(document).ready(function() {
        var $tempo = $('#tempo');
        if ($tempo) {
            browser_utils.fillSelectBox({
                $select: $tempo,
                items: constants.TEMPO.CHOICES,
                defaultItem: constants.TEMPO.DEFAULT
            });
            pubsub.publish(constants.EVENTS.TEMPO_SET, constants.TEMPO.DEFAULT);
            $tempo.change(function(event) {
                var tempo = event.target.value;
                pubsub.publish(constants.EVENTS.TEMPO_SET, tempo);
            });
        }
    });
});