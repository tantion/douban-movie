//
// quick download
//
define('private/bt', function (require, exports, module) {
    "use strict";

    var $ = require('jquery'),
        adapter = require('private/adapter'),
        alertify = require('alertify'),
        $iframe = null;


    function download (url) {
        var dfd = new $.Deferred();

        if (isPrivateBtUrl(url)) {
            $.ajax({
                url: url,
                type: 'get',
                dataType: 'text',
                timeout: 30 * 1000
            })
            .done(function (data) {
                var html = data.replace(/src=/ig, 'data-src='),
                    $html = $($.parseHTML(html)),
                    action = url.replace(/file\.php.*/i, 'down.php'),
                    $form = $html.find('form');

                $form.attr('action', action);

                if (!$iframe) {
                    $iframe = $('<iframe/>').hide().appendTo('body');
                }
                $iframe.html($form);

                $form[0].submit();

                dfd.resolve();
            })
            .fail(function () {
                dfd.reject();
            });
        } else {
            dfd.reject('url error');
        }

        return dfd.promise();
    }

    function isPrivateBtUrl (url) {
        url = '' + url;
        if (url.match(/^http:\/\/\w+\.\w+\.com\/\w+\/file\.php\/\w+\.html/i)) {
            return true;
        }
    }

    function load (url) {
        var dfd = $.Deferred(),
            matches = [],
            data = null,
            xhr = null,
            base = '',
            id = '';

        if (isPrivateBtUrl(url)) {
            matches = url.match(/^(http:\/\/\w+\.\w+\.com\/\w+\/)file\.php\/(\w+)\.html/i);
            base = matches[1];
            id = matches[2];
            xhr = new XMLHttpRequest();

            xhr.open('POST', base + 'down.php', true);
            xhr.responseType = "arraybuffer";

            xhr.onload = function() {
                var blob = new Blob([xhr.response], {type: 'application/octet-stream'});
                dfd.resolve(blob);
            };
            xhr.timeout = 60 * 1000;
            xhr.onerror = function () {
                dfd.reject('网络错误');
            };
            xhr.ontimeout = function () {
                dfd.reject('下载bt超时');
            };


            data = new FormData();
            data.append('type', 'torrent');
            data.append('name', 'null');
            data.append('id', id);

            xhr.send(data);
        } else {
            dfd.reject('bt地址错误');
        }

        return dfd.promise();
    }

    function init () {
        if (!location.href.match(/\/p2p\/\w+\/[\w\-]+\.html/i)) {
            return;
        }

        $(document)
        .on('mouseenter', 'a[href]', function () {
            var $link = $(this),
                href = $link.prop('href');

            if (!$link.hasClass('private-play-download-link') && isPrivateBtUrl(href)) {
                $link.addClass('private-play-download-link');
            }
        })
        .on('click', 'a.private-play-download-link', function (evt) {
            // 拦截
            if (adapter.isDefaultPrevented(evt)) {
                return;
            }

            evt.preventDefault();
            alertify.log('正在下载中... 同时 `Shift+单击` 可云播');
            download($(this).prop('href'))
            .fail(function () {
                alertify.error('网络错误，下载失败');
            });
        });
    }

    module.exports = {
        init: init,
        isPrivateBtUrl: isPrivateBtUrl,
        download: download,
        load: load
    };
});
