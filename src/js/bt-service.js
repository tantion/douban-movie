//
// bt search service
//
define(function(require, exports, module) {
    "use strict";

    var $ = require('jquery'),
        async = require('async'),
        providers = [require('js/bt-tiantang')];

    var BtService = function () {
    };

    BtService.prototype = {

        constructor: BtService,

        // 按照bt提供者循序搜索，当搜到时返回接口
        search: function (subject) {
            var dfd = new $.Deferred(),
                pds = providers.slice(0);

            async.eachSeries(pds, function (pd, func) {
                pd.search(subject)
                .progress(function (msg) {
                    dfd.notify(msg);
                })
                .done(function (bt) {
                    func(bt);
                })
                .fail(function () {
                    dfd.notify('没找到资源，切换到下一个服务器。');
                    func();
                });
            }, function (bt) {
                if (bt) {
                    dfd.resolve(bt);
                } else {
                    dfd.reject();
                }
            });

            return dfd.promise();
        }
    };

    module.exports = {
        search: function (subject) {
            return (new BtService()).search(subject);
        }
    };
});
