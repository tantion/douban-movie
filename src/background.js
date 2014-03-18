//
// cross domain request
//
(function () {
    "use strict";

    function extendHeaders (headers, o) {
        var header = null,
            finded = false;

        for (var i = 0, len = headers.length; i < len; i += 1) {
            header = headers[i];
            if (header.name === o.name) {
                header.value = o.value;
                finded = true;
            }
        }

        if (!finded) {
            headers.push(o);
        }
    }

    chrome.webRequest.onHeadersReceived.addListener(
        function(details) {
            var responseHeaders = details.responseHeaders;

            extendHeaders(responseHeaders, {
                name: 'Access-Control-Allow-Origin',
                value: 'http://movie.douban.com'
            });
            extendHeaders(responseHeaders, {
                name: 'Access-Control-Allow-Credentials',
                value: 'true'
            });

            return {
                responseHeaders: responseHeaders
            };
        },
        {urls: [
            "http://www.bttiantang.com/s.php?*",
            "http://www.bttiantang.com/subject/*",
            "http://www.bttiantang.com/download.php*",
            "http://yun.baidu.com/share/link*",
            "http://www.fangying.tv/category/key_*",
            "http://www.fangying.tv/f_*",
            "http://www.baidu.com/s*",
            "http://imax.im/api/movies/show.json*",
            "http://imax.im/movies/*",
            "http://btmee.net/search*",
            "http://www.shooter.cn/xml/sub/*",
            "http://www.shooter.cn/files/file3.php*",
            "http://www.shooter.cn/a/loadmain.js",
            "http://www.shooter.cn/search*"
        ]},
        ["blocking", "responseHeaders"]
    );
})();
