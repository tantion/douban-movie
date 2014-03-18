//
// bt 搜索提供者
// http://imax.im
//
define(function(require, exports, module) {
    "use strict";

    var $ = require('jquery'),
        m = require('mustache'),
        timeout = 30 * 1000,
        SUBJECT_CACHE = {},
        ITEMS_CACHE = {};

    var tmpl = '{{#items}}' +
               '<dl class="movie-improve-bt-dl">' +
                  '<dt class="movie-improve-bt-title">' +
                      '<a title="请右键复制下载地址或者点击下载。" href="{{href}}">{{&title}}</a>' +
                  '</dt>' +
                  '{{#files}}' +
                  '<dd class="movie-improve-bt-desc">{{&title}}</dd>' +
                  '{{/files}}' +
               '</dl>' +
               '{{/items}}';

    function renderItems (items) {
        var content = m.render(tmpl, {items: items}),
            $content = $(content);

        $content
        .on('mouseenter', 'a', function (evt) {
            $(this).tipsy({gravity: 'w', offset: 3}).tipsy('show');
        });

        return $content;
    }

    function searchSubject (url) {
        var dfd = new $.Deferred(),
            subjectUrl = '';

        if (SUBJECT_CACHE.hasOwnProperty(url)) {
            subjectUrl = SUBJECT_CACHE[url];
            if (subjectUrl) {
                dfd.resolve(subjectUrl);
            } else {
                dfd.reject();
            }
        } else {
            $.ajax({
                url: 'http://imax.im/api/movies/show.json?douban_url=#url#'.replace('#url#', url),
                type: 'GET',
                timeout: timeout,
                dataType: 'json'
            })
            .done(function (data) {
                var subjectUrl = '';
                if (data && data.has_attach && data.id) {
                    subjectUrl = 'http://imax.im/movies/' + data.id;
                    SUBJECT_CACHE[url] = subjectUrl;
                    dfd.resolve(subjectUrl);
                } else {
                    SUBJECT_CACHE[url] = subjectUrl;
                    dfd.reject();
                }
            })
            .fail(function () {
                dfd.reject();
            });
        }

        return dfd.promise();
    }

    function searchItems (subjectUrl) {
        var dfd = new $.Deferred(),
            items = null;

        if (ITEMS_CACHE.hasOwnProperty(subjectUrl)) {
            items = ITEMS_CACHE[subjectUrl];
            if (items) {
                dfd.resolve(items);
            } else {
                dfd.reject();
            }
        } else {
            $.ajax({
                url: subjectUrl,
                type: 'GET',
                timeout: timeout,
                xhrFields: {
                    withCredentials: true
                }
            })
            .done(function (html) {
                html = html.replace(/src=/ig, 'data-src=');
                var $html = $($.parseHTML(html)),
                    $items = $html.find('tr .attach'),
                    items = [];

                items = $.map($items, function (item) {
                    var $attach = $(item),
                        $item = $attach.closest('tr'),
                        qu = $.trim($item.find('.qu').text()),
                        size = $.trim($item.find('.size').text()),
                        name = $.trim($attach.text()),
                        href = $attach.attr('href'),
                        title = '';

                    if (qu) {
                        title = '[' + qu + ']';
                    }
                    if (size) {
                        title += '[<strong>' + size + '</strong>]';
                    }

                    title += name;

                    return {
                        href: href,
                        title: title
                    };
                });

                ITEMS_CACHE[subjectUrl] = items;
                if (items.length) {
                    dfd.resolve(items);
                } else {
                    dfd.reject();
                }
            })
            .fail(function () {
                dfd.reject();
            });
        }

        return dfd.promise();
    }

    function search (subject) {
        var dfd = new $.Deferred();

        dfd.notify('正在加载搜索结果，请稍候...');

        searchSubject(location.href)
        .done(function (subjectUrl) {
            dfd.notify('马上就好，正在加载下载地址...');

            searchItems(subjectUrl)
            .done(function (items) {
                dfd.resolve(renderItems(items), items.length);
            })
            .fail(function () {
                dfd.reject();
            });
        })
        .fail(function () {
            dfd.reject();
        });

        return dfd.promise();
    }

    module.exports = {
        name: 'IMAX.im',
        search: search
    };
});
