define("js/bt-baidu",function(require,a,b){"use strict";function c(a){var b=new g.Deferred,c=[],d='http://www.baidu.com/s?wd=intitle%3A"#keyword#"+torrent%20site%3Apan.baidu.com';return d=d.replace("#keyword#",encodeURIComponent(a)),i.hasOwnProperty(d)?(c=i[d],c&&c.length?b.resolve(c):b.reject()):g.ajax({url:d,type:"GET",timeout:j,xhrFields:{withCredentials:!0}}).done(function(a){a=a.replace(/src=/gi,"data-src=");var c=g(g.parseHTML(a)),e=c.find(".c-container"),f=[];e.each(function(){var a=g(this),b=a.find(".t a").eq(0),c=a.find(".c-abstract").eq(0),d=g.trim(c.text()),e="",h=d.match(/文件名:(.+) 文件大小:(.+) 分享者/);h&&h.length>2?(d=h[1],e=h[2],e&&(d+=" "+e)):d="",d&&f.push({href:b.attr("href"),title:d})}),i[d]=f,f.length?b.resolve(f):b.reject()}).fail(function(){b.reject()}),b.promise()}function d(a){var b=h.render(k,{items:a}),c=g(b);return c.on("mouseenter","a",function(){g(this).tipsy({gravity:"w",offset:3}).tipsy("show")}),c}function e(a){return a.title2||a.title||""}function f(a){var b=e(a),f=new g.Deferred;return b?(f.notify("正在加载搜索结果，请耐心等待..."),c(b).done(function(a){f.resolve(d(a),a.length)}).fail(function(){f.reject()})):f.reject(),f.promise()}var g=require("jquery"),h=require("mustache"),i={},j=3e4,k='{{#items}}<dl class="movie-improve-bt-dl"><dt class="movie-improve-bt-title"><a title="点击打开种子下载页面" target="_blank" href="{{href}}">{{title}}</a></dt>{{#files}}<dd class="movie-improve-bt-desc">{{&title}}</dd>{{/files}}</dl>{{/items}}';b.exports={name:"百度云",search:f}});