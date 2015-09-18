/*jshint strict: true */
/*global module  */

module.exports = function(grunt) {
    "use strict";

    grunt.loadNpmTasks('grunt-requirejs');

    // configure the tasks
    grunt.initConfig({
        clean: {
            build: {
                src: [ 'public-built' ]
            }
        },
        requirejs: {
            compile: {
                options: {
                    almond: false,
                    baseUrl: "public",
                    mainConfigFile: "tools/build.json",
                    dir: 'public-built'
                }
            }
        }
    });

    grunt.registerTask('heroku:production', 'requirejs');

}