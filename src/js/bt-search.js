//
// movie subject improve
// http://movie.douban.com/subject/:id
//
define('js/bt-search', function(require, exports, module) {
    "use strict";

    var $ = require('jquery'),
        dialog = null,
        m = require('mustache'),
        async = require('async'),
        providers = [
            require('js/bt-tiantang'),
            require('js/bt-fish'),
            //require('js/bt-imax'),
            require('js/bt-66ys'),
            //require('js/bt-fangying'),
            require('js/bt-mee'),
            require('js/bt-book'),
            //require('js/bt-baidu'),
            require('js/bt-iqiyi'),
            require('js/bt-shooter')
        ];

    function serializeSubject () {
        var subject = {},
            $content = $('#content'),
            $info = $('#info'),
            title = $.trim($('#content .related-info h2').text());

        subject.title2 = title.replace(/^(.+)的剧情简介.*$/, '$1');
        subject.title = $.trim($content.find('[property="v:itemreviewed"]').text());
        subject.stars = parseFloat($content.find('[property="v:average"]').text());
        subject.actors = $.trim($info.find('[rel="v:starring"]').parent().text());
        subject.year = parseInt($.trim($content.find('.year').text()).replace(/\((\d+)\)/, '$1'), 10);
        subject.imdb = $.trim($info.find('a[href^="http://www.imdb.com/title/tt"]').text());
        subject.istv = $content.find('.episode_list').length ? true : false;

        return subject;
    }

    function startSearch (subject, $nav, $content) {
        var index = $nav.data('index'),
            $target = $content.find($nav.attr('href')),
            $count = $nav.find('span'),
            pd = providers[index];

        pd.search(subject)
        .progress(function (tips) {
            $target.html(tips);
            $count.html('..');
        })
        .done(function (view, count) {
            $target.html(view);
            $count.html(count || 0);
        })
        .fail(function () {
            $target.html('没有搜到相关的bt种子，切换一下其他搜索试试。');
            $count.html(0);
        });
    }

    function activeSearch ($nav, $content) {
        var index = $nav.data('index'),
            $target = $content.find($nav.attr('href')),
            pd = providers[index];

        $nav.siblings().removeClass('active');
        $nav.addClass('active');
        $target.siblings().removeClass('active');
        $target.addClass('active');
    }

    function initDialog () {
        var tmpl = '<div class="movie-improve-bt-container">' +
                       '<div class="movie-improve-nav-container">' +
                           '{{#tabs}}' +
                           '{{#index}}&nbsp;|&nbsp;{{/index}}' +
                           '<a class="movie-improve-nav" data-index="{{index}}" href="#movie-improve-tab-{{index}}">{{name}} (<span>...</span>)</a>' +
                           '{{/tabs}}' +
                       '</div>' +
                       '<div class="movie-improve-tab-container">' +
                           '{{#tabs}}' +
                           '<div class="movie-improve-tab" id="movie-improve-tab-{{index}}"></div>' +
                           '{{/tabs}}' +
                       '</div>' +
                   '</div>',
            subject = serializeSubject(),
            tabs = null,
            $content = null;

        tabs = $.map(providers, function (pd, index) {
            return {
                name: pd.name || '未名',
                index: index
            };
        });

        $content = $(m.render(tmpl, {tabs: tabs}));

        $content
        .on('click', '.movie-improve-nav', function (evt) {
            evt.preventDefault();

            var $nav = $(this);

            activeSearch($nav, $content);
            startSearch(subject, $nav, $content);
        })
        .find('.movie-improve-nav')
        .each(function (index) {
            var $nav = $(this);

            // 默认选中第一个
            if (index === 0) {
                activeSearch($nav, $content);
            }
            startSearch(subject, $nav, $content);
        });

        dialog.setTitle(subject.title2 + ' BT地址列表');

        return $content;
    }

    function setTotalCount ($btn, total) {
        var text = $btn.text() || '';
        text = text.replace(/\(.+\)/, '(' + total + ')');
        $btn.text(text);
    }

    function init () {
        if (!location.href.match(/^http:\/\/movie\.douban\.com\/subject\/\d+/)) {
            return;
        }
        /* global dui: true */
        var $btn = $('<div><span class="pl">BT地址:</span> <a href="javascript:" class="movie-improve-open-link">打开列表 (..)</a></div>').appendTo('#info').find('a');

        $btn.on('click', function (evt) {
            evt.preventDefault();
            if (!dialog) {
                dialog = dui.Dialog({nodeId: 'movie-improve-dialog', width: 700}, true);
            }
            dialog.setContent(initDialog());
            dialog.open();
        });

        var subject = serializeSubject(),
            total = 0;
        async.each(providers, function (provider, fun) {
            if (provider.name !== '射手字幕') {
                provider
                .search(subject)
                .done(function (result, len) {
                    total += len;
                    setTotalCount($btn, total);
                })
                .always(function () {
                    fun();
                });
            } else {
                fun();
            }
        }, function (err) {
            setTotalCount($btn, total);
        });
    }

    module.exports = {
        init: init
    };
});
