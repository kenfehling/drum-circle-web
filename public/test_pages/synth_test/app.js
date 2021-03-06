/*jshint strict: true */
/*global requirejs */

// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: '../../../js/lib',
    paths: {
        app: '../app'
    }
});

// Start loading these files
requirejs(['../../js/app/debug/console_redirect.js']);
requirejs(['js/ui_controller.js']);
requirejs(['../../js/app/audio_initializer.js']);
requirejs(['../../js/app/synth_controller.js']);