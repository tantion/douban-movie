!function(){"use strict";function a(a,b){var c=a;0!==c.indexOf("chrome-extension://")&&(c=chrome.extension.getURL(c));var d=document.createElement("script");d.src=c,d.type="text/javascript";for(var e in b)b.hasOwnProperty(e)&&d.setAttribute(e,b[e]);document.body.appendChild(d)}a("seajs/sea.js",{"data-config":"config.js?v0.7.0","data-main":"js/main.js"})}();