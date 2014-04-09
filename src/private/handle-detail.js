//
// use custom detail
//
define('private/handle-detail', function (require, exports, module) {
    "use strict";

    var $ = require('jquery');

    if (!location.href.match(/\/\d+\/\d+\.html/i)) {
        return;
    }

    $(document)
    .on('mousedown', 'a[href^="/p2p/"]', function (evt) {
        var $link = $(this),
            href = $link.prop('href');
        href = '/private/detail.html?url=' + href;
        $link.attr('href', href);
    });

});
