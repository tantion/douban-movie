//
// player
//
define('private/player', function (require, exports, module) {
    "use strict";

    if (!location.href.match(/\/private\/play\.html/)) {
        return;
    }

    var $ = require('jquery'),
        $container = $('<div class="container"></div>'),
        url = location.href.replace(/.*url=([^&]+).*/i, '$1'),
        yun = require('private/yun');

    $('html').show();
    document.title = 'loading';
    $('body').html($container);
    $container.html('loading');

    yun.hasLogin()
    .done(function () {
        yun.upload(url)
        .done(function (infohash) {
        
        })
        .fail(function () {
            //console.log('upload error');
        });
    })
    .fail(function () {
        $container.html('<div class="alert"><a href="http://vod.xunlei.com" target="_blank">你需要先登录迅雷</a></div>');
    });
});
