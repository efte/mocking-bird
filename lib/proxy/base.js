var assert = require('assert');
var url = require('url');
var express = require('express');


module.exports = function proxy(hostname, options) {
  assert(hostname, "HostName must not be empty");

  var headers = options.headers || {};
  var method = options.method || 'GET';
  var port = options.port || 80;

  /** 
   * jsonfy(resp, function(err, json));
   */
  var jsonfy = options.jsonfy;

  var app = express();
  // default app.t.dianping.com proxy
  app.get('/proxy', function handleProxy(req, res) {
    console.log('proxy path: ' + req.query.url);

    var realRequest = http.request({
      hostname: hostname,
      port: port,
      headers: headers,
      method: method
      path: url.parse(req.query.url).path
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
            res.send(json);
          });
        }
      });
    });

    realRequest.on('error', function() {
      res.end('{code: -1, message: "create request error"}');
    });

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