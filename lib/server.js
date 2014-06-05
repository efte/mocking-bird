var express = require('express');
var assert = require('assert');
var request = require('request');
var http = require('http');
var path = require('path');
var fs = require('fs');
var url = require('url');
var send = require('send');

module.exports = function(options) {
    var static = options.static;
    var index = options.index || 'index.html';

    var app = express();

    if (options.verbose) {
        app.use(express.logger());
    }

    // add extension
    var extApp = options.extApp;
    if (extApp && ((typeof extApp == 'function' && extApp.length === 3) || (extApp.handle && extApp.set))) /* express app extension */
        app.use(extApp);

    app.use(app.router);

    // 2. when render static file
    if (static) {
        var directory = express.directory(static);

        app.use(function(req, res, next) {
            var pathname = req.path;
            if (pathname[pathname.length - 1] == '/') pathname += 'index.html';

            function error(err) {
                if (404 == err.status) {
                    return next();
                }

                next(err);
            }

            fs.exists(path.join(static, pathname), function(exist) {
                if (exist) {
                    var st = send(req, pathname, {
                        root: static
                    }).pipe(res);
                    st.on('error', error);
                } else {
                    if (/\/$/.test(req.path))
                        directory(req, res, next);
                    else
                        next();
                }
            });

        });
    }

    // unmatched request will go for proxy
    var proxy = options.proxy;
    if (proxy && proxy.handle && proxy.set) // express proxy
        app.use('/', proxy);


    if (options.debug)
        app.use(express.errorHandler());

    var _listen = app.listen;
    app.listen = function() {
        _listen.apply(app, arguments);
        var port = arguments[0];
        console.log('start server on port: %d', port);
    };

    return app;
};