/**
 * Takes url params and populates the model
 */

/*jshint strict: true */
/*global require, module */

require(['lodash', 'app/models/game', 'pubsub-js',
        'drum-circle-library/constants', 'drum-circle-library/utils'],
function(_, game, pubsub, constants, utils) {
    "use strict";

    pubsub.subscribe(constants.EVENTS.INITIALIZE_AUDIO, function() {
        var params = utils.getHashParams();
        ifHasParamRun(params, 'tempo', game.setTempo, parseInt);
        ifHasParamRun(params, 'start_time', game.setStartTime, parseInt);

        function ifHasParamRun(params, key, f, g) {
            var x = params[key];
            if (x) {
                g = g || _.identity;
                f(g(x));
            }
        }
    });
});