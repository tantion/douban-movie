//
// yun
//
define('private/yun', function (require, exports, module) {
    "use strict";

    var $ = require('jquery'),
        purl = require('purl');

    function requestTorrent (url) {
        var dfd = $.Deferred(),
            oReq = new XMLHttpRequest(),
            matches = url.match(/^(http:\/\/\w+\.kidown\.com\/\w+\/)file\.php\/(\w+)\.html/i);

        if (matches && matches.length) {
            oReq.open('POST', matches[1] + 'down.php', true);
            oReq.responseType = "arraybuffer";

            oReq.onload = function() {
                var blob = new Blob([oReq.response], {type: 'application/octet-stream'});
                dfd.resolve(blob);
            };
            oReq.onerror = function () {
                dfd.reject();
            };

            var data = new FormData();
            data.append('type', 'torrent');
            data.append('name', 'null');
            data.append('id', matches[2]);

            oReq.send(data);
        } else {
            oReq.open('GET', url, true);
            oReq.responseType = "arraybuffer";

            oReq.onload = function() {
                var blob = new Blob([oReq.response], {type: 'application/octet-stream'});
                dfd.resolve(blob);
            };
            oReq.onerror = function () {
                dfd.reject();
            };

            oReq.send();
        }

        return dfd.promise();
    }

    module.exports = {
        requestHash: function () {
            var dfd = $.Deferred(),
                params = purl(location.href).param(),
                url = params.url || '',
                infohash = params.infohash || '';

                console.log(infohash);
            if (infohash) {
                dfd.resolve(infohash);
            } else {
                this.upload(url)
                .done(function (infohash) {
                    history.replaceState(null, null, location.pathname + '?infohash=' + infohash);
                    dfd.resolve(infohash);
                })
                .fail(function () {
                    dfd.reject();
                });
            }

            return dfd.promise();
        },
        upload: function (url) {
            var dfd = $.Deferred();

            requestTorrent(url)
            .done(function (torrent) {
                var formData = new FormData(),
                    xhr = new XMLHttpRequest();

                formData.append('Filename', 'null.torrent');
                formData.append('Filedata', torrent, 'null.torrent');
                formData.append('Upload', 'Submit Query');

                xhr.open('POST', 'http://i.vod.xunlei.com/submit/post_bt', true);
                xhr.responseType = 'json';
                xhr.onload = function () {
                    var data = xhr.response;
                    if (data.infohash) {
                        dfd.resolve(data.infohash);
                    } else {
                        dfd.reject();
                    }
                };
                xhr.onerror = function () {
                    dfd.reject();
                };

                xhr.send(formData);
            })
            .fail(function () {
                dfd.reject();
            });

            return dfd.promise();
        },

        requestList: function (infohash) {
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
                    dfd.reject();
                }
            })
            .fail(function () {
                dfd.reject();
            });

            return dfd.promise();
        },

        requestUrl: function (infohash) {
            var dfd = $.Deferred();

            this.requestList(infohash)
            .done(function (list) {
                var item = list[0];
                console.log(item);
            })
            .fail(function () {
                dfd.reject();
            });

            return dfd.promise();
        },

        hasLogin: function () {
            var dfd = $.Deferred();

            $.ajax({
                url: 'http://i.vod.xunlei.com/req_history_play_list/req_num/30/req_offset/0?type=kongjian&order=create&folder_id=0',
                type: 'get',
                dataType: 'json',
                timeout: 30 * 1000
            })
            .done(function (data) {
                if (data.resp.error_msg) {
                    dfd.reject();
                } else {
                    dfd.resolve();
                }
            })
            .fail(function () {
                dfd.reject();
            });

            return dfd.promise();
        },

        cookie: function (name) {
            var dfd = $.Deferred();

            chrome.runtime.sendMessage({
                action: 'cookie',
                data: {name: name}
            }, function (value) {
                console.log(value);
                dfd.resolve(value);
            });

            return dfd.promise();
        }
    };
});
