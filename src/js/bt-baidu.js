//
// bt 搜索提供者
// http://yun.baidu.com
//
define('js/bt-baidu', function(require, exports, module) {
    "use strict";

    var $ = require('jquery'),
        m = require('mustache'),
        ITEMS_CACHE = {},
        timeout = 30 * 1000;

    function searchTitle (title) {
        var dfd = new $.Deferred(),
            items = [],
            url = 'http://www.baidu.com/s?wd=intitle%3A%28"#keyword#"%2B"torrent"%29%20site%3Apan.baidu.com';

        url = url.replace('#keyword#', encodeURIComponent(title));

        if (ITEMS_CACHE.hasOwnProperty(url)) {
            items = ITEMS_CACHE[url];
            if (items && items.length) {
                dfd.resolve(items);
            } else {
                dfd.reject();
            }
        } else {
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
                        desc = $.trim($desc.text()),
                        title = $.trim($link.text()).replace(/^(.+)_免费高速.*$/, '$1'),
                        size = '',
                        descTitle = '',
                        matches = desc.match(/文件大小:([\w\.]+) /);

                    if (!matches) {
                        matches = desc.match(/下载\(([\w\.]+)\)/);
                    }

                    if (title.indexOf('...') === 0) {
                        descTitle = desc.match(/(.+) 保存至网盘/);
                        if (descTitle) {
                            title = descTitle[1];
                        }
                    }

                    if (matches && matches.length > 1) {
                        size = matches[1];
                        if (size) {
                            title += ' ' + size;
                        }
                    }

                    if (title) {
                        items.push({
                            href: $link.attr('href'),
                            title: title
                        });
                    }
                });

                ITEMS_CACHE[url] = items;
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

    var tmpl = '{{#items}}' +
               '<dl class="movie-improve-bt-dl">' +
                  '<dt class="movie-improve-bt-title">' +
                      '<a title="点击打开种子下载页面" target="_blank" href="{{href}}">{{title}}</a>' +
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

    function subjectTitle (subject) {
        return subject.title2 || subject.title || '';
    }

    function search (subject) {
        var title = subjectTitle(subject),
            dfd = new $.Deferred();

        if (title) {
            dfd.notify('正在加载搜索结果，请耐心等待...');

            searchTitle(title)
            .done(function (items) {
                dfd.resolve(renderItems(items), items.length);
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
        name: '百度云',
        search: search
    };
});
