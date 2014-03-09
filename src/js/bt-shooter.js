//
// bt 字幕提供者
// http://www.shooter.cn
//
define(function(require, exports, module) {
    "use strict";

    var $ = require('jquery'),
        m = require('mustache'),
        timeout = 30 * 1000,
        SUBJECT_CACHE = {},
        ITEMS_CACHE = {};

    function download (url) {
    }

    var tmpl = '{{#items}}' +
               '<dl class="movie-improve-bt-dl">' +
                  '<dt class="movie-improve-bt-title">' +
                      '<a title="点击下载字幕文件" class="movie-improve-bt-download" href="{{href}}">{{title}}</a>' +
                  '</dt>' +
                  '{{#desc}}' +
                  '<dd class="movie-improve-bt-desc">{{&desc}}</dd>' +
                  '{{/desc}}' +
               '</dl>' +
               '{{/items}}';

    function renderItems (items) {
        var content = m.render(tmpl, {items: items}),
            $content = $(content);

        $content
        .on('mouseenter', '.movie-improve-bt-download', function (evt) {
            $(this).tipsy({gravity: 'w', offset: 3}).tipsy('show');
        })
        .on('click', '.movie-improve-bt-download', function (evt) {
            evt.preventDefault();

            var $btn = $(this);

            download($btn.attr('href'))
            .fail(function () {
                $btn.attr('title', '没有找到下载地址。');
            });

        });

        return $content;
    }

    function searchTitle (title) {
        var dfd = new $.Deferred(),
            url = 'http://www.shooter.cn/search2/' + encodeURI(title),
            items = null;

        if (ITEMS_CACHE.hasOwnProperty(title)) {
            items = ITEMS_CACHE[title];
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
                    $items = $html.find('#resultsdiv').eq(0).find('.introtitle'),
                    items = [];

                items = $.map($items, function (item) {
                    var $item = $(item),
                        desc = $item.closest('.sublist_box_title').next().html() || '',
                        size = $item.parent().next().attr('title'),
                        format = desc.search('VobSub') ? 'srt' : '',
                        lang = desc.match(/语言： ([^<]+)<\//),
                        note = desc.match(/调校：([^<]+)<\//),
                        name = $.trim($item.text());

                    if (format) {
                        desc = '[' + format + ']';
                    }
                    if (lang && lang[1]) {
                        desc += '[' + lang[1] + ']';
                    }
                    if (size) {
                        desc += '[' + size + ']';
                    }

                    name = desc + ' ' + name;

                    if (note && note[1]) {
                        desc = $.trim(note[1]);
                        if (desc.match(/^[\w和]+$/)) {
                            desc = '';
                        }
                    }

                    if (name.search(title) > -1) {
                        return {
                            href: 'http://shooter.cn' + $item.attr('href'),
                            title: name,
                            desc: desc
                        };
                    } else {
                        return null;
                    }
                });

                ITEMS_CACHE[title] = items;
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
        var dfd = new $.Deferred(),
            title = '' + subject.title2;

        if (!title) {
            dfd.reject();
        } else {
            dfd.notify('正在加载字幕...');

            searchTitle(title)
            .done(function (items) {
                dfd.resolve(renderItems(items));
            })
            .fail(function () {
                dfd.reject();
            });
        }

        return dfd.promise();
    }

    module.exports = {
        name: '射手字幕',
        search: search
    };
});
