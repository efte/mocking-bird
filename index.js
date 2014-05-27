module.exports = require('./lib/server');
module.exports.baseProxy = require('./lib/proxy/base');


module.exports.afterRender = function(req, res) {
  return function(err, str) {
    if (err) return req.next(err);
    if (srt)
      str = str.replace(/(<head[^>]*>)/, "$1" + "\n<script src='/bridges/web.js'></script>\n");
    res.send(str);
  };
};