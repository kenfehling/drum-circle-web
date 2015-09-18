/**
 * Entrance page
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require */

define(function (require) {
    "use strict";

    require('../ui/browser_warning');

    var $ = require('jquery'),
        pubsub = require('pubsub-js'),
        alertify = require('alertify'),
        urls = require('drum-circle-library/urls'),
        constants = require('drum-circle-library/constants'),
        browser_utils = require('../browser_utils');

    function hideTestPagesLinkInProduction() {
        if (window.location.host === constants.PRODUCTION_WEB_HOST) {
            $('#test-pages').css('visibility', 'hidden');
        }
    }

    $(document).ready(function () {
        //hideTestPagesLinkInProduction();
        var $join_button = $('#join-button');
        $join_button.click(function() {
            alertify.set({ labels: {
                ok     : "Join game",
                cancel : "Cancel"
            }});
            alertify.prompt("Enter game code",
                function(ok, code) {
                    if (ok && code) {
                        code = code.trim().toUpperCase();
                        if (browser_utils.isWithoutServer()) {
                            window.location.href = "/join_game.html";
                        }
                        else {
                            var url = urls.createRelativeJoinGameUrl(code);
                            url = browser_utils.toAbsoluteUrl(url);
                            browser_utils.gotoPageIfNotAlready(url);
                        }
                    }
                }
            );
        });
    });
});