define("js/util-decodefile",[],function(require,a,b){"use strict";function c(a){function b(a){for(var b="",c=0;c<a.length;c+=1){var d=a.charCodeAt(c);b+=String.fromCharCode(d+47>=126?" ".charCodeAt(0)+(d+47)%126:d+47)}return b}function c(a){var b=a.length;b-=1;for(var c="",d=b;d>=0;d-=1)c+=a.charAt(d);return c}function d(a,b,c,d){return a.substr(a.length-d+c-b,b)+a.substr(a.length-d,c-b)+a.substr(a.length-d+c,d-c)+a.substr(0,a.length-d)}if(a.length>32)switch(a.charAt(0)){case"o":return b(d(a.substr(1),8,17,27));case"n":return b(c(d(a.substr(1),6,15,17)));case"m":return c(d(a.substr(1),6,11,17));case"l":return c(b(d(a.substr(1),6,12,17)));case"k":return d(a.substr(1),14,17,24);case"j":return d(b(c(a.substr(1))),11,17,27);case"i":return d(c(b(a.substr(1))),5,7,24);case"h":return d(b(a.substr(1)),12,22,30);case"g":return d(c(a.substr(1)),11,15,21);case"f":return d(a.substr(1),14,17,24);case"e":return d(a.substr(1),4,7,22);case"d":return c(b(a.substr(1)));case"c":return b(c(a.substr(1)));case"b":return c(a.substr(1));case"a":return b(a.substr(1))}return a}b.exports={decode:c}});