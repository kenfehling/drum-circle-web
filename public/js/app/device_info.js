/**
 * Gets the browser and OS of the user.
 * Depends on the jQuery.browser extension library.
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global define */

define(['jquery', 'jquery-browser-plugin'], function($) {
    "use strict";

    return {
        width: $(window).width(),
        height: $(window).height(),
        os: getDeviceOS(),
        browser: getDeviceBrowser(),
        browser_version: $.browser.version,
        is_webkit: $.browser.webkit,
        is_ios_chrome: isIosChrome(),
        is_mobile: !($.browser.win || $.browser.mac || $.browser.linux),
        is_chrome: isChrome(),
        is_chrome_or_safari: $.browser.webkit && !$.browser.opera
    };

    // For some reason iOS Chrome looks to be reported as Webkit
    function isIosChrome() {
        var browser = getDeviceBrowser();
        return isIos() && (browser === 'Chrome' || browser === 'Webkit');
    }

    function isChrome() {
        return $.browser.chrome ||
            ($.browser.webkit && !$.browser.opera && !$.browser.safari);
    }

    function isIos() {
        return $.browser.ipad || $.browser.iphone;
    }

    function getDeviceOS() {
        if ($.browser.ipad) {
            return "iPad";
        }
        if ($.browser.iphone) {
            return "iPhone";
        }
        if ($.browser["windows phone"]) {
            return "Windows Phone";
        }
        if ($.browser.android) {
            return "Android";
        }
        if ($.browser.win) {
            return "Windows";
        }
        if ($.browser.mac) {
            return "MacOS";
        }
        if ($.browser.linux) {
            return "Linux";
        }
        return "Unknown";
    }

    function getDeviceBrowser() {
        if ($.browser.msie) {
            return "Internet Explorer";
        }
        if ($.browser.webkit) { // (Safari, Chrome, Opera 15+)
            if ($.browser.chrome) {
                return "Chrome";
            }
            if ($.browser.opera) {
                return "Opera";
            }
            if ($.browser.safari) {
                return "Safari";
            }
            return "Webkit";
        }
        if ($.browser.mozilla) {
            return "Firefox";
        }
        return "Unknown";
    }
});