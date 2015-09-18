/**
 * Open session (jump in)
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global define */

define(function (require) {
    "use strict";
    require('../debug/console_redirect');
    require('../ui/browser_warning');
    require('../ui/tempo_select');
    require('../ui/drum_select');

    var $ = require('jquery'),
        constants = require('drum-circle-library/constants'),
        browser_utils = require('../browser_utils');

    $(document).ready(function () {
        var $beats_per_measure = $("#beats_per_measure");
        var $measures_in_cycle = $("#measures_in_cycle");
        var $color = $('#color');
        var $form = $('form');
        var $submit_button = $form.find('input:submit');

        $form.submit(function() {
            browser_utils.lockForm($form);
            return true;
        });

        $beats_per_measure.val(constants.BEATS_PER_MEASURE);
        $measures_in_cycle.val(constants.MEASURES_IN_CYCLE);

        browser_utils.fillSelectBox({
            $select: $color,
            itemNames: constants.OPEN_SESSION_PLAYER_COLORS,
            random: true
        });

        $submit_button.attr('disabled', null);
    });
});