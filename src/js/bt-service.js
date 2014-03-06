//
// bt search service
//
define(function(require, exports, module) {
    "use strict";

    var $ = require('jquery'),
        providers = [require('js/bttiantang'), require('js/btzhijia')];

    var BtService = function () {
        this.subject = null;
    };

    BtService.prototype = {

        constructor: BtService,

        search: function (subject) {
            this.subject = subject;

            var dfd = new $.Deferred();
                pds = providers.slice(0),
                pd = null;

            if (pds.length) {
                pd = pds.unshift();
                pd.search(subject)
                .done(function (items) {
                    
                });
            }

            dfd.resolve(subject);

            return dfd.promise();
        }
    };

    module.exports = {
        search: function (subject) {
            return (new BtService()).search(subject);
        }
    };
});
