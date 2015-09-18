#!/bin/sh

heroku config:add BUILDPACK_URL=https://github.com/mbuchetics/heroku-buildpack-nodejs-grunt.git;
heroku config:set NODE_ENV=production;