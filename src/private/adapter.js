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
        isAddAction: function (evt) {
            if (evt && !evt.shiftKey && !evt.altKey) {
                if (navigator.userAgent.match(/Macintosh/i)) {
                    if (!evt.ctrlKey && evt.metaKey) {
                        return true;
                    }
                } else {
                    if (evt.ctrlKey && !evt.metaKey) {
                        return true;
                    }
                }
                return false;
            }
            return false;
        },
        isDefaultPrevented: function (evt) {
            if (adapter.isYunAction(evt) || adapter.isPrivateAction(evt) || adapter.isAddAction(evt)) {
                return true;
            }
            return false;
        }
    };

    module.exports = adapter;
});

