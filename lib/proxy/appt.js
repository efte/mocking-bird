var express = require('express');
var app = express();

// default app.t.dianping.com proxy
app.get('/proxy', function handleProxy(req, res) {
  console.log('proxy url: ' + req.query.url);
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