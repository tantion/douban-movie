define("private/yunbo",function(require,a,b){"use strict";function c(){g("article.alertify-log-show").click()}function d(a,b){c(),j.log("正在加载云播地址... <br />同时 `"+k+"+单击` 可添加到云播","",1e4),h.requestHash(a).done(function(a){c(),j.success("准备云播"),h.requestUrlByHash(a).done(function(){var d="";d=b?"http://tantion.com/private/play.html?infohash="+a:"http://vod.xunlei.com/share.html?from=macthunder&type=bt&url=bt%3A%2F%2F"+a+"&playwindow=player",chrome.runtime.sendMessage({action:"openurl",data:{url:d}}),c(),j.success("已找到云播资源，正在打开播放页面",1e3)}).fail(function(a){c(),j.error(a||"云播失败，未知错误")})}).fail(function(a){c(),j.error(a||"云播失败，未知错误")})}function e(a){c(),j.log("正在添加地址到云播...","",1e4),h.addByUrl(a).done(function(){c(),j.success("已添加找到云播空间",1e3)}).fail(function(a){c(),j.error(a||"添加云播失败，未知错误")})}function f(){g(document).on("click","a.private-play-download-link",function(a){var b=g(this).prop("href");i.isYunAction(a)?(a.preventDefault(),d(b)):i.isPrivateAction(a)?(a.preventDefault(),d(b,!0)):i.isAddAction(a)&&(a.preventDefault(),e(b))})}var g=require("jquery"),h=require("private/yun"),i=require("private/adapter"),j=require("alertify"),k=navigator.userAgent.match(/Macintosh/i)?"command":"ctrl";b.exports={init:f}});