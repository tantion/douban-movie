//
// bt 搜索提供者
// http://www.bttiantang.com
//
define(function(require, exports, module) {
    "use strict";

    var $ = require('jquery'),
        purl = require('purl'),
        $iframe = null,
        timeout = 20 * 1000,
        SUBJECT_CACHE = {},
        ITEMS_CACHE = {};

    function _downloadUrl () {
        /*jshint validthis: true */
        var url = this.href,
            $form = null,
            params = purl(url).param(),
            dfd = new $.Deferred();

        if (url) {
            $form = $('<form method="POST" action="http://www.bttiantang.com/download.php">' +
              '<input type="hidden" name="action" value="download"/>' +
              '<input type="hidden" name="id" value="' + params.id + '"/> '+
              '<input type="hidden" name="uhash" value="' + params.uhash + '"/>' +
              '</form>');
            if (!$iframe) {
                $iframe = $('<iframe />').appendTo('body');
            }
            $iframe.html($form);
            $form.submit();
        } else {
            dfd.reject();
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

    function searchSubject (imdb) {
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
                var matches = html.match(/<div class="litpic"><a href="(\/subject\/\d+\.html)"/i);

                if (matches && matches.length > 1) {
                    subjectUrl = matches[1];
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
            data = null;

        if (ITEMS_CACHE.hasOwnProperty(subjectUrl)) {
            data = ITEMS_CACHE[subjectUrl];
            if (data) {
                dfd.resolve(data);
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

                $items.each(function () {
                    var $item = $(this),
                        $title = $item.children('a'),
                        $files = $item.find('.video');

                    items.push({
                        href: 'http://www.bttiantang.com' + $title.attr('href'),
                        download: _downloadUrl,
                        title: $.trim($title.text()),
                        files: $.map($files, _filterFiles)
                    });
                });

                if (items.length) {
                    data = {items: items};
                    ITEMS_CACHE[subjectUrl] = data;
                    dfd.resolve(data);
                } else {
                    ITEMS_CACHE[subjectUrl] = data;
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
            imdb = '' + subject.imdb,
            url = '';

        if (!imdb) {
            dfd.reject();
        } else {
            dfd.notify('正在加载搜索结果，服务器网络慢的话需要等待几秒...');

            searchSubject(imdb)
            .done(function (subjectUrl) {
                dfd.notify('马上就好，正在加载BT地址...');

                searchItems(subjectUrl)
                .done(function (data) {
                    dfd.resolve(data);
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
        search: search
    };
});
