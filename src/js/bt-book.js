//
// bt 搜索提供者
// http://btbook.net/
//
define('js/bt-book', function(require, exports, module) {
    "use strict";

    var $ = require('jquery'),
        m = require('mustache'),
        ITEMS_CACHE = {},
        timeout = 30 * 1000;

    function searchTitle (title) {
        var dfd = new $.Deferred(),
            items = [],
            url = 'http://btbook.net/search?q==#keyword#';

        url = url.replace('#keyword#', encodeURI(title));

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
                timeout: timeout
            })
            .done(function (html) {
                html = html.replace(/src=/ig, 'data-src=');
                var $html = $($.parseHTML(html)),
                    $items = $html.find('#wall .search-item'),
                    links = [],
                    items = [];

                items = $.map($items, function (item) {
                    var $item = $(item),
                        $title = $item.find('.item-title'),
                        $info = $item.find('.item-bar'),
                        $size = $info.find('span:contains(大小)').find('b'),
                        $link = $info.find('a.download'),
                        iTitle = $.trim($title.text()),
                        size = $.trim($size.text()),
                        href = $.trim($link.attr('href'));

                    if (iTitle.indexOf(title) > -1 && $.inArray(href, links) < 0) {
                        links.push(href);
                        return {
                            href: href,
                            size: size,
                            title: iTitle
                        };
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
                      '<a title="请右键复制下载地址或者点击下载。" class="private-play-download-link" href="{{href}}">' +
                      '<strong>{{#size}}[{{size}}]{{/size}}</strong> {{&title}}' +
                      '</a>' +
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
        name: 'Btbook',
        search: search
    };
});

