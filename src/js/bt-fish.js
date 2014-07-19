//
// bt 搜索提供者
// http://www.bitfish8.com
//
define('js/bt-fish', function(require, exports, module) {
    "use strict";

    var $ = require('jquery'),
        m = require('mustache'),
        purl = require('purl'),
        adapter = require('private/adapter'),
        alertify = require('alertify'),
        helper = require('js/helper'),
        $iframe = null,
        timeout = 60 * 1000,
        SUBJECT_CACHE = {},
        ITEMS_CACHE = {};

    var tmpl = '{{#items}}' +
               '<dl class="movie-improve-bt-dl">' +
                  '<dt class="movie-improve-bt-title">' +
                      '<a title="点击下载种子" download class="movie-improve-bt-download" href="{{href}}">{{title}}</a>' +
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
        .on('mouseenter', '.movie-improve-bt-download', function (evt) {
            $(this).tipsy({gravity: 'w', offset: 3}).tipsy('show');
        });

        return $content;
    }

    function searchSubject (title, year) {
        var dfd = new $.Deferred(),
            subjectUrl = '';

        if (SUBJECT_CACHE.hasOwnProperty(title)) {
            subjectUrl = SUBJECT_CACHE[title];
            if (subjectUrl) {
                dfd.resolve(subjectUrl);
            } else {
                dfd.reject();
            }
        } else {
            helper.encodeGBK(title)
            .done(function (keyword) {
                $.ajax({
                    url: 'http://www.bitfish8.com/plus/search.php?kwtype=0&q=#title#'.replace('#title#', keyword),
                    type: 'GET',
                    timeout: timeout,
                    xhrFields: {
                        withCredentials: true
                    }
                })
                .done(function (html) {
                    html = html.replace(/src=/ig, 'data-src=');

                    var subjectUrl = '',
                        $html = $($.parseHTML(html)),
                        $items = $html.find('.listbox .e2 li'),
                        items = [];

                    items = $.map($items, function (item) {
                        var $item = $(item),
                            $title = $item.find('a').eq(1),
                            $intro = $item.find('.intro'),
                            name = $.trim($title.text()),
                            href = $title.attr('href'),
                            intro = $intro.text() || '',
                            year = intro.replace(/.+年代：(\d+)年.+/, '$1');

                        if (year.match(/\d+/)) {
                            year = parseInt(year, 10);
                        } else {
                            year = 0;
                        }

                        if (name) {
                            return {
                                href: 'http://www.bitfish8.com' + href,
                                title: name,
                                year: year
                            };
                        }
                    });

                    // 确定最合适的那个链接
                    if (items.length > 0) {
                        subjectUrl = items[0].href;
                        // 有两个以上的链接，根据年份来确定，虽然可能并不准确
                        // 但是对于大部分同名或者包含子名的电影来说还是可以匹配的
                        if (items.length > 1) {
                            $.each(items, function (index, item) {
                                if (item.year === year) {
                                    subjectUrl = item.href;
                                }
                            });
                        }
                    }

                    if (subjectUrl) {
                        SUBJECT_CACHE[title] = subjectUrl;
                        dfd.resolve(subjectUrl);
                    } else {
                        SUBJECT_CACHE[title] = subjectUrl;
                        dfd.reject();
                    }
                })
                .fail(function () {
                    dfd.reject();
                });

            });
        }

        return dfd.promise();
    }

    function searchItems (subjectUrl) {
        var dfd = new $.Deferred(),
            items = null;

        if (ITEMS_CACHE.hasOwnProperty(subjectUrl)) {
            items = ITEMS_CACHE[subjectUrl];
            if (items && items.length) {
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
                    $item = $html.find('.downurllist a').eq(0),
                    $title = $html.find('.title h2'),
                    name = $.trim($title.text()),
                    href = $item.attr('href');


                if (!href) {
                    ITEMS_CACHE[subjectUrl] = [];
                    dfd.reject();
                    return;
                }

                $.ajax({
                    url: 'http://www.bitfish8.com' + href,
                    type: 'GET',
                    timeout: timeout
                })
                .done(function (html) {
                    html = html.replace(/src=/ig, 'data-src=');
                    var $html = $($.parseHTML(html)),
                        $item = $html.find('li a:contains(本地下载)'),
                        url = $item.attr('href'),
                        items = [];

                    if (url) {
                        items.push({
                            title: name,
                            href: 'http://www.bitfish8.com' + url
                        });
                    }

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
            })
            .fail(function () {
                dfd.reject();
            });
        }

        return dfd.promise();
    }

    function search (subject) {
        var dfd = new $.Deferred(),
            title = subject.title2;

        if (!title) {
            dfd.reject();
        } else {
            dfd.notify('正在加载搜索结果，服务器网络慢的话需要等待几秒...');

            searchSubject(title, subject.year)
            .done(function (subjectUrl) {
                dfd.notify('马上就好，正在加载BT地址...');

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
        }

        return dfd.promise();
    }

    module.exports = {
        name: '比特鱼',
        search: search
    };
});
