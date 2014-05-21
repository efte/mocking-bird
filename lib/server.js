var express = require('express');
var request = require('request');
var http = require('http');
var path = require('path');
var jsdom = require('jsdom');
var fs = require('fs');
var decode = require('./decode');
var url =require('url');

var app = express();
app.configure(function() {
    app.use(function handleInjection(req, res, next) {
        if (req.path.indexOf('html') != -1) {
            injectScript(path.join(process.cwd(), req.path), function(err, result) {
                if (err) {
                    return res.send(500);
                }
                return res.send(result);
            })
        } else {
            next();
        }
    });
    app.use(app.router);
});

app.get('/bridges/web.js', function handelProxy(req, res, next) {
    res.sendfile(path.join(__dirname, '../', req.path));
});

app.get('/proxy', function handelProxy(req, res, next) {
    console.log(req.query.url);
    var headers = {
        "host": "app.t.dianping.com",
        "user-agent": "MApi 1.1 (dptuan 1.6.0 appstore; iPhone 5.1 x86_64)",
        "accept": "*/*",
        "pragma-os": "MApi 1.1 (dptuan 1.6.0 appstore; iPhone 5.1 x86_64)",
        "pragma-device": "this_one_from_html5",
        "pragma-appid": "351091731",
        "accept-encoding": "gzip, deflate"
    };

    var realRequest = http.request({
        hostname: 'app.t.dianping.com',
        port: 80,
        headers: headers,
        method: 'GET',
        path: url.parse(req.query.url).path
    }, function(rsp) {
        var rspData = new Buffer(0);
        rsp.on('data', function(chunk) {
            rspData = joinBuffer(rspData, chunk);
        });
        rsp.on('end', function() {
            decode.decodeResponse(rspData, function(err, json) {
                if (err) {
                    console.log(err);
                }
                res.send(json);
            });
        });
    });

    realRequest.on('error', function() {
        response.end('{code: -1, message: "create request error"}');
    });

    realRequest.end();
});

var server = http.createServer(app);

function injectScript(filePath, cb) {
    jsdom.env({
        file: filePath,
        features: {
            FetchExternalResources: false,
            ProcessExternalResources: false
        },
        done: function(errors, window) {
            if (errors) {
                console.dir(errors[0].data.exception);
                return cb(new Error('parsing error'))
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

function joinBuffer( /* buf1, buf2, ... */ ) {
    var bufs = arguments;

    var len = 0;
    for (var i = 0; i != bufs.length; ++i) {
        len += bufs[i].length;
    }

    var result = new Buffer(len);
    var start = 0;
    for (var i = 0; i != bufs.length; ++i) {
        var buf = bufs[i];
        buf.copy(result, start, 0, buf.length);
        start += buf.length;
    }

    return result;
}


exports.startOnPort = function(port) {
    console.log('start server on port: %d',port);
    server.listen(port);
}