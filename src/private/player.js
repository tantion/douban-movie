//
// player
//
define('private/player', function (require, exports, module) {
    "use strict";

    if (!location.href.match(/private\/play\.html/i)) {
        return;
    }

    var $ = require('jquery'),
        purl = require('purl'),
        aelem = document.createElement('a'),
        $container = $('.container'),
        $content = $('.video-container'),
        $nav = $('.video-nav'),
        yun = require('private/yun'),
        alertify = require('alertify'),
        params = purl(location.href).param(),
        infohash = params.infohash || '',
        url = params.url || '';

    function closeLogs () {
        $('article.alertify-log-show').click();
    }

    function postMessageToPlay (url) {
        window.postMessage({action: 'play', url: url}, '*');
    }

    function requestHash () {
        var dfd = $.Deferred();

        if (infohash) {
            dfd.resolve(infohash);
        } else {
            if (url) {
                yun.requestHash(url)
                .done(function (hash) {
                    infohash = hash;
                    history.replaceState(null, null, location.pathname + '?infohash=' + hash);
                })
                .fail(function (msg) {
                    dfd.reject(msg);
                });
            }
        }

        return dfd.promise();
    }

    function init () {
        requestHash()
        .done(function (hash) {
            yun.requestUrlByHash(hash)
            .done(function (urls) {
                aelem.setAttribute('href', urls[0].vod_url);
                url = 'http://' + aelem.host + '/*';
                chrome.runtime.sendMessage({action: 'referer', data: {url: url}});
            })
            .done(function (urls) {
                var navs = $.map(urls, function (url, i) {
                    var m3u8 = url.vod_url,
                    flv = url.vod_url_dt17,
                    title = '流畅版';

                    if (i === 1) {
                        title = '高清版';
                    }
                    else if (i > 1) {
                        title = '超清版';
                    }

                    return '<li><a class="private-play-vod" href="/private/play.html?flv=' + encodeURIComponent(flv) + '&m3u8=' +
                        encodeURIComponent(m3u8) + '" data-flv="' + flv + '" data-m3u8="' + m3u8 + '">' + title +
                        '</a><a href="' + flv + '">flv</a>' + '<a href="' + m3u8 + '">m3u8</a></li>';
                });
                navs = navs.join('\n');
                $nav.html(navs);

                postMessageToPlay({flv: urls[0].vod_url_dt17, m3u8: urls[0].vod_url});
            })
            .fail(function (msg) {
                alertify.error(msg || '未知错误');
            });
        })
        .fail(function (msg) {
            if (msg) {
                alertify.error(msg);
            }
        });

        $(document)
        .on('click', '.private-play-vod', function (evt) {
            evt.preventDefault();

            var $link = $(this),
                flv = $link.data('flv'),
                m3u8 = $link.data('m3u8');

            postMessageToPlay({flv: flv, m3u8: m3u8});
        });
    }

    module.exports = {
        init: init
    };
});
