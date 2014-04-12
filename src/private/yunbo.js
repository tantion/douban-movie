//
// yun bo detect
//
define('private/yunbo', function (require, exports, module) {
    "use strict";

    var $ = require('jquery'),
        yun = require('private/yun'),
        adapter = require('private/adapter'),
        alertify = require('alertify');

    function closeLogs () {
        $('article.alertify-log-show').click();
    }

    function openYunbo (href, usePrivate) {
        closeLogs();
        alertify.log('正在加载云播地址...');
        yun.requestHash(href)
        .done(function (hash) {
            var url = '';
            if (usePrivate) {
                url = 'http://tantion.com/private/play.html?infohash=' + hash;
            } else {
                url = 'http://vod.xunlei.com/share.html?from=macthunder&type=bt&url=bt%3A%2F%2F' + hash + '&playwindow=player';
            }
            chrome.runtime.sendMessage({action: 'openurl', data: {url: url}});
            closeLogs();
            alertify.success('准备云播');
        })
        .fail(function (msg) {
            closeLogs();
            alertify.error(msg || '云播失败，未知错误');
        });
    }


    function init () {
        $(document)
        .on('click', 'a.private-play-download-link', function (evt) {
            var href = $(this).prop('href');

            if (adapter.isYunAction(evt)) {
                evt.preventDefault();
                openYunbo(href);
            }
            else if (adapter.isPrivateAction(evt)) {
                evt.preventDefault();
                openYunbo(href, true);
            }
        });
    }

    module.exports = {
        init: init
    };
});
