define("js/bt-mee",function(require,a,b){"use strict";function c(a){var b=new g.Deferred,c=[],d="http://btmee.net/search/?q=#keyword#";return d=d.replace("#keyword#",encodeURIComponent(a)),i.hasOwnProperty(d)?(c=i[d],c&&c.length?b.resolve(c):b.reject()):g.ajax({url:d,type:"POST",data:{q:a,sname:""},timeout:j,xhrFields:{withCredentials:!0}}).done(function(a){a=a.replace(/src=/gi,"data-src=");var c=g(g.parseHTML(a)),e=c.find("tbody .qvodView"),f=[];f=g.map(e,function(a){var b=g(a).closest("tbody"),c=g.trim(b.find(".cat").text()),d=g.trim(b.find(".name").text()),e=g.trim(b.find(".seed").text()),f=g.trim(b.find(".magDown").attr("href")),h=g.trim(b.find(".ed2kDown").attr("ed2k")),i="",j="";return c&&(i="["+c+"]"),e&&(i+="[<strong>"+e+"</strong>]"),i+=d,j=f?f:h,{href:j,ed2k:h,mag:f,title:i}}),i[d]=f,f.length?b.resolve(f):b.reject()}).fail(function(){b.reject()}),b.promise()}function d(a){var b=h.render(k,{items:a}),c=g(b);return c.on("mouseenter","a",function(){g(this).tipsy({gravity:"w",offset:3}).tipsy("show")}),c}function e(a){return a.title2||a.title||""}function f(a){var b=e(a),f=new g.Deferred;return b?(f.notify("正在加载搜索结果，请耐心等待..."),c(b).done(function(a){f.resolve(d(a),a.length)}).fail(function(){f.reject()})):f.reject(),f.promise()}var g=require("jquery"),h=require("mustache"),i={},j=3e4,k='{{#items}}<dl class="movie-improve-bt-dl"><dt class="movie-improve-bt-title"><a title="请右键复制下载地址或者点击下载。" class="private-play-download-link" href="{{href}}">{{&title}}</a></dt>{{#files}}<dd class="movie-improve-bt-desc">{{&title}}</dd>{{/files}}</dl>{{/items}}';b.exports={name:"BTmee",search:f}});