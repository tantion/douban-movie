define("private/download",function(require,a,b){"use strict";function c(a){var b=new e.Deferred;return e.ajax({url:a,type:"get",dataType:"text",timeout:3e4}).done(function(c){var d=c.replace(/src=/gi,"data-src="),g=e(e.parseHTML(d)),h=a.replace(/file\.php.*/i,"down.php"),i=g.find("form");i.attr("action",h),f||(f=e("<iframe/>").hide().appendTo("body")),f.html(i),i[0].submit(),b.resolve()}).fail(function(){b.reject()}),b.promise()}function d(){e(document).on("mouseenter","a[href]",function(){var a=e(this),b=null,c=a.prop("href");c.match(/^http:\/\/\w+\.kidown\.com\/\w+\/file\.php/i)&&(b=a.next(".private-play-link"),b.length||(b=e('<a class="private-play-link" target="_blank" href="http://tantion.com/private/play.html?url='+c+'">云播</a>').insertAfter(a)))}).on("click","a[href]",function(a){var b=e(this),d=b.prop("href");d.match(/^http:\/\/\w+\.kidown\.com\/\w+\/file\.php/i)&&(a.preventDefault(),c(d).fail(function(){b.attr("title","网络错误，无法下载")}))})}if(location.href.match(/private\/detail\.html/i)){var e=require("jquery"),f=null;b.exports={init:d}}});