/**
 * Express server
 * Author: Ken Fehling
 */

/*jshint strict: true */
/*global require, module, exports, process, __dirname */

var express = require('express');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var http = require('http');
var path = require('path');
var url = require('url');
var _ = require('lodash');
var rest = require('restler');
var constants = require('drum-circle-library/constants');
var utils = require('drum-circle-library/utils');

var apiHost = getApiHost();
var staticDir = getStaticDir();

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(favicon(__dirname + staticDir + '/favicon.ico'));
app.use(express.static(path.join(__dirname, staticDir)));

var router = express.Router();

router.route('/').get(function(req, res) {
    "use strict";
    res.sendFile(staticDir + '/entrance/index.html', { root: __dirname});
});

router.route('/create-game').get(function(req, res) {
    "use strict";
    var post = rest.post(apiHost + '/games');
    post.on('complete', function(result, response) {
        if (response) {
            if (response.statusCode < 300) {
                var _id = result._id;
                var post = rest.post(apiHost + '/games/' + _id + '/players');
                post.on('complete', function(result, response) {
                    if (response) {
                        if (response.statusCode < 300) {
                            redirectToCreateGame(_id, res, result);
                        } else {
                            res.status(response.statusCode).send({ error: result });
                        }
                    } else {
                        res.status(500).send({ error: "No response from API server"});
                    }
                });
            } else {
                res.status(response.statusCode).send({ error: result });
            }
        } else {
            res.status(500).send({ error: "No response from API server"});
        }
    });
});

router.route('/join-game').get(function(req, res) {
    "use strict";
    if (req.body) {
        var _id = req.query.code;
        if (_id) {
            var post = rest.post(apiHost + '/games/' + _id + '/players');
            post.on('complete', function(result, response) {
                if (response) {
                    if (response.statusCode < 300) {
                        var params = result;
                        getGame(_id, res, function(result) {
                            if (result.start_time) {
                                params.start_time = result.start_time;
                                params.drum_kit = result.drum_kit;
                                params.tempo = result.tempo;
                            }
                            redirectToJoinGame(_id, res, params);
                        });
                    } else {
                        if (req.headers.accept === 'application/json') {
                            res.status(response.statusCode).send(result);
                        }
                        else {
                            renderError(res, response.statusCode, result);
                        }
                    }
                } else {
                    res.status(500).send({ error: "No response from API server"});
                }
            });
        } else {
            res.status(400).send({ error: "Must pass game code" });
        }
    }
    else {
        res.status(400).send({ error: "Must pass settings" });
    }
});


router.route('/start-game').post(function(req, res) {
    "use strict";
    if (req.body) {
        var _id = req.body.code;
        if (_id) {
            var running = utils.isParamTruthy(req.body.running);
            var tempo = req.body.tempo;
            var drum_kit = req.body.drum_kit;
            var patch = rest.patch(apiHost + '/games/' + _id, {
                data: {
                    running: running,
                    tempo: tempo,
                    drum_kit: drum_kit
                }
            });
            patch.on('complete', function(result, response) {
                if (response) {
                    if (response.statusCode < 300) {
                        var params = { start_time: result.start_time };
                        params = _.extend(params, req.body);
                        redirectToGame(_id, res, params);
                    } else {
                        res.status(response.statusCode).send({ error: result });
                    }
                } else {
                    res.status(500).send({ error: "No response from API server"});
                }
            });
        }
        else {
            res.status(400).send({ error: "Must pass game code" });
        }
    }
    else {
        res.status(400).send({ error: "Must pass settings" });
    }
});

router.route('/enter-open-session').post(function(req, res) {
    "use strict";
    if (req.body) {
        var _id = constants.OPEN_SESSION_CODE;
        var post = rest.post(apiHost + '/games/' + _id + '/players', {
            data: req.body
        });
        post.on('complete', function(result, response) {
            if (response) {
                if (response.statusCode < 300) {
                    getGame(_id, res, function(result) {
                        var params = { start_time: result.start_time };
                        params = _.extend(params, req.body);
                        redirectToGame(_id, res, params);
                    });
                } else {
                    res.status(response.statusCode).send({ error: result });
                }
            } else {
                res.status(500).send({ error: "No response from API server" });
            }
        });
    }
    else {
        res.status(400).send({ error: "Must pass settings" });
    }
});

app.use('/', router);

function getGame(_id, res, callback) {
    "use strict";
    var get = rest.get(apiHost + '/games/' + _id);
    get.on('complete', function(result, response) {
        if (response) {
            if (response.statusCode < 300) {
                callback(result, response);
            } else {
                res.status(response.statusCode).send({ error: result });
            }
        }
        else {
            res.status(500).send({ error: "No response from API server"});
        }
    });
}

function redirectTo(_id, res, params, url) {
    "use strict";
    var paramString = utils.paramsToParamString(_.pick(params, constants.PARAMS));
    res.redirect(url + '?' + _id + "#" + paramString);
}

function redirectToGame(_id, res, params) {
    "use strict";
    redirectTo(_id, res, params, '/game.html');
}

function redirectToJoinGame(_id, res, params) {
    "use strict";
    redirectTo(_id, res, params, '/join_game.html');
}

function redirectToCreateGame(_id, res, params) {
    "use strict";
    redirectTo(_id, res, params, '/create_game.html');
}

function getStaticDir() {
    "use strict";
    if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
        return constants.COMPILED_STATIC_DIRECTORY;
    }
    return constants.STATIC_DIRECTORY;
}

function getApiHost() {
    "use strict";
    if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
        return constants.REMOTE_API_HOST;
    }
    return constants.DEFAULT_API_HOST;
}

function renderError(res, statusCode, data) {
    "use strict";
    res.status(statusCode).render('error.ejs', data);
}

module.exports = app;