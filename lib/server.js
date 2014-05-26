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
        app.use(express.logger('mocking bird'));
    }



    app.use(app.router);

    // 1. handle views, when rendering
    app.locals({
        injected_scripts: "<script src='/bridges/web.js'></script>",
        injected_bridge: '/bridges/web.js'
    });

    var scripts = "\n<script src='/bridges/web.js'></script>\n";
    if (static) {
        app.use(function(req, res, next) {
            var pathname = req.path;
            if (pathname[pathname.length - 1] == '/') pathname += 'index.html';

            var st = send(req, pathname, {
                root: static
            });

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
        next();
    });

    // unmatched request will go for proxy
    var proxy = options.proxy;

    if (proxy)
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


// function injectScript(filePath, cb) {
//     jsdom.env({
//         file: filePath,
//         features: {
//             FetchExternalResources: false,
//             ProcessExternalResources: false
//         },
//         done: function(errors, window) {
//             if (errors) {
//                 console.dir(errors[0] ? errors : (errors[0].data ? errors[0] : errors[0].data.exceptionb));
//                 return cb(new Error('parsing error'));
//             }
//             var document = window.document;
//             var head = document.getElementsByTagName('head')[0];

//             var zepto = document.createElement('script');
//             zepto.src = 'http://zeptojs.com/zepto.js';
//             head.appendChild(zepto);

//             var script = document.createElement('script');
//             script.src = '/bridges/web.js';
//             head.appendChild(script);

//             return cb(null, window.document.innerHTML);
//         }
//     });
// }