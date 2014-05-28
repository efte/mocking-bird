var url = require('url');
var directProxy = require('./direct');

module.exports = function(host, options) {
  options = options || {};

  options.forwardPath = options.forwardPath || function(req, res) {
    var dUrl = url.parse(req.query.url);
    var path = dUrl.path + (dUrl.query ? dUrl.query : '');
    return path;
  };

  return directProxy(host, options);
};