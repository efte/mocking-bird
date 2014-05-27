var express = require('express');
var assert = require('assert');
var request = require('request');
var http = require('http');
var path = require('path');
var fs = require('fs');
var url = require('url');
var send = require('send');
var Injection = require('./injection');

module.exports = function(options) {
    var static = options.static;
    var index = options.index || 'index.html';

    var app = express();

    if (options.verbose) {
        app.use(express.logger());
    }

    // add extension
    var extApp = options.extApp;
    if (extApp && extApp.handle && extApp.set) // express app extension
        app.use(extApp);

    app.use(app.router);

    // 1. if you want to use view handle views, when rendering
    app.locals({
        injected_scripts: "<script src='/bridges/web.js'></script>",
        injected_bridge: '/bridges/web.js'
    });


    // 2. when render static file
    if (static) {
        var scripts = "\n<script src='/bridges/web.js'></script>\n";
        app.use(function(req, res, next) {
            var pathname = req.path;
            if (pathname[pathname.length - 1] == '/') pathname += 'index.html';

            function error(err) {
                if (404 == err.status) return next();
                next(err);
            }

            var st = send(req, pathname, {
                root: static
            });

            st.on('error', error);

            if (/\.html$/.test(pathname)) {
                st.pipe(new Injection(res, {
                    injection: function(content) {
                        content = content.replace(/(<head[^>]*>)/, "$1" + scripts);
                        return content;
                    }
                })).pipe(res);
            } else
                st.pipe(res);
        });
    }


    app.get('/bridges/web.js', function handleProxy(req, res, next) {
        res.sendfile(path.join(__dirname, '../', req.path));
    });

    // unmatched request will go for proxy
    var proxy = options.proxy;
    if (proxy && proxy.handle && proxy.set) // express proxy
        app.use('/proxy', proxy);


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