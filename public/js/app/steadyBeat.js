/*
 _    _        _    _            _      _    _       ______ _
 | |  | |      | |  | |          | |    | |  | |      | ___ \ |
 | |  | | ___  | |  | | ___  _ __| | __ | |  | | ___  | |_/ / | __ _ _   _
 | |/\| |/ _ \ | |/\| |/ _ \| '__| |/ / | |/\| |/ _ \ |  __/| |/ _` | | | |
 \  /\  /  __/ \  /\  / (_) | |  |   <  \  /\  /  __/ | |   | | (_| | |_| |
 \/  \/ \___|  \/  \/ \___/|_|  |_|\_\  \/  \/ \___| \_|   |_|\__,_|\__, |
 __/ |
 |___/
 */

/*
 * Library originally from https://github.com/recyclerobot/steadyBeat.js
 * Modified by Ken Fehling
 */

(function ( steadyBeat, undefined ) {
    "use strict";

    // DEFINES
    // -----------------------------------

    var loopInterval,
        intervalTime = 500, // value in milliseconds, defaults to 500ms (120bpm = 1/(120/60))
        globalCounter = 0,
        timeoutInterval,  // higher values can improve performance on older machines
        timestamp,
        loopExecMem = false,
        started = false,
        startDelay;  // This variable allows steady beat to start
                     // with a given delay so all devices can be in synch.

    // PUBLIC
    // -----------------------------------

    steadyBeat.start = function(tempo, start_delay, granularity) {
        startDelay = start_delay || 0;
        timeoutInterval = granularity || 10;
        intervalTime = (tempo) ? tempo : intervalTime;
        timestamp = (new Date()).getTime();
        started = true;
        run();
    };
    steadyBeat.stop = function() {
        clearInterval(loopInterval);
        loopInterval = false; // important to prevent leaks
        globalCounter = 0;
        started = false;
    };
    steadyBeat.setTempo = function(newTempo) {
        intervalTime = newTempo;
    };
    steadyBeat.setReturnLoop = function(loopExec){
        if(!loopExecMem || loopExec !== loopExecMem && loopExec !== undefined) {
            loopExecMem = loopExec;
        }
    };
    steadyBeat.loop = function(loopExec) {
        if(loopExecMem){
            loopExecMem();
        }
    };

    steadyBeat.isStarted = function() {
        return started;
    };

    // PRIVATE
    // -----------------------------------

    function run() {
        var now = new Date().getTime();
        var timeElapsed = (now - timestamp) - startDelay;
        if (intervalTime * globalCounter <= timeElapsed) {
            globalCounter = Math.ceil(timeElapsed / intervalTime);
            steadyBeat.loop();
        }
        loopInterval = setTimeout(run, timeoutInterval);
    }

    /**
     * Add support for AMD (Asynchronous Module Definition) libraries such as require.js.
     */
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return steadyBeat;
        });
    }

    /**
     * Add support for CommonJS libraries such as browserify.
     */
    if (typeof exports !== 'undefined') {
        exports.steadyBeat = steadyBeat;
    }

})(window.steadyBeat = window.steadyBeat || {});