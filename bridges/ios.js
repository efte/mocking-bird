(function() {

    var callbacksCount = 1;
    var callbacks = {};

    window.DPApp = {
        NVCacheTypeDisabled: 0,
        NVCacheTypeNormal: 1,
        NVCacheTypePersistent: 2,
        NVCacheTypeCritical: 3,
        NVCacheTypeDaily: 4,

        send_message: function(method, args, callback) {
            // console.log('send_message', arguments);
            var hasCallback = callback && typeof callback == 'function';
            var callbackId = hasCallback ? callbacksCount++ : 0;
            if (hasCallback) callbacks[callbackId] = callback;


            args['callbackId'] = callbackId;
            args = (typeof args === 'object') ? JSON.stringify(args) : args + '';
            var ifr = document.createElement('iframe');
            ifr.style.display = 'none';
            document.body.appendChild(ifr);
            ifr.contentWindow.location.href = 'js://_?method=' + method + '&args=' + encodeURIComponent(args) + '&callbackId=' + callbackId;
            // ifr.parentNode.removeChild(ifr);
            setTimeout(function() {
                ifr.parentNode.removeChild(ifr);
            }, 0);

            return callbackId;
        },

        callback: function(callbackId, retValue) {
            try {
                var callback = callbacks[callbackId];
                if (!callback) return;
                callback.apply(null, [retValue]);
                delete callbacks[callbackId];
            } catch (e) {
                alert(e);
            }
        },

        ga: function(category, action, label, value, extra) {
            DPApp.send_message('ga', {
                category: category,
                action: action,
                label: label || '',
                value: value || 0,
                extra: extra || {}
            }, function() {});
        },

        ajax: function(opts) {
            var url = opts.url;
            var data = opts.data || {};
            var success = opts.success || function() {};
            var fail = opts.fail || function() {};

            var params = [];
            for (var p in data) {
                if (data.hasOwnProperty(p)) {
                    params.push(p + '=' + encodeURIComponent(data[p]));
                }
            }

            if (params.length) {
                url += url.indexOf('?') == -1 ? "?" : "&";
                url += params.join('&');
            }

            opts.url = url;

            var callbackID = DPApp.send_message('ajax', opts, function(json) {
                var errMsg = '';
                // console.log(json);
                if (json.code == 0) {
                    var rsp = null;
                    try {
                        rsp = JSON.parse(json.responseText);
                        success(rsp);
                    } catch (e) {
                        fail(-2, 'parse json error: ' + e.message);
                        console.log(json);
                    }
                } else {
                    fail(json.code, json.message);
                }
            });
            return {
                cancel: function() {
                    delete callbacks[callbackID];
                }
            };
        },

        action: {
            get: function(params, callback) {
                DPApp.send_message('getURLActionObjects', {
                    params: $.isArray(params) ? params : [params]
                }, function(objs) {
                    if (!$.isFunction(callback)) return;
                    if ($.isArray(params)) {
                        callback(objs);
                    } else {
                        var obj = null;
                        for (var i in objs) {
                            if (objs.hasOwnProperty(i)) {
                                obj = objs[i];
                                break;
                            }
                        }
                        callback(obj);
                    }
                });
            },
            open: function(url, params) {
                var ps = [];
                for (var k in params) {
                    var v = params;
                    if (typeof v != "object") {
                        ps.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
                    }
                }
                url = url + (url.indexOf('?') != -1 ? '&' : '?') + ps.join('&');
                DPApp.send_message('openURLAction', {
                    url: url,
                    params: params
                }, function() {});
            }
        },

        getEnv: function(callback) {
            DPApp.send_message('getEnv', {}, function(env) {
                window.DPAppEnv = window.DPAppEnv || {
                    parseQuery: function() {
                        // query not set
                        if (DPAppEnv.query == '${query}') {
                            DPAppEnv.query = null;
                            return;
                        }

                        var params = {};
                        DPAppEnv.query.split('&').forEach(function(param) {
                            var kv = param.split('=');
                            var k = kv[0];
                            var v = kv.length > 0 ? kv[1] : '';
                            params[k] = v;
                        });

                        DPAppEnv.query = params;
                    }
                };

                $.extend(window.DPAppEnv, env);
                window.DPAppEnv.parseQuery();

                callback();
            });
        },

        startRefresh: function() {
            // override this method plz
        },
        stopRefresh: function() {
            DPApp.send_message('stopRefresh', {}, function() {});
        },
        genUUID: function(dpid) {
            dpid = dpid || DPAppEnv.dpid;
            var requid = CryptoJS.MD5(dpid + (new Date().getTime()) + (Math.random()));
            // console.log(requid.toString());
            return requid.toString();
        }

    };
})();