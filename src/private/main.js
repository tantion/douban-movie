//
// private main
//
define('private/main', function (require, exports, module) {
    "use strict";

    var ms = [
        require('private/handle-detail'),
        require('private/lazy-load'),
        require('private/download'),
        require('private/player')
    ];

    var $ = require('jquery');

    ms.forEach(function (m) {
        if ($.isFunction(m.init)) {
            m.init();
        }
    });
});

