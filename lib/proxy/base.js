var assert = require('assert');
var util = require('util');
var qs = require('querystring');
var url = require('url');
var http = require('http');
var express = require('express');


module.exports = function proxy(host, options) {
  assert(host, 'Host should not be empty');

  options = options || {};
  var port = 80;

  if (typeof host == 'string') {

    var mc = host.match(/^(https?:\/\/)/);
    if (mc) {
      host = host.substring(mc[1].length);
    }

    var h = host.split(':');
    host = h[0];
    port = h[1] || 80;
  }


  /** 
   * jsonfy(resp, function(err, json));
   */
  var jsonfy = options.jsonfy;

  var app = express();
  app.use(express.bodyParser());

  app.all("*", function handleProxy(req, res) {
    var headers = options.headers || {};
    var dUrl = url.parse(req.query.url);
    var path = dUrl.path + (dUrl.query ? dUrl.query : '');


    console.log('proxy path: ' + [host + ":" + port, path].join(''), req.method);

    var hds = extend(headers, req.headers, ['connection', 'host', 'content-length']);

    hds.connection = 'close';

    var bodyContent = undefined;
    if (req.body) {
      if (typeof req.body === 'string')
        bodyContent = req.body;
      else if (typeof req.body === 'object' && req.body != null) {
        bodyContent = JSON.stringify(req.body);
      }
    }

    if (bodyContent)
      hds['content-length'] = Buffer.byteLength(bodyContent, 'utf8');


    var realRequest = http.request({
      hostname: (typeof host == 'function') ? host(req) : host.toString(),
      port: port,
      headers: hds,
      method: req.method,
      path: path
    }, function(rsp) {
      var rspData = new Buffer(0);
      rsp.on('data', function(chunk) {
        rspData = joinBuffer(rspData, chunk);
      });

      rsp.on('end', function() {
        if (jsonfy) {
          rspData = jsonfy(rspData, function(err, json) {
            if (err) {
              return res.send({
                code: -1,
                message: 'jsonfy error' + err.toString()
              });
            }

            if (app.get('debug'))
              console.log(util.inspect(json));

            res.send(json);
          });
        } else
          res.send(rspData);
      });

      rsp.on('error', function() {
        res.send({
          code: -1,
          message: 'error from proxy source'
        });
      });


      if (!res.headersSent) {
        res.status(rsp.statusCode);
        for (var p in rsp.headers) {
          res.set(p, rsp.headers[p]);
        }
      }
    });

    realRequest.on('error', function() {
      res.end('{code: -1, message: "create request error"}');
    });

    if (bodyContent) {
      realRequest.write(bodyContent, 'utf8');
    }

    realRequest.end();
  });

  return app;
};



function joinBuffer( /* buf1, buf2, ... */ ) {
  var bufs = arguments;

  var len = Array.prototype.reduce.call(bufs, function(memo, buf) {
    return memo += buf.length;
  }, 0);

  var result = new Buffer(len);
  var start = 0;
  for (var i = 0; i < bufs.length; ++i) {
    var buf = bufs[i];
    buf.copy(result, start, 0, buf.length);
    start += buf.length;
  }

  return result;
}



function extend(obj, source, skips) {
  if (!source) return obj;

  for (var prop in source) {
    if (skips.indexOf(prop) == -1)
      obj[prop] = source[prop];
  }

  return obj;
};