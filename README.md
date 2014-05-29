# Mocking Bird

Mocking server to work with hybird application, working with proxy server that using express3.x.

## Installation

```
npm install mocking-bird -g
```

## Usage

### Used in command line

```bash
mkb server [static folder] [-p|--port <server running port>] [-P|--proxy <js file exports express app as proxy|or hostname for directly delegate>]
```

See more help info by typing  `mkb -h`

Only run as static server with `web.js` injection:

```bash
mkb server .
```

Run with proxy all missing request to `www.target.com`:

```bash
mkb server . -P www.target.com
```


### Used in code

#### Create your custom proxy

``` javascript
var mkb = require('mocking-bird');

var baseProxy = mkb.baseProxy;

// create a proxy application

var app = baseProxy('real_server_address:8010', {
  headers: {
    "user-agent": "MockClient 1.1 (proxy 1.6.0 appstore; iPhone 5.1 x86_64)",
  },
  jsonfy: function(data, callback) {
     // if data is "{ code: 200, data: {}}", do transform and jsonfy here
     var json;
     try {
        json = JSON.parse(data);
     } catch(e) {
        return callback(e);
     }

     callback(null, json.data);
  }
});

module.exports = app;
```

Then you can use `proxy.js` as proxy provider to the mocking server:

``` bash
mkb server public -P proxy.js
```
