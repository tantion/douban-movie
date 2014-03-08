//
// bt 搜索提供者
// http://yun.baidu.com
//
define(function(require, exports, module) {
    "use strict";

    var $ = require('jquery'),
        timeout = 20 * 1000;

    function _downloadUrl () {
        /*jshint validthis: true */
        var url = this.href,
            dfd = new $.Deferred();

        window.open(url, '_baiduyun');

        return dfd.promise();
    }

    function searchTitle (title) {
        var dfd = new $.Deferred(),
            data = null,
            url = 'http://www.baidu.com/s?wd=#keyword#%20torrent%20site%3Apan.baidu.com';

        url = url.replace('#keyword#', encodeURIComponent(title));

        $.ajax({
            url: url,
            type: 'GET',
            timeout: timeout,
            xhrFields: {
                withCredentials: true
            }
        })
        .done(function (html) {
            html = html.replace(/src=/ig, 'data-src=');
            var $html = $($.parseHTML(html)),
                $items = $html.find('.c-container'),
                items = [];

            $items.each(function () {
                var $item = $(this),
                    $link = $item.find('.t a').eq(0),
                    $desc = $item.find('.c-abstract').eq(0),
                    title = $.trim($desc.text()),
                    size = '',
                    matches = title.match(/文件名:(.+) 文件大小:(.+) 分享者/);

                if (matches && matches.length > 2) {
                    title = matches[1];
                    size = matches[2];
                    if (size) {
                        title += ' ' + size;
                    }
                } else {
                    title = '';
                }

                if (title) {
                    items.push({
                        href: $link.attr('href'),
                        download: _downloadUrl,
                        title: title,
                        files: null
                    });
                }
            });

            if (items.length) {
                data = {items: items};
                dfd.resolve(data);
            } else {
                dfd.reject();
            }
        })
        .fail(function () {
            dfd.reject();
        });

        return dfd.promise();
    }

    function searchItems (urls) {
        var dfd = new $.Deferred();

        return dfd.promise();
    }


    function subjectTitle (subject) {
        return subject.title2 || subject.title || '';
    }

    function search (subject) {
        var title = subjectTitle(subject),
            dfd = new $.Deferred();

        if (title) {
            dfd.notify('正在加载搜索结果，请耐心等待...');

            searchTitle(title)
            .done(function (data) {
                dfd.resolve(data);
            })
            .fail(function () {
                dfd.reject();
            });
        } else {
            dfd.reject();
        }

        return dfd.promise();
    }

    module.exports = {
        search: search
    };
});
