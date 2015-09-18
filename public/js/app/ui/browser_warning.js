/**
 * Warns the user that they need Chrome
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require */

require(['jquery', 'app/device_info', 'alertify'], function($, device_info, alertify) {
    "use strict";

    $(document).ready(function() {
        if (!device_info.is_chrome_or_safari) {
            alertify.alert("This app requires Google Chrome");
        }
    });
});