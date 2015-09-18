/**
 * Sends console log messages to a div on the page
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global define, console */

define(['jquery', 'lodash'], function($, _) {
    "use strict";

    if (typeof console !== "undefined") {
        if (typeof console.error !== 'undefined') {
            console.olog = console.error;
        }
        else {
            console.olog = function () {
            };
        }
    }
    console.error = function(message) {
        console.olog(message);
        var lines = message.split(/\r\n|\r|\n/g);
        var html = "";
        _.each(lines, function(line) {
            html += line + "<br>";
        });
        $('#debug-div').append('<p>' + html + '</p>');
    };
    window.onerror = console.debug = console.error; // = console.info = console.log;
});