//
// player
//
define('private/player', function (require, exports, module) {
    "use strict";

    if (!location.href.match(/private\/detail\.html/i)) {
        return;
    }

    var $ = require('jquery'),
        $container = $('<div class="container"></div>'),
        yun = require('private/yun');

    function init () {
        $('html').show();
        document.title = 'loading';
        $('body').html($container);
        $container.html('loading');

        yun.hasLogin()
        .done(function () {
            yun.requestHash()
            .done(function (infohash) {
                yun.requestUrl(infohash)
                .done(function (urls) {
                })
                .fail(function () {
                    $container.htlm('加载播放地址失败');
                });
            })
            .fail(function () {
                $container.html('创建任务失败');
            });
        })
        .fail(function () {
            $container.html('<div class="alert"><a href="http://vod.xunlei.com" target="_blank">你需要先登录迅雷</a></div>');
        });
    }

    module.exports = {
        init: init
    };
});
