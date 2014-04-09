//
// lazy load image
//
define('private/lazy-load', function (require, exports, module) {
    "use strict";

    var $ = require('jquery');

    $('.lazy-load-img').lazyload();

    $(document).magnificPopup({
        delegate: '.magic-popup-link',
        gallery: {
            enabled: true
        },
        image: {
            verticalFit: false
        },
        type: 'image'
    });

});
