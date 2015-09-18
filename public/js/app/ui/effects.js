/**
 * The logic that sits behind the game room UI.
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require */

require(['jquery', 'drum-circle-library/constants', 'pubsub-js'],
function($, constants, pubsub) {
    "use strict";

    $(document).ready(function() {
        var $effects = $('#effects');
        var $allEffects = $($effects.find('td'));

        function turnOffAll() {
            $allEffects.removeClass('selected');
        }

        $allEffects.click(function(event) {
            var $effect = $(event.target);
            var effect = $effect.attr('id');
            if ($effect.hasClass('selected')) {
                $effect.removeClass('selected');
                pubsub.publish(constants.EVENTS.EFFECT_UNSELECTED, effect);
            }
            else {
                turnOffAll();
                $effect.addClass('selected');
                pubsub.publishSync(constants.EVENTS.EFFECT_SELECTED, effect);
            }
        });

        pubsub.subscribe(constants.EVENTS.EFFECT_SEND, function() {
            $allEffects.removeClass('selected');
        });
    });
});