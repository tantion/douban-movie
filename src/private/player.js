//
// player
//
define('private/player', function (require, exports, module) {
    "use strict";

    if (!location.href.match(/private\/play\.html/i)) {
        return;
    }

    var $ = require('jquery'),
        $container = $('.container'),
        $content = $('.video-container'),
        $nav = $('.video-nav'),
        $alert = $('.video-alert'),
        yun = require('private/yun');

    function init () {
        yun.hasLogin()
        .done(function () {
            yun.requestUrl2()
            .done(function (urls) {
                if (urls.length) {
                    var navs = $.map(urls, function (url, i) {
                        var m3u8 = url.vod_url,
                            flv = url.vod_url_dt17;
                        return '<li><a class="private-play-vod" href="/private/play.html?flv=' + encodeURIComponent(flv) + '&m3u8=' +
                            encodeURIComponent(m3u8) + '" data-flv="' + flv + '" data-m3u8="' + m3u8 + '">播放地址' + i + '</a></li>';
                    });
                    navs = navs.join('\n');
                    $nav.html(navs);
                    window.postMessage({action: 'play', url: {
                        flv: urls[0].vod_url_dt17,
                        m3u8: urls[0].vod_url
                    }}, '*');
                } else {
                    $alert.show().html('转码未完成，请稍候再试');
                }
            })
            .fail(function () {
                $alert.show().html('加载播放地址失败');
            });
        })
        .fail(function () {
            $alert.show().html('<a href="http://vod.xunlei.com" target="_blank">你需要先登录迅雷</a>');
        });
    }

    module.exports = {
        init: init
    };
});
