/*jshint strict: true */
/*global requirejs */

//The build will inline common dependencies into this file.

//For any third party dependencies, like jQuery, place them in the lib folder.

//Configure loading modules from the lib directory,
//except for 'app' ones, which are in a sibling
//directory.
requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        app: '../app',
        json2: 'http://pubsub.fanout.io/static/json2',
        "Fpp": 'http://pubsub.fanout.io/static/fppclient-1.0.1.min'
    },
    shim: {
        'json2': {
            exports: 'JSON'
        },
        'Fpp': {
            deps: [ 'json2' ],
            exports: 'Fpp'
        },
        'jquery-browser-plugin': {
            deps: [ 'jquery' ]
        },
        adsr: {
            exports: 'ADSR'
        }
    }
});