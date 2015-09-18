/**
 * The main node.js file
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require, module, exports, process, __dirname, console */

require('newrelic');  // For performance monitoring

var constants = require('drum-circle-library/constants');
var server = require('./server');

var port = process.env.PORT || constants.DEFAULT_WEB_PORT;
server.set('port', port);
server.set('view engine', 'ejs');
if (server.settings.env === 'development') {
    console.log("http://localhost:" + port);
}
server.listen(port);