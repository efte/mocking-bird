(function() {
    function toQueryString(data) {
        var arr = [];
        for (var key in data) {
            arr.push(key + "=" + data[key]);
        }
        return arr.join("&");
    }

    window.DPApp = {
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
            var data = opts.data;
            var url = encodeURIComponent(opts.url + "?" + toQueryString(data));
            var modelName = opts.modelName;
            var success = opts.success;
            var fail = opts.fail;


            var xhr = $.ajax({
                url: "/proxy?url=" + url,
                data: data,
                headers: {
                    "pragma-modelname": modelName
                },
                success: success,
                error: fail
            });
        },

        action: {
            get: function(params, callback) {
                var objs = [];
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
            },
            open: function(url, params) {
                //
            }
        },

        getEnv: function(callback) {
            // override this method plz
            var env = {}; // mock env
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

            setTimeout(callback, 0);
        },

        startRefresh: function() {
            // override this method plz
        },
        stopRefresh: function() {
            // override this method plz
        },
        genUUID: function(dpid) {
            dpid = dpid || DPAppEnv.dpid || 0;
            var requid = CryptoJS.MD5(dpid + (new Date().getTime()) + (Math.random()));
            // console.log(requid.toString());
            return requid.toString();
        }

    };

    window.DPAppEnv = {
        query: {}
    };
})();