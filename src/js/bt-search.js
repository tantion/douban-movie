//
// movie subject improve
// http://movie.douban.com/subject/:id
//
define(function(require, exports, module) {
    "use strict";

    var $ = require('jquery'),
        dialog = null,
        m = require('mustache'),
        service = require('js/bt-service');

    function serializeSubject () {
        var subject = {},
            $content = $('#content'),
            $info = $('#info');

        subject.title = $.trim($content.find('[property="v:itemreviewed"]').text());
        subject.imdb = $.trim($info.find('a[href^="http://www.imdb.com/title/tt"]').text());

        return subject;
    }

    var tmpl = '<div class="movie-improve-bt-container">' +
                   '{{#items}}' +
                   '<dl class="movie-improve-bt-dl">' +
                      '<dt class="movie-improve-bt-title">{{title}}<a data-index="{{index}}" class="movie-improve-bt-download" href="javascript:">下载</a></dt>' +
                      '{{#files}}' +
                      '<dd class="movie-improve-bt-desc">{{title}} - {{size}}</dd>' +
                      '{{/files}}' +
                   '</dl>' +
                   '{{/items}}' +
               '</div>';

    function renderItems (items) {
        $.each(items, function (index, item) {
            item.index = index;
        });

        var content = m.render(tmpl, {items: items}),
            $content = $(content);

        $content.on('click', '.movie-improve-bt-download', function (evt) {
            evt.preventDefault();

            var $btn = $(this),
                index = parseInt($btn.data('index'), 10),
                item = items[index];

            item.url()
            .done(function (url) {
                location.href = url;
            })
            .fail(function () {
                $btn.attr('title', '没有找到下载地址。').tipsy({gravity: 'w'}).tipsy('show');
            });

        });

        return $content;
    }

    function searchBT () {
        service.search(serializeSubject())
        .done(function (bt) {
            var items = bt.items(),
                contents = renderItems(items);

            dialog.setContent(contents);
        })
        .fail(function () {
            dialog.setContent('抱歉，没有找到相关的bt地址。');
            setTimeout(function () {
                dialog.close();
            }, 1000);
        });
    }

    function init () {
        if (!location.href.match(/^http:\/\/movie\.douban\.com\/subject\/\d+/)) {
            return;
        }

        Do.ready('dialog', function () {
            /* global dui: true */
            var $btn = $('<div><span class="pl">BT地址:</span> <a href="javascript:">打开列表</a></div>').appendTo('#info').find('a');

            $btn.on('click', function (evt) {
                evt.preventDefault();
                if (!dialog) {
                    dialog = dui.Dialog({width: 600, title: 'BT地址列表'}, true);
                }
                dialog.setContent('正在查找中...');
                dialog.open();

                searchBT();
            });
        });
    }

    module.exports = {
        init: init
    };
});
