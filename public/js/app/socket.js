/**
 * Creates a persistent connection from Fanout to client
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global define */

var DEBUG = false;

define(['lodash', 'Fpp', 'drum-circle-library/constants', 'pubsub-js'],
    function (_, Fpp, constants, pubsub) {
    "use strict";
    var s;

    return {
        connect: function(options) {  // Begin socket connection to server
            if (s && s.socket) {
                s.disconnect();  // Disconnect if there's an existing connection
            }
            var channel = options.channel;
            var url = 'http://pubsub.fanout.io/r/' + constants.FANOUT_REALM;
            var client = new Fpp.Client(url);
            s = client.Channel(channel);
            s.on('data', function(obj) {
                if (constants.DEBUG) {
                    console.log(obj);
                }
                _.each(constants.EVENTS, function(event) {
                    if (obj.event === event) {
                        pubsub.publish(event, obj.data);
                    }
                });
            });
        },
        disconnect: function() {
            s.disconnect();
        },
        isConnected:function() {
            return s.socket.connected;
        }
    };
});