//
// seajs  jquery
//
define('jquery', [], function (require, exports, module) {
    "use strict";

    module.exports = window.noConfictJQuery;
});

//
// Mustache
//
define('mustache', [], function (require, exports, module) {
    "use strict";

    module.exports = window.Mustache;
});

//
// purl
//
define('purl', [], function (require, exports, module) {
    "use strict";

    module.exports = window.purl;
});

//
// async
//
define('async', [], function (require, exports, module) {
    "use strict";

    module.exports = window.async;
});

// main
seajs.use('js/main');
