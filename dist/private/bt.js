define("private/bt",function(require,a,b){"use strict";function c(a){var b=new g.Deferred;return d(a)?g.ajax({url:a,type:"get",dataType:"text",timeout:3e4}).done(function(c){var d=c.replace(/src=/gi,"data-src="),e=g(g.parseHTML(d)),f=a.replace(/file\.php.*/i,"down.php"),h=e.find("form");h.attr("action",f),j||(j=g("<iframe/>").hide().appendTo("body")),j.html(h),h[0].submit(),b.resolve()}).fail(function(){b.reject()}):b.reject("url error"),b.promise()}function d(a){return a=""+a,a.match(/^http:\/\/\w+\.\w+\.\w+\/\w+\/file\.php\/\w+\.html/i)?!0:void 0}function e(a){var b=g.Deferred(),c=[],e=null,f=null,h="",i="";return d(a)?(c=a.match(/^(http:\/\/\w+\.\w+\.\w+\/\w+\/)file\.php\/(\w+)\.html/i),h=c[1],i=c[2],f=new XMLHttpRequest,f.open("POST",h+"down.php",!0),f.responseType="arraybuffer",f.onload=function(){var a=new Blob([f.response],{type:"application/octet-stream"});b.resolve(a)},f.timeout=6e4,f.onerror=function(){b.reject("网络错误")},f.ontimeout=function(){b.reject("下载bt超时")},e=new FormData,e.append("type","torrent"),e.append("name","null"),e.append("id",i),f.send(e)):b.reject("bt地址错误"),b.promise()}function f(){location.href.match(/\/p2p\/\w+\/[\w\-]+\.html/i)&&g(document).on("mouseenter","a[href]",function(){var a=g(this),b=a.prop("href");!a.hasClass("private-play-download-link")&&d(b)&&a.addClass("private-play-download-link")}).on("click","a.private-play-download-link",function(a){h.isDefaultPrevented(a)||(a.preventDefault(),i.log("正在下载中... 同时 `Shift+单击` 可云播"),c(g(this).prop("href")).fail(function(){i.error("网络错误，下载失败")}))})}var g=require("jquery"),h=require("private/adapter"),i=require("alertify"),j=null;b.exports={init:f,isPrivateBtUrl:d,download:c,load:e}});