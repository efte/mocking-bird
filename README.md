# Mocking Bird


## Installation

```
npm install mocking-bird -g
```

## Usage

### Used in command line

```
mkb server [static folder] [-p|--port <server running port>] [-P|--proxy <js file exports express app as proxy>]
```

### Used in code

=proxy.js=

``` javascript
var mkb = require('mocking-bird');

var baseProxy = mkb.baseProxy;

// create a proxy application

var app = baseProxy('real_server_address', {
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

