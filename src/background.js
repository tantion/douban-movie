
//
// 修改 post 的 refer
// 为了修改 Referer 我容易吗

chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
    "use strict";

    for (var i = 0; i < details.requestHeaders.length; i += 1) {
        if (details.requestHeaders[i].name === 'Referer') {
            details.requestHeaders[i].value = 'http://www.bttiantang.com/download.php';
            break;
        }
    }
    return {requestHeaders: details.requestHeaders};
},
{urls: ["http://192.184.95.23/?infohash=*"]},
["blocking", "requestHeaders"]);
