//
// bt 搜索提供者
// http://bemee.net
//
define(function(require, exports, module) {
    "use strict";

    var $ = require('jquery'),
        m = require('mustache'),
        ITEMS_CACHE = {},
        timeout = 30 * 1000;

    function searchTitle (title) {
        var dfd = new $.Deferred(),
            items = [],
            url = 'http://btmee.net/search/?q=#keyword#';

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
                type: 'POST',
                data: {q: title, sname: ''},
                timeout: timeout,
                xhrFields: {
                    withCredentials: true
                }
            })
            .done(function (html) {
                html = html.replace(/src=/ig, 'data-src=');
                var $html = $($.parseHTML(html)),
                    $items = $html.find('tbody .qvodView'),
                    items = [];

                items = $.map($items, function (item) {
                    var $item = $(item).closest('tbody'),
                        cat = $.trim($item.find('.cat').text()),
                        name = $.trim($item.find('.name').text()),
                        seed = $.trim($item.find('.seed').text()),
                        mag = $.trim($item.find('.magDown').attr('href')),
                        ed2k = $.trim($item.find('.ed2kDown').attr('ed2k')),
                        title = '',
                        href = '';

                    if (cat) {
                        title = '[' + cat + ']';
                    }
                    if (seed) {
                        title += '[<strong>' + seed + '</strong>]';
                    }

                    title += name;
                    href = mag ? mag : ed2k;

                    return {
                        href: href,
                        ed2k: ed2k,
                        mag: mag,
                        title: title
                    };
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
        name: 'BTmee',
        search: search
    };
});
