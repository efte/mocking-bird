var stream = require('stream');
var util = require('util');

// node v0.10+ use native Transform
var Transform = stream.Transform;


require('buffer');

module.exports = Injection;

function Injection(res, options) {
  // allow use without new
  if (!(this instanceof Injection)) {
    return new Injection(options);
  }

  this.res = res;

  this.chunks = [];
  this.saveEncoding;
  this.injection = options.injection;
  Transform.call(this, options);
}

util.inherits(Injection, Transform);

['getHeader', 'setHeader'].forEach(function(method) {
  Injection.prototype[method] = function() {
    this.res[method].apply(this.res, arguments);
  };
});

Injection.prototype._transform = function(chunk, encoding, done) {
  if (Buffer.isBuffer(chunk))
    this.chunks.push(chunk);
  else {
    this.chunks.push(new Buffer(chunk.toString()), encoding);

    if (!this.saveEncoding)
      this.saveEncoding = encoding;
  }

  done();
};

Injection.prototype._flush = function(done) {
  var chunks = this.chunks;
  var totalLength = chunks.reduce(function(len, buf) {
    return len + buf.length;
  }, 0);

  var content = Buffer.concat(chunks, totalLength);
  content = content.toString(this.saveEncoding || 'utf8');
  content = this.injection(content);

  this.res.setHeader('Content-Length', content.length);
  this.push(content, this.saveEncoding || 'utf8');
  setTimeout(done, 0);
};