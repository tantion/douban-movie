//
// inject script to document
//
define('js/inject', function(require, exports, module) {
    "use strict";

    function injectScript (src, options) {
        var url = src;
        if (url.indexOf('chrome-extension://') !== 0) {
            url = chrome.extension.getURL(url);
        }

        var script = document.createElement('script');
        script.src = url;
        script.type = 'text/javascript';

        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                script.setAttribute(key, options[key]);
            }
        }

        document.body.appendChild(script);
    }

    module.exports = injectScript;
});
