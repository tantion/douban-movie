//
// yun bo detect
//
define('private/yunbo', function (require, exports, module) {
    "use strict";

    var $ = require('jquery'),
        yun = require('private/yun'),
        adapter = require('private/adapter'),
        alertify = require('alertify'),
        ctrlKey = navigator.userAgent.match(/Macintosh/i) ? 'command' :  'ctrl';

    function closeLogs () {
        $('article.alertify-log-show').click();
    }

    function isInfoHash (hash) {
        if (/^\w+$/.test(hash)) {
            return true;
        }
        return false;
    }

    function openYunbo (href, usePrivate) {
        closeLogs();
        alertify.log('正在加载云播地址... <br />同时 `' + ctrlKey + '+单击` 可添加到云播', '', 10000);
        yun.requestHash(href)
        .done(function (hash) {
            closeLogs();
            alertify.success('准备云播');

            yun.requestUrlByHash(hash)
            .done(function () {
                var url = '';
                if (usePrivate) {
                    if (isInfoHash(hash)) {
                        url = 'http://tantion.com/private/play.html?infohash=' + hash;
                    } else {
                        url = 'http://tantion.com/private/play.html?url=' + hash;
                    }
                } else {
                    if (isInfoHash(hash)) {
                        url = 'http://vod.xunlei.com/share.html?from=macthunder&type=bt&url=bt%3A%2F%2F' + hash + '&playwindow=player';
                    } else {
                        url = 'http://vod.xunlei.com/share.html?from=macthunder&url=' + encodeURIComponent(hash) + '&playwindow=player';
                    }
                }
                chrome.runtime.sendMessage({action: 'openurl', data: {url: url}});
                closeLogs();
                alertify.success('已找到云播资源，正在打开播放页面', 1000);
            })
            .fail(function (msg) {
                closeLogs();
                alertify.error(msg || '云播失败，未知错误');
            });
        })
        .fail(function (msg) {
            closeLogs();
            alertify.error(msg || '云播失败，未知错误');
        });
    }

    function addYunbo (href) {
        closeLogs();
        alertify.log('正在添加地址到云播...', '', 10000);

        yun.addByUrl(href)
        .done(function () {
            closeLogs();
            alertify.success('已添加找到云播空间', 1000);
        })
        .fail(function (msg) {
            closeLogs();
            alertify.error(msg || '添加云播失败，未知错误');
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
            else if (adapter.isAddAction(evt)) {
                evt.preventDefault();
                addYunbo(href);
            }
        });
    }

    module.exports = {
        init: init
    };
});
