//
// bt 搜索提供者
// http://www.bttiantang.com
//
define('js/bt-tiantang', function(require, exports, module) {
    "use strict";

    var $ = require('jquery'),
        m = require('mustache'),
        purl = require('purl'),
        adapter = require('private/adapter'),
        alertify = require('alertify'),
        $iframe = null,
        timeout = 60 * 1000,
        SUBJECT_CACHE = {},
        ITEMS_CACHE = {};

    function isLoaderUrl(url) {
        if (/^http:\/\/www\.bttiantang\.com\/download\.php/i.test(url)) {
            return true;
        }
        return false;
    }

    function download (url) {
        var $form = null,
            params = purl(url).param(),
            dfd = new $.Deferred();

        if (params && params.id && params.uhash) {
            $form = $('<form method="POST" action="http://www.bttiantang.com/download.php">' +
              '<input type="hidden" name="action" value="download"/>' +
              '<input type="hidden" name="down" value="d1"/>' +
              '<input type="hidden" name="id" value="' + params.id + '"/> '+
              '<input type="hidden" name="uhash" value="' + params.uhash + '"/>' +
              '</form>');
            if (!$iframe) {
                $iframe = $('<iframe style="display: none;" />').appendTo('body');
            }
            $iframe.html($form);
            $form.submit();
        } else {
            dfd.reject();
        }

        return dfd.promise();
    }

    function load (url) {
        var dfd = $.Deferred(),
            params = purl(url).param(),
            data = null,
            xhr = null;

        if (params && params.id && params.uhash) {
            xhr = new XMLHttpRequest();

            xhr.open('POST', 'http://www.bttiantang.com/download.php', true);
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
            data.append('action', 'download');
            data.append('down', 'd1');
            data.append('id', params.id);
            data.append('uhash', params.uhash);

            xhr.send(data);
        } else {
            dfd.reject('地址错误');
        }

        return dfd.promise();
    }

    function _filterFiles (file) {
        var $file = $(file),
            $size = $file.find('small'),
            title = '',
            size = '';

        $size.remove();

        title = $.trim($file.text());
        title = title.replace(/\.(\w+)$/i, '.<strong>$1</strong>');

        size = $.trim($size.text());
        size = size ? '<strong>' + size + '</strong>' : '';

        title = size ? (title + ' ' + size) : title;

        return {title: title};
    }

    var tmpl = '{{#items}}' +
               '<dl class="movie-improve-bt-dl">' +
                  '<dt class="movie-improve-bt-title">' +
                      '<a title="点击下载种子" class="movie-improve-bt-download private-play-download-link" href="{{href}}">{{title}}</a>' +
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
        })
        .on('click', '.movie-improve-bt-download', function (evt) {
            if (adapter.isDefaultPrevented(evt)) {
                return;
            }

            evt.preventDefault();

            var $btn = $(this);

            alertify.log('正在下载中... 同时 `Shift+单击` 可云播');
            download($btn.attr('href'))
            .fail(function () {
                alertify.error('网络错误，下载失败');
            });

        });

        return $content;
    }

    function searchSubject (imdb, year) {
        var dfd = new $.Deferred(),
            subjectUrl = '';

        if (SUBJECT_CACHE.hasOwnProperty(imdb)) {
            subjectUrl = SUBJECT_CACHE[imdb];
            if (subjectUrl) {
                dfd.resolve(subjectUrl);
            } else {
                dfd.reject();
            }
        } else {
            $.ajax({
                url: 'http://www.bttiantang.com/s.php?q=#imdb#'.replace('#imdb#', imdb),
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
                    $items = $html.find('.ml .item'),
                    items = [];

                items = $.map($items, function (item) {
                    var $item = $(item),
                        $title = $item.find('.title'),
                        $link = $title.find('.tt a'),
                        year = parseInt($.trim($link.text()).replace(/.*\.(\d+)$/, '$1'), 10);

                    return {
                        href: $link.attr('href'),
                        year: year
                    };
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
                    subjectUrl = 'http://www.bttiantang.com' + subjectUrl;
                    SUBJECT_CACHE[imdb] = subjectUrl;
                    dfd.resolve(subjectUrl);
                } else {
                    SUBJECT_CACHE[imdb] = subjectUrl;
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
                    $items = $html.find('.tinfo'),
                    items = [];

                items = $.map($items, function (item) {
                    var $item = $(item),
                        $title = $item.children('a'),
                        $files = $item.find('.video');

                    return {
                        href: 'http://www.bttiantang.com' + $title.attr('href'),
                        title: $.trim($title.text()),
                        files: $.map($files, _filterFiles)
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
        var dfd = new $.Deferred(),
            imdb = '';

        // 可直接搜关键字
        if (subject.imdb) {
            imdb = '' + subject.imdb;
        } else {
            imdb = encodeURI(subject.title2);
        }

        if (!imdb) {
            dfd.reject();
        } else {
            dfd.notify('正在加载搜索结果，服务器网络慢的话需要等待几秒...');

            searchSubject(imdb, subject.year)
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
        name: 'BT天堂',
        load: load,
        isLoaderUrl: isLoaderUrl,
        search: search
    };
});
