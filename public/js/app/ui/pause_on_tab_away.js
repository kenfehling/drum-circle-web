/**
 * Pauses on tab away to prevent audio artifacts, especially on mobile
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require */

require(['jquery', 'app/browser_utils', 'app/device_info',
         'app/models/sequencer_state'],
function($, browser_utils, device_info, sequencer_state) {
    "use strict";

    $(document).ready(function() {
        if (device_info.is_mobile) {
            browser_utils.monitorPageVisibility({
                onHidden: sequencer_state.systemPause,
                onVisible: sequencer_state.systemUnpause
            });
        }
    });
});