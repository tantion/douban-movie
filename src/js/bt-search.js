//
// movie subject improve
// http://movie.douban.com/subject/:id
//
define(function(require, exports, module) {
    "use strict";

    var $ = require('jquery'),
        bt = require('js/bt-service');

    function serializeSubject () {
        var subject = {},
            $content = $('#content'),
            $info = $('#info');

        subject.title = $.trim($content.find('[property="v:itemreviewed"]').text());
        subject.imdb = $.trim($info.find('a[href^="http://www.imdb.com/title/tt"]').text());

        return subject;
    }

    function init () {
        if (!location.href.match(/^http:\/\/movie\.douban\.com\/subject\/\d+/)) {
            return;
        }

        bt.search(serializeSubject())
        .done(function (items) {
            console.log(items);
        });
    }

    module.exports = {
        init: init
    };
});
