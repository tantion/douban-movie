!function(){"use strict";function a(a,b){for(var c=null,d=!1,e=0,f=a.length;f>e;e+=1)c=a[e],c.name===b.name&&(c.value=b.value,d=!0);d||a.push(b)}chrome.webRequest.onHeadersReceived.addListener(function(b){var c=b.responseHeaders;return a(c,{name:"Access-Control-Allow-Origin",value:"http://movie.douban.com"}),a(c,{name:"Access-Control-Allow-Credentials",value:"true"}),{responseHeaders:c}},{urls:["http://www.bttiantang.com/s.php?*","http://www.bttiantang.com/subject/*","http://www.bttiantang.com/download.php*","http://yun.baidu.com/share/link*","http://www.baidu.com/s*","http://imax.im/api/movies/show.json*","http://imax.im/movies/*","http://btmee.net/search*","http://www.shooter.cn/search*"]},["blocking","responseHeaders"])}();