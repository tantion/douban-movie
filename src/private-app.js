//
// seajs  jquery
//
define('jquery', function (require, exports, module) {
    "use strict";

    module.exports = window.noConfictJQuery;
});

//
// purl
//
define('purl', [], function (require, exports, module) {
    "use strict";

    module.exports = window.purl;
});

seajs.use('private/main');
