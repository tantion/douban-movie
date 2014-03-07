//
// bt 搜索提供者
// http://www.bttiantang.com
//
define(function(require, exports, module) {
    "use strict";

    var $ = require('jquery');

    function search (subject) {
        var dfd = new $.Deferred();

        dfd.resolve({
            items: function () {
                return [{
                    url: function () {
                        var dfd = $.Deferred();

                        dfd.resolve('/');

                        return dfd.promise();
                    },
                    title: 'torrent',
                    files: [
                        {title: 'torrent-dir', size: ''},
                        {title: 'torrent-file', size: '1Gb'}
                    ]
                }, {
                    url: function () {},
                    title: 'torrent',
                    files: [
                        {title: 'torrent-dir', size: ''},
                        {title: 'torrent-file', size: '1Gb'}
                    ]
                }];
            },
            meta: {
                title: 'BT天堂',
                provider: 'www.bttiantang.com',
                source: ''
            }
        });

        return dfd.promise();
    }

    module.exports = {
        search: search
    };
});
