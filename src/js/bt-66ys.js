//
// bt 搜索提供者
// http://www.66ys.cc
//
define('js/bt-66ys', function(require, exports, module) {
    "use strict";

    var $ = require('jquery'),
        helper = require('js/helper'),
        m = require('mustache'),
        ITEMS_CACHE = {},
        SUBJECT_CACHE = {},
        timeout = 30 * 1000;

    var tmpl = '{{#items}}' +
               '<dl class="movie-improve-bt-dl">' +
                  '<dt class="movie-improve-bt-title">' +
                      '<a title="请右键复制下载地址或者点击下载。" class="private-play-download-link" href="{{href}}">{{&title}}</a>' +
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
                    $items = $html.find('table[bgcolor="#0099cc"]').find('a'),
                    items = [];

                items = $.map($items, function (item) {
                    var $item = $(item),
                        title = $.trim($item.text()),
                        href = $item.prop('href');

                    if (title && !href.match(/^http:\/\//i)) {
                        return {
                            href: href,
                            title: title,
                            files: null
                        };
                    }
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

    function searchSubject (title, year, actors) {
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
            .done(function (keyboard) {
                $.ajax({
                    url: 'http://www.66ys.cc/e/search/index123.php',
                    type: 'post',
                    timeout: timeout,
                    processData: false,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: 'tempid=1&tbname=article&show=title&keyboard=' + keyboard
                })
                .done(function (html) {
                    html = html.replace(/src=/ig, 'data-src=');

                    var subjectUrl = '',
                        $html = $($.parseHTML(html)),
                        $items = $html.find('table[width="388"]'),
                        finded = false,
                        items = [];

                    items = $.map($items, function (item) {
                        var $item = $(item),
                            $title = $item.find('a').eq(1),
                            itemTitle = $title.text(),
                            link = $title.prop('href'),
                            text = $item.find('td[valign="top"]').text();

                        if (itemTitle.indexOf(title) > -1) {
                            return {
                                href: link,
                                text: text,
                                title: itemTitle
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
                                if (!finded && item.text.indexOf(year) > -1) {
                                    subjectUrl = item.href;
                                    finded = true;
                                }
                            });
                        }
                    }

                    SUBJECT_CACHE[title] = subjectUrl;
                    if (subjectUrl) {
                        dfd.resolve(subjectUrl);
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
        var title = subject.title2 || subject.title,
            dfd = new $.Deferred();

        if (title) {
            dfd.notify('正在加载搜索结果，请耐心等待...');

            searchSubject(title, subject.year, subject.actors)
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
        } else {
            dfd.reject();
        }

        return dfd.promise();
    }

    module.exports = {
        name: '66影视',
        search: search
    };
});
