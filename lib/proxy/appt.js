var baseProxy = require('./base');


module.exports = baseProxy('app.t.dianping.com', {
  headers: {
    "host": "app.t.dianping.com",
    "user-agent": "MApi 1.1 (dptuan 1.6.0 appstore; iPhone 5.1 x86_64)",
    "accept": "*/*",
    "pragma-os": "MApi 1.1 (dptuan 1.6.0 appstore; iPhone 5.1 x86_64)",
    "pragma-device": "this_one_from_html5",
    "pragma-appid": "351091731",
    "accept-encoding": "gzip, deflate"
  },
  jsonfy: function(respData, callback) {
    require('./decode').decodeResponse(rspData, callback);
  }
});