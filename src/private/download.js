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

    $(document).on('click', 'a[href]', function (evt) {
        var $link = $(this),
            href = $link.prop('href');
        if (href.match(/file\.php/i)) {
            evt.preventDefault();
            download(href)
            .fail(function () {
                $link.attr('title', '网络错误，无法下载');
            });
        }
    });
});


