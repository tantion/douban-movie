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
            $info = $('#info'),
            title = $.trim($('#content .related-info h2').text());

        subject.title2 = title.replace(/^(.+)的剧情简介.*$/, '$1');
        subject.title = $.trim($content.find('[property="v:itemreviewed"]').text());
        subject.imdb = $.trim($info.find('a[href^="http://www.imdb.com/title/tt"]').text());

        return subject;
    }

    var tmpl = '<div class="movie-improve-bt-container">' +
                   '{{#items}}' +
                   '<dl class="movie-improve-bt-dl">' +
                      '<dt class="movie-improve-bt-title"><a data-index="{{index}}" title="点击下载" class="movie-improve-bt-download" href="javascript:">{{title}}</a></dt>' +
                      '{{#files}}' +
                      '<dd class="movie-improve-bt-desc">{{&title}}</dd>' +
                      '{{/files}}' +
                   '</dl>' +
                   '{{/items}}' +
               '</div>';

    function renderItems (data) {
        $.each(data.items, function (index, item) {
            item.index = index;
        });

        var content = m.render(tmpl, data),
            $content = $(content);

        $content.on('click', '.movie-improve-bt-download', function (evt) {
            evt.preventDefault();

            var $btn = $(this),
                index = parseInt($btn.data('index'), 10),
                item = data.items[index];

            item.download()
            .fail(function () {
                $btn.attr('title', '没有找到下载地址。').tipsy({gravity: 'w'}).tipsy('show');
            });

        });

        return $content;
    }

    function searchBT () {
        service.search(serializeSubject())
        .progress(function (msg) {
            dialog.setContent(msg);
        })
        .done(function (data) {
            var contents = renderItems(data);

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
