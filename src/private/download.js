//
// quick download
//
define('private/download', function (require, exports, module) {
    "use strict";

    if (!location.href.match(/\/private\/detail\.html/)) {
        return;
    }

    var $ = require('jquery'),
        $iframe = null;

    function download (url) {
        var dfd = new $.Deferred();

        $.ajax({
            url: url,
            type: 'get',
            dataType: 'text',
            timeout: 30 * 1000
        })
        .done(function (data) {
            var html = data.replace(/src=/ig, 'data-src='),
                $html = $($.parseHTML(html)),
                action = url.replace(/file\.php.*/i, 'down.php'),
                $form = $html.find('form');

            $form.attr('action', action);

            if (!$iframe) {
                $iframe = $('<iframe/>').hide().appendTo('body');
            }
            $iframe.html($form);

            $form[0].submit();

            dfd.resolve();
        })
        .fail(function () {
            dfd.reject();
        });

        return dfd.promise();
    }

    $(document)
    .on('mouseenter', 'a[href]', function () {
        var $link = $(this),
            $play = null,
            href = $link.prop('href');
        if (href.match(/^http:\/\/\w+\.kidown\.com\/\w+\/file\.php/i)) {
            $play = $link.next('.private-play-link');
            if (!$play.length) {
                $play = $('<a class="private-play-link" target="_blank" href="/private/play.html?url=' + href + '">云播</a>').insertAfter($link);
            }
        }
    })
    .on('click', 'a[href]', function (evt) {
        var $link = $(this),
            href = $link.prop('href');
        if (href.match(/^http:\/\/\w+\.kidown\.com\/\w+\/file\.php/i)) {
            evt.preventDefault();
            download(href)
            .fail(function () {
                $link.attr('title', '网络错误，无法下载');
            });
        }
    });
});
