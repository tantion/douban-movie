//
// helper
//
define('js/helper', function(require, exports, module) {
    "use strict";

    var $ = require('jquery');

    // 千万别怨哥
    // 可用组件 http://www.1kjs.com/lib/widget/gbk/
    // 体验API https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
    // 最后决定用在线的
    function encodeGBK (txt) {
        var dfd = new $.Deferred();

        $.ajax({
            type: 'post',
            timeout: 30 * 1000,
            dataType: 'text',
            //url: 'http://www.url-encode-decode.com/process',
            //data: {
                //action: 'encode',
                //text: txt,
                //encoding: 'GBK'
            //}
            url: 'http://www.107000.com/T-UrlEncode/Defalut_files/UrlEncode.ashx',
            data: {
                t: 'jiaG',
                v: txt
            }
        })
        .done(function (code) {
            dfd.resolve(code);
        })
        .fail(function () {
            dfd.reject();
        });

        return dfd.promise();
    }



    module.exports = {
        encodeGBK: encodeGBK
    };
});
