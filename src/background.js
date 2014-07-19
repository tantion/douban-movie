
//
// 修改 post 的 refer
// 为了修改 Referer 我容易吗
//

// 改变文件名
chrome.webRequest.onHeadersReceived.addListener(function (details) {
    "use strict";

    var found = false;
    var filename = details.url.match(/\/([^\/]+$)/);
    var value = '';

    if (filename && window.gbk) {
        filename = filename[1];
        try {
            filename = window.gbk.decode(filename);
        } catch (ex) {
        }
    }

    filename =  filename || 'filename.rar';

    value = 'attachment; filename="' + filename + '"';

    for (var i = 0, len = details.responseHeaders.length; i < len; i += 1) {
        if (details.responseHeaders[i].name === 'Content-Disposition') {
            details.responseHeaders[i].value = value;
            found = true;
        }
    }

    if (!found) {
        details.responseHeaders.push({
            name: 'Content-Disposition',
            value: value
        });
    }

    return {responseHeaders: details.responseHeaders};
},
{urls: ["http://www.bitfish8.com/uploads/soft/*"]},
["blocking", "responseHeaders"]);

chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
    "use strict";

    for (var i = 0, len = details.requestHeaders.length; i < len; i += 1) {
        if (details.requestHeaders[i].name === 'Referer') {
            details.requestHeaders[i].value = 'http://www.bttiantang.com/download.php';
            break;
        }
    }
    return {requestHeaders: details.requestHeaders};
},
{urls: ["http://192.184.95.23/?infohash=*"]},
["blocking", "requestHeaders"]);

chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
    "use strict";

    for (var i = 0, len = details.requestHeaders.length; i < len; i += 1) {
        if (details.requestHeaders[i].name === 'Referer') {
            details.requestHeaders[i].value = details.url;
            break;
        }
    }
    return {requestHeaders: details.requestHeaders};
},
{urls: ["http://*/*/down.php", "http://i.vod.xunlei.com/*", "http://www.bitfish8.com/uploads/soft/*"]},
["blocking", "requestHeaders"]);

var urls = [];
function refererHandle (details) {
    "use strict";

    for (var i = 0, len = details.requestHeaders.length; i < len; i += 1) {
        if (details.requestHeaders[i].name === 'Referer') {
            details.requestHeaders[i].value = details.url;
            break;
        }
    }
    return {requestHeaders: details.requestHeaders};
}

chrome.runtime.onMessage.addListener(function (message, sender, sendRespone) {
    "use strict";

    var tabIndex;

    if (sender && sender.tab) {
        tabIndex = sender.tab.index + 1;
    }

    if (message.action === 'cookie') {
        var name = message.data.name;
        chrome.cookies.get({url: 'http://vod.xunlei.com', name: name}, function (cookie) {
            var value = cookie ? cookie.value : '';
            sendRespone(value);
        });
        return true;
    }
    else if (message.action === 'referer') {
        var url = message.data.url;
        if (urls.indexOf(url) === -1) {
            urls.push(url);
            chrome.webRequest.onBeforeSendHeaders.removeListener(refererHandle);
            chrome.webRequest.onBeforeSendHeaders.addListener(refererHandle, {urls: urls}, ["blocking", "requestHeaders"]);
        }
    }
    else if (message.action === 'openurl') {
        var href = message.data.url;
        if (href) {
            chrome.tabs.create({url: href, index: tabIndex});
        }
    }
});
