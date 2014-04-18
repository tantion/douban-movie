//
// lazy load image
//
define('private/lazy-load', function (require, exports, module) {
    "use strict";

    if (!location.href.match(/private\/detail\.html/i)) {
        return;
    }

    function applyLazyLoad () {
        $('.lazy-load-img').lazyload();

        $(document).magnificPopup({
            delegate: '.magic-popup-link',
            gallery: {
                enabled: true
            },
            image: {
                verticalFit: false,
                titleSrc: function (mfp) {
                    return '<a href="#private-img-' + mfp.index + '" class="private-img-go">GO</a>';
                }
            },
            type: 'image'
        })
        .on('click', 'a.private-img-go', function () {
            $.magnificPopup.close();
        })
        .on('click', '.private-sidenav li', function () {
            var $item = $(this);

            $item.siblings().removeClass('active');
            $item.addClass('active');
        });
    }

    function applyAffix () {
        $('#private-affix-main').affix();
    }

    var $ = require('jquery'),
        purl = require('purl'),
        $main = $('<div id="main" class="container">' +
                  '<div class="row"><h3 id="private-header-top" class="private-header"></h3></div>' +
                  '<div class="row"><div class="col-md-9 private-content"></div><div class="col-md-3 private-sidebar"></div></div>' +
                  '</div>'),
        $header = $main.find('.private-header'),
        $content = $main.find('.private-content'),
        $sidebar = $main.find('.private-sidebar'),
        $navs = $('<div class="private-sidebar-main" id="private-affix-main">' +
                      '<ul class="nav private-sidenav">' +
                      '</ul>' +
                      '<a class="back-to-top" href="#private-header-top">返回顶部</a>' +
                  '</div>'),
        url = purl(location.href).param('url');

    function init () {
        $.ajax({
            url: url,
            type: 'get',
            timeout: 30 * 1000,
            dataType: 'text'
        })
        .done(function (data) {
            var html = data.replace(/src=/ig, 'data-src='),
                $html = $($.parseHTML(html)),
                $title = $html.filter('title'),
                title = $.trim($title.text()),
                $body = $html.filter('#main'),
                body = $body.find('#content').html() || '',
                names = [],
                index = 0,
                sections = [];

            if (body.match(/={5,}<br>\n/i)) {
                sections = body.split(/={5,}<br>\n/i);
                if (sections.length > 1) {
                    sections = sections.slice(1, sections.length - 2);
                }
            } else {
                sections = body.split(/<br>\n<br>\n/);
            }

            sections = $.map(sections, function (section) {
                var matches = section.match(/^(.*)<br>/i),
                    repl = '',
                    name = '';
                if (matches && matches.length) {
                    name = matches[1] || '';
                    repl = '<h4 class="private-section-name" id="private-section-name-' + index + '">' + name + '</h4>';
                    section = section.replace(/^.*<br>/i, repl);
                    index += 1;
                    names.push(name);
                }
                section = '<div class="private-section">' + section + '</div>';
                return section;
            });

            body = sections.join('<br>\n');
            $body = $body.html($.parseHTML(body));

            $body.find('img').each(function (i) {
                var $img = $(this),
                    src = $img.data('src'),
                    $link = $('<a/>');

                $img.attr('data-original', src);
                $img.addClass('lazy-load-img');
                $img.attr('id', 'private-img-' + i);
                $link.attr('href', src);
                $link.addClass('magic-popup-link');
                $link.insertBefore($img);
                $link.append($img);
            });

            var navs = '';
            $.each(names, function (i, name) {
                if (!i) {
                    navs += '<li class="active"><a href="#private-section-name-' + i +'">' + name + '</a></li>';
                } else {
                    navs += '<li class=""><a href="#private-section-name-' + i +'">' + name + '</a></li>';
                }
            });
            $navs.find('.private-sidenav').html(navs);
            $sidebar.html($navs);

            $header.text(title);
            document.title = title;
            $('html').addClass('loaded');
            $content.html($body.html());

            applyLazyLoad();
            applyAffix();
        })
        .fail(function () {
            $content.html('error');
        });

        document.title = 'loading';
        $('body').append($main);
    }

    module.exports = {
        init: init
    };
});
