//
// music musician page improve
// http://music.douban.com/musician/:id
//
define('js/template', ['jquery'], function(require, exports, module) {
    "use strict";

    var $ = require('jquery');

    function init () {
        if (!location.href.match(/^http:\/\/music\.douban\.com\/musician\/\d+/)) {
            return;
        }

    }

    module.exports = {
        init: init
    };
});
