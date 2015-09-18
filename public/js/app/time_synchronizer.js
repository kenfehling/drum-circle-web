/**
 * Gets the difference between client and server clock.
 * Publishes a TIME_SYNCHRONIZE event when it's finished.
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global define */

define(['jquery', 'lodash', 'drum-circle-library/constants', 'pubsub-js',
        'drum-circle-library/utils', 'drum-circle-library/time_utils',
        'app/rest_client'],
function($, _, constants, pubsub, utils, time_utils, rest_client) {
    "use strict";
    var requestsDone = 0;
    var latencies = [];
    var timeDifferences = [];

    function analyzeTimeResponse(clientRequestTime, data) {
        var serverResponseTime = data.time;
        var clientReceiveTime = getCurrentTime();
        var roundTripTime = clientReceiveTime - clientRequestTime;
        var latency = roundTripTime / 2;
        var averageClientTime = (clientReceiveTime + clientRequestTime) / 2;
        var timeDifference = time_utils.calculateTimeDifference({
            clientTime: averageClientTime,
            serverTime: serverResponseTime
        });
        latencies[requestsDone] = latency;
        timeDifferences[requestsDone] = timeDifference;
    }

    function requestTime() {
        rest_client.getTime(_.bind(onTimeResponse, {}, getCurrentTime()));
    }

    function getCurrentTime() {
        return new Date().getTime();
    }

    function onTimeResponse(clientRequestTime, data) {
        analyzeTimeResponse(clientRequestTime, data);
        requestsDone += 1;
        if (requestsDone < constants.TIME_SYNCH_REQUESTS) {
            requestTime();
        }
        else {
            // Old method for computing time difference,
            // using an average all of the time trials.
            //var timeDifference = utils.average(timeDifferences);

            // New method for computing time difference,
            // just take the one that had the least latency.
            var lowestIndex = utils.getMinKey(latencies);
            var timeDifference = timeDifferences[lowestIndex];

            pubsub.publish(constants.EVENTS.TIME_SYNCHRONIZED, {
                timeDifference: timeDifference
            });
        }
    }

    $(document).ready(function() {
        requestTime();
    });
});