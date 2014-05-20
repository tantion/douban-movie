//
// yun
//
define('private/yun', function (require, exports, module) {
    "use strict";

    var $ = require('jquery'),
        hashCache = {},
        logined = false,
        loginError = '云播需要 <a href="http://vod.xunlei.com" class="private-yunbo-login" target="_blank">登录迅雷会员</a>',
        tt = require('js/bt-tiantang'),
        bt = require('private/bt');

    function isInfoHash (hash) {
        if (/^\w+$/i.test(hash)) {
            return true;
        }
        return false;
    }

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
                    dfd.reject(loginError);
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
                dfd.reject('bt地址无效');
            }
        };
        xhr.onerror = function () {
            dfd.reject('网络错误');
        };
        xhr.timeout = 60 * 1000;
        xhr.ontimeout = function () {
            dfd.reject('上传bt超时');
        };
        xhr.send(formData);

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
                    dfd.resolve(url);
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
            var list = data.resp && data.resp.subfile_list;
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

    var BTURL_CACHE = {};
    function requestBtUrl (infohash) {
        var dfd = $.Deferred();

        if (!BTURL_CACHE.hasOwnProperty(infohash)) {
            requestList(infohash)
            .done(function (urls) {
                var bturl = 'bt://' + infohash + '/' + urls[0].index;
                BTURL_CACHE[infohash] = bturl;
                dfd.resolve(bturl);
            })
            .fail(function (msg) {
                dfd.reject(msg);
            });
        } else {
            dfd.resolve(BTURL_CACHE[infohash]);
        }

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
                var url;
                if (isInfoHash(infohash)) {
                    requestBtUrl(infohash)
                    .done(function (bturl) {
                        url = 'http://i.vod.xunlei.com/req_get_method_vod?url='+  encodeURIComponent(bturl) + '&platform=1&userid=' + uid + '&vip=1&sessionid=' + sid;
                        dfd.resolve(url);
                    })
                    .fail(function (msg) {
                        dfd.reject(msg);
                    });
                } else {
                    url = 'http://i.vod.xunlei.com/req_get_method_vod?url=' + encodeURIComponent(infohash) + '&platform=1&userid=' + uid + '&vip=1&sessionid=' + sid;
                    dfd.resolve(url);
                }
            } else {
                dfd.reject(loginError);
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
            var resp = (data && data.resp) || {},
                urls = resp.vodinfo_list ? resp.vodinfo_list : [],
                error = resp.error_msg || '',
                permit = resp.vod_permit || {},
                url = '';
            if (urls && urls.length) {
                dfd.resolve(urls);
            } else {
                if (error.indexOf('no vod permition') > -1) {
                    if (permit.ret === 4) {
                        error = loginError;
                    } else {
                        error = '不是迅雷会员帐号，无法使用云播。';
                    }
                } else {
                    error = '转码未完成，无法播放';
                }
                dfd.reject(error);
            }
        })
        .fail(function () {
            dfd.reject('网络错误');
        });

        return dfd.promise();
    }

    function requestUrlByHash (infohash) {
        var dfd = $.Deferred();

        hasLogin()
        .done(function () {
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
        })
        .fail(function (msg) {
            dfd.reject(msg);
        });

        return dfd.promise();
    }

    function addByUrl (url) {
        var dfd = $.Deferred();

        requestHash(url)
        .done(function (hash) {
            $.when(yunCookie('userid'), yunCookie('sessionid'))
            .done(function (uid, sid) {
                var post = {};

                if (isInfoHash(hash)) {
                    post.urls = [{
                        id: 1,
                        url: 'bt://' + hash
                    }];
                } else {
                    post.urls = [{
                        id: 0,
                        url: hash
                    }];
                }

                if (uid && sid) {
                    $.ajax({
                        url: 'http://i.vod.xunlei.com/req_add_record?from=vlist&platform=0&userid=' + uid + '&sessionid=' + sid + '&folder_id=0',
                        type: 'post',
                        processData: false,
                        data: JSON.stringify(post),
                        dataType: 'json'
                    })
                    .done(function (data) {
                        var resp = (data && data.resp) || {};
                        if (resp && resp.res && resp.res.length) {
                            dfd.resolve();
                        } else {
                            if (resp.error_msg === 'session is wrong') {
                                dfd.reject(loginError);
                            } else {
                                dfd.reject('添加失败，可能是地址错误');
                            }
                        }
                    })
                    .fail(function () {
                        dfd.reject('网络错误');
                    });
                } else {
                    dfd.reject(loginError);
                }
            })
            .fail(function () {
                dfd.reject('网络错误');
            });
        })
        .fail(function (msg) {
            dfd.reject(msg);
        });

        return dfd.promise();
    }

    module.exports = {
        requestHash: requestHash,
        requestBtUrl: requestBtUrl,
        requestUrlByHash: requestUrlByHash,
        hasLogin: hasLogin,
        addByUrl: addByUrl,
        cookie: yunCookie
    };
});
