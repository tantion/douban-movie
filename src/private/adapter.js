//
// detect download or play
//
define('private/adapter', function (require, exports, module) {
    "use strict";

    var $ = require('jquery'),
        yun = require('private/yun'),
        alertify = require('alertify');

    function openYunbo (href, usePrivate) {
        alertify.log('正在加载云播地址...');
        yun.requestHash(href)
        .done(function (hash) {
            var url = '';
            if (usePrivate) {
                url = 'http://tantion.com/private/play.html?infohash=' + hash;
            } else {
                url = 'http://vod.xunlei.com/share.html?from=macthunder&type=bt&url=bt%3A%2F%2F' + hash + '&playwindow=player';
            }
            chrome.runtime.sendMessage({action: 'openUrl', data: {url: url}});
            alertify.success('准备云播');
        })
        .fail(function (msg) {
            alertify.log(msg || '云播失败，未知错误');
        });
    }

    var adapter = {
        init: function () {
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
        },
        isYunAction: function (evt) {
            if (evt && evt.shiftKey && !evt.altKey && !evt.ctrlKey && !evt.metaKey) {
                return true;
            }
            return false;
        },
        isPrivateAction: function (evt) {
            if (evt && !evt.shiftKey && evt.altKey && !evt.ctrlKey && !evt.metaKey) {
                return true;
            }
            return false;
        },
        isDefaultPrevented: function (evt) {
            if (adapter.isYunAction(evt) || adapter.isPrivateAction(evt)) {
                return true;
            }
            return false;
        }
    };

    module.exports = adapter;
});

