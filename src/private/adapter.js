//
// detect download or play
//
define('private/adapter', function (require, exports, module) {
    "use strict";

    var adapter = {
        isYunAction: function (evt) {
            if (evt && evt.shiftKey && !evt.altKey && !evt.ctrlKey && !evt.metaKey) {
                return true;
            }
            return false;
        },
        isPrivateAction: function (evt) {
            if (evt && !evt.shiftKey && evt.altKey && !evt.ctrlKey && !evt.metaKey) {
                return true;
            }
            return false;
        },
        isDefaultPrevented: function (evt) {
            if (adapter.isYunAction(evt) || adapter.isPrivateAction(evt)) {
                return true;
            }
            return false;
        }
    };

    module.exports = adapter;
});

