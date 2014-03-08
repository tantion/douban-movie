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
                header.name = o.value;
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
            "http://www.baidu.com/s*"
        ]},
        ["blocking", "responseHeaders"]
    );

})();
