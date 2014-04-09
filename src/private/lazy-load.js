//
// lazy load image
//
define('private/lazy-load', function (require, exports, module) {
    "use strict";

    if (!location.href.match(/\/private\/detail\.html/)) {
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
                verticalFit: false
            },
            type: 'image'
        });
    }

    var $ = require('jquery'),
        $content = $('<div id="main">loading</div>'),
        $header = $('<h3/>'),
        url = location.href.replace(/.*html\?url=(.*)$/, '$1');

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
            $main = $html.filter('#main');

        $main.find('img').each(function () {
            var $img = $(this),
                src = $img.data('src'),
                $link = $('<a/>');

            $img.attr('data-original', src);
            $img.addClass('lazy-load-img');
            $link.attr('href', src);
            $link.addClass('magic-popup-link');
            $link.insertBefore($img);
            $link.append($img);
        });

        $header.text(title);
        document.title = title;
        $content.html($main.html());

        applyLazyLoad();
    })
    .fail(function () {
        $content.html('error');
    });

    document.title = 'loading';
    $('body').html($header).append($content);
    $('html').show();
});
