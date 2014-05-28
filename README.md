# Mocking Bird

Mocking server to work with hybird application, working with proxy server that using express3.x.

## Installation

```
npm install mocking-bird -g
```

## Usage

### Used in command line

```
mkb server [static folder] [-p|--port <server running port>] [-P|--proxy <js file exports express app as proxy>]
```

See more help info by typing  ```mkb -h```

### Used in code

#### Proxy =proxy.js=

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
