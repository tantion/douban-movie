//
// 在线观看地址
// http://so.iqiyi.com/so/q_#keyword#
//
define('js/bt-iqiyi', function(require, exports, module) {
    "use strict";

    var $ = require('jquery'),
        m = require('mustache'),
        ITEMS_CACHE = {},
        timeout = 30 * 1000,
        sources = {
            'www.iqiyi.com': '爱奇艺',
            'www.letv.com': '乐视TV',
            'www.56.com': '56视频',
            'www.funshion.com': '风行视频',
            'tv.sohu.com': '搜狐视频',
            'v.qq.com': '腾讯视频',
            'www.pps.tv': 'PPS',
            'v.pps.tv': 'PPS',
            'ipd.pps.tv': 'PPS',
            'v.youku.com': '优酷',
            'www.tudou.com': '土豆',
            'vod.kankan.com': '迅雷看看',
            'www.m1905.com': 'M1905',
            'v.ku6.com': '酷六'
        };

    function searchTitle (title, pubYear, istv) {
        var dfd = new $.Deferred(),
            items = [],
            url = 'http://so.iqiyi.com/so/q_#keyword#';

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
                timeout: timeout,
                xhrFields: {
                    withCredentials: false
                }
            })
            .done(function (html) {
                html = html.replace(/src=/ig, 'data-src=');
                var $html = $($.parseHTML(html)),
                    $container = $html.find('.s_main-mx'),
                    $container2 = $html.find('.mod_sideright'),
                    $items = $container.find('[data-widget-searchlist-elem="item"]'),
                    items = [];


                items = $.map($items, function (item) {
                    var $item = $(item),
                        $title = $item.find('.film_about h2'),
                        $link = $title.find('a.orange'),
                        title = $.trim($title.text()),
                        year = $.trim($title.find('.gray12 a').text()).replace(/(\d+)年/, '$1'),
                        type = title.match(/\[(\S+)\]/),
                        href = $link.prop('href') || '',
                        source = $link.length ? $link[0].hostname : '';

                    if (type && type.length) {
                        type = type[1];
                    }

                    if (!(/\d+/.test(year))) {
                        year = '';
                    }

                    if (sources.hasOwnProperty(source)) {
                        source = sources[source];
                    }

                    title = $link.attr('title');

                    if (((istv && (type === '连续剧' || type === '纪录片')) || (!istv && type === '电影')) &&
                        title && href && (!year || (year && parseInt(year, 10) === pubYear))) {
                        return {
                            source: source,
                            type: type,
                            year: year,
                            href: href,
                            title: title
                        };
                    }
                });

                if (!istv) {
                    $container2.find('> ul > li')
                    .each(function () {
                        var $item = $(this),
                            $link = $item.find('a.piclist_img'),
                            source = $link.length ? $link[0].hostname : '',
                            title = $.trim($item.find('.piclist_title').text());

                        if (sources.hasOwnProperty(source)) {
                            source = sources[source];
                        }

                        if (title.indexOf('[电影]') > -1 && source) {
                            items.push({
                                source: source,
                                type: '电影',
                                year: '',
                                href: $link.attr('href'),
                                title: $link.find('img').attr('title') || title
                            });
                        }
                    });
                }

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
                      '<a title="点击打开播放页面" target="_blank" href="{{href}}">' +
                      '{{#source}}[{{source}}] {{/source}}{{title}}' +
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

            searchTitle(title, subject.year, subject.istv)
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
        name: '在线观看',
        search: search
    };
});
