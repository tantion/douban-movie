define(function(require,a,b){"use strict";function c(){var a={},b=g("#content"),c=g("#info"),d=g.trim(g("#content .related-info h2").text());return a.title2=d.replace(/^(.+)的剧情简介.*$/,"$1"),a.title=g.trim(b.find('[property="v:itemreviewed"]').text()),a.imdb=g.trim(c.find('a[href^="http://www.imdb.com/title/tt"]').text()),a}function d(a){g.each(a.items,function(a,b){b.index=a});var b=i.render(k,a),c=g(b);return c.on("click",".movie-improve-bt-download",function(b){b.preventDefault();var c=g(this),d=parseInt(c.data("index"),10),e=a.items[d];e.download().fail(function(){c.attr("title","没有找到下载地址。").tipsy({gravity:"w"}).tipsy("show")})}),c}function e(){j.search(c()).progress(function(a){h.setContent(a)}).done(function(a){var b=d(a);h.setContent(b)}).fail(function(){h.setContent("抱歉，没有找到相关的bt地址。"),setTimeout(function(){h.close()},1e3)})}function f(){location.href.match(/^http:\/\/movie\.douban\.com\/subject\/\d+/)&&Do.ready("dialog",function(){var a=g('<div><span class="pl">BT地址:</span> <a href="javascript:">打开列表</a></div>').appendTo("#info").find("a");a.on("click",function(a){a.preventDefault(),h||(h=dui.Dialog({width:600,title:"BT地址列表"},!0)),h.setContent("正在查找中..."),h.open(),e()})})}var g=require("jquery"),h=null,i=require("mustache"),j=require("js/bt-service"),k='<div class="movie-improve-bt-container">{{#items}}<dl class="movie-improve-bt-dl"><dt class="movie-improve-bt-title"><a data-index="{{index}}" title="点击下载" class="movie-improve-bt-download" href="javascript:">{{title}}</a></dt>{{#files}}<dd class="movie-improve-bt-desc">{{&title}}</dd>{{/files}}</dl>{{/items}}</div>';b.exports={init:f}});