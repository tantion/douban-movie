//
// seajs  jquery
//
define('jquery', function (require, exports, module) {
    "use strict";

    module.exports = window.noConfictJQuery;
});

(function () {
    "use strict";

    seajs.use('private/handle-detail');
    seajs.use('private/lazy-load');
    seajs.use('private/download');
    seajs.use('private/player');

})();
