define("private/lazy-load",function(require,a){"use strict";function b(){e(".lazy-load-img").lazyload(),e(document).magnificPopup({delegate:".magic-popup-link",gallery:{enabled:!0},image:{verticalFit:!1,titleSrc:function(a){return'<a href="#private-img-'+a.index+'" class="private-img-go">GO</a>'}},type:"image"}).on("click","a.private-img-go",function(){e.magnificPopup.close()})}function c(){e("#private-affix-main").affix()}function d(){e.ajax({url:l,type:"get",timeout:3e4,dataType:"text"}).done(function(a){var d=a.replace(/src=/gi,"data-src="),f=e(e.parseHTML(d)),g=f.filter("title"),l=e.trim(g.text()),m=f.filter("#main"),n=m.find("#content").html(),o=[],p=0,q=[];q=n.split(/<br>\n<br>\n/).map(function(a){var b=a.match(/^(.*)<br>/i),c="",d="";return b&&b.length&&(d=b[1],c='<h4 class="private-section-name" id="private-section-name-'+p+'">'+d+"</h4>",a=a.replace(/^.*<br>/i,c),p+=1,o.push(d)),a='<div class="private-section">'+a+"</div>"}),n=q.join("<br>\n"),m=m.html(e.parseHTML(n)),m.find("img").each(function(a){var b=e(this),c=b.data("src"),d=e("<a/>");b.attr("data-original",c),b.addClass("lazy-load-img"),b.attr("id","private-img-"+a),d.attr("href",c),d.addClass("magic-popup-link"),d.insertBefore(b),d.append(b)});var r="";e.each(o,function(a,b){r+=a?'<li class=""><a href="#private-section-name-'+a+'">'+b+"</a></li>":'<li class="active"><a href="#private-section-name-'+a+'">'+b+"</a></li>"}),k.find(".private-sidenav").html(r),j.html(k),h.text(l),document.title=l,i.html(m.html()),b(),c()}).fail(function(){i.html("error")}),e("html").html("").show(),document.title="loading",e("body").html(g)}if(location.href.match(/private\/detail\.html/i)){var e=require("jquery"),f=require("purl"),g=e('<div id="main" class="container"><div class="row"><h3 id="private-header-top" class="private-header"></h3></div><div class="row"><div class="col-md-9 private-content"></div><div class="col-md-3 private-sidebar"></div></div></div>'),h=g.find(".private-header"),i=g.find(".private-content"),j=g.find(".private-sidebar"),k=e('<div class="private-sidebar-main" id="private-affix-main"><ul class="nav private-sidenav"></ul><a class="back-to-top" href="#private-header-top">返回顶部</a></div>'),l=f(location.href).param("url");a.init=d}});