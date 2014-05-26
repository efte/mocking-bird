var express = require('express');
var assert = require('assert');
var request = require('request');
var http = require('http');
var path = require('path');
var jsdom = require('jsdom');
var fs = require('fs');
var url = require('url');


module.exports = function(options) {
    var static = options.static;

    var app = express();

    if (options.verbose) {
        app.use(express.logger('mocking bird'));
    }



    app.use(app.router);



    if (static) {
        app.use(express.static(static));
    }


    app.get('/bridges/web.js', function handleProxy(req, res, next) {
        res.sendfile(path.join(__dirname, '../', req.path));
    });

    // unmatched request will go for proxy
    var proxy = options.proxy;

    if (proxy)
        app.use(proxy);


    app.use(function handleInjection(req, res, next) {
        console.log(req.headers, req.path);

        // injectScript(path.join(static, req.path), function(err, result) {
        //     if (err) {
        //         return res.send(500);
        //     }
        // });
        next();
    });

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


function injectScript(filePath, cb) {
    jsdom.env({
        file: filePath,
        features: {
            FetchExternalResources: false,
            ProcessExternalResources: false
        },
        done: function(errors, window) {
            if (errors) {
                console.dir(errors[0] ? errors : (errors[0].data ? errors[0] : errors[0].data.exceptionb));
                return cb(new Error('parsing error'));
            }
            var document = window.document;
            var head = document.getElementsByTagName('head')[0];

            var zepto = document.createElement('script');
            zepto.src = 'http://zeptojs.com/zepto.js';
            head.appendChild(zepto);

            var script = document.createElement('script');
            script.src = '/bridges/web.js';
            head.appendChild(script);


            return cb(null, window.document.innerHTML);
        }
    });
}