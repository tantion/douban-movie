//
// yun
//
define('private/yun', function (require, exports, module) {
    "use strict";

    var $ = require('jquery'),
        hashCache = {},
        logined = false,
        tt = require('js/bt-tiantang'),
        bt = require('private/bt');

    function hasLogin () {
        var dfd = $.Deferred();

        if (!logined) {
            $.ajax({
                url: 'http://i.vod.xunlei.com/req_history_play_list/req_num/30/req_offset/0?type=kongjian&order=create&folder_id=0',
                type: 'get',
                dataType: 'json',
                timeout: 30 * 1000
            })
            .done(function (data) {
                if (data.resp.error_msg) {
                    dfd.reject('云播需要 <a href="http://vod.xunlei.com" class="private-yunbo-login" target="_blank">登录迅雷会员</a>');
                } else {
                    logined = true;
                    dfd.resolve();
                }
            })
            .fail(function () {
                dfd.reject('网络错误');
            });
        } else {
            dfd.resolve();
        }

        return dfd.promise();
    }

    function uploadBt (blob) {
        var formData = new FormData(),
            dfd = $.Deferred(),
            xhr = new XMLHttpRequest();

        formData.append('Filename', 'null.torrent');
        formData.append('Filedata', blob, 'null.torrent');
        formData.append('Upload', 'Submit Query');

        xhr.open('POST', 'http://i.vod.xunlei.com/submit/post_bt', true);
        xhr.responseType = 'json';
        xhr.onload = function () {
            var data = xhr.response;
            if (data.infohash) {
                dfd.resolve(data.infohash);
            } else {
                dfd.reject('上传bt失败，或者bt无效');
            }
        };
        xhr.onerror = function () {
            dfd.reject('网络错误');
        };

        xhr.send(formData);

        return dfd.promise();
    }

    function checkUrl (url) {
        var dfd = $.Defer();

        return dfd.promise();
    }

    function requestHash (url) {
        var dfd = $.Deferred(),
            loader = null;

        if (hashCache.hasOwnProperty(url)) {
            dfd.resolve(hashCache[url]);
        } else {
            hasLogin()
            .done(function () {
                if (bt.isPrivateBtUrl(url) || tt.isTiangtangUrl(url)) {
                    if (bt.isPrivateBtUrl(url)) {
                        loader = bt.load(url);
                    } else {
                        loader = tt.load(url);
                    }

                    loader
                    .done(function (blob) {
                        uploadBt(blob)
                        .done(function (hash) {
                            hashCache[url] = hash;
                            dfd.resolve(hash);
                        })
                        .fail(function (msg) {
                            dfd.reject(msg);
                        });
                    })
                    .fail(function (msg) {
                        dfd.reject(msg);
                    });
                } else {
                    checkUrl(url)
                    .done(function (hash) {
                        hashCache[url] = hash;
                        dfd.resolve(hash);
                    })
                    .fail(function (msg) {
                        dfd.reject(msg);
                    });
                }
            })
            .fail(function (msg) {
                dfd.reject(msg);
            });
        }

        return dfd.promise();
    }

    function requestList (infohash) {
        var dfd = $.Deferred();

        $.ajax({
            url: 'http://i.vod.xunlei.com/req_subBT/info_hash/' + infohash + '/req_num/10/req_offset/0',
            type: 'get',
            timeout: 30 * 1000,
            dataType: 'json'
        })
        .done(function (data) {
            var list = data.subfile_list;
            if (list && list.length) {
                dfd.resolve(list);
            } else {
                dfd.reject('没有找到播放列表');
            }
        })
        .fail(function () {
            dfd.reject('网络错误');
        });

        return dfd.promise();
    }

    function yunCookie (name) {
        var dfd = $.Deferred();

        chrome.runtime.sendMessage({
            action: 'cookie',
            data: {name: name}
        }, function (value) {
            dfd.resolve(value);
        });

        return dfd.promise();
    }

    function buildVodUrl (infohash) {
        var dfd = $.Deferred();

        $.when(yunCookie('sessionid'), yunCookie('userid'))
        .done(function (sid, uid) {
            if (sid && uid) {
                var url = 'http://i.vod.xunlei.com/req_get_method_vod?url=bt%3A%2F%2F' + infohash + '%2F0&platform=1&userid=' + uid + '&vip=1&sessionid=' + sid;
                dfd.resolve(url);
            } else {
                dfd.reject('需要先登录迅雷');
            }
        })
        .fail(function () {
            dfd.reject('网络错误');
        });

        return dfd.promise();
    }

    function requestUrlByVod(vodUrl) {
        var dfd = $.Deferred();

        $.ajax({
            url: vodUrl,
            type: 'get',
            dataType: 'json',
            timeout: 30 * 1000
        })
        .done(function (data) {
            var urls = (data && data.resp) ? data.resp.vodinfo_list : [],
            url = '';
            if (urls && urls.length) {
                dfd.resolve(urls);
            } else {
                dfd.reject('转码未完成，无法播放');
            }
        })
        .fail(function () {
            dfd.reject('网络错误');
        });

        return dfd.promise();
    }

    function requestUrlByHash (infohash) {
        var dfd = $.Deferred();

        buildVodUrl(infohash)
        .done(function (vodUrl) {
            requestUrlByVod(vodUrl)
            .done(function (urls) {
                dfd.resolve(urls);
            })
            .fail(function (msg) {
                dfd.reject(msg);
            });
        })
        .fail(function (msg) {
            dfd.reject(msg);
        });

        return dfd.promise();
    }

    module.exports = {
        requestHash: requestHash,
        requestUrlByHash: requestUrlByHash,
        hasLogin: hasLogin,
        cookie: yunCookie
    };
});
