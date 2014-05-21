(function () {

    function toQueryString(data){
        var arr = [];
        for(var key in data){
            arr.push(key + "=" + data[key]);
        }
        return arr.join("&")
    }


    window.DPApp = {
        ga: function (category, action, label, value, extra) {

        },

        ajax: function(opts) {
            var data =  opts.data;
            var url = encodeURIComponent(opts.url + "?" + toQueryString(data));
            var modelName = opts.modelName;
            var success = opts.success;
            var fail = opts.fail;


            var xhr = $.ajax({
                url: "/proxy?url=" + url,
                data: data,
                headers:{
                    "pragma-modelname": modelName
                },
                success: success,
                error: fail
            });
        },

        action: {
            get: function (params, callback) {
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
        },

        startRefresh: function () {
            // override this method plz
        },
        stopRefresh: function () {
            // override this method plz
        },
        genUUID: function (dpid) {
            dpid = dpid || DPAppEnv.dpid || 0;
            var requid = CryptoJS.MD5(dpid + (new Date().getTime()) + (Math.random()));
            // console.log(requid.toString());
            return requid.toString();
        }

    };

    window.DPAppEnv = {
        query:{}
    };
})();