//
// decode file for shooter.cn
//
define('js/util-decodefile', [], function(require, exports, module) {
    "use strict";

    function shtg_calcfilehash(a) {
        function b(j) {
            var g = "";
            for (var f = 0; f < j.length; f += 1) {
                var h = j.charCodeAt(f);
                g += (h + 47 >= 126) ? String.fromCharCode(" ".charCodeAt(0) + (h + 47) % 126) : String.fromCharCode(h + 47);
            }
            return g;
        }

        function d(g) {
            var j = g.length;
            j = j - 1;
            var h = "";
            for (var f = j; f >= 0; f -= 1) {
                h += (g.charAt(f));
            }
            return h;
        }

        function c(j, h, g, f) {
            return j.substr(j.length - f + g - h, h) + j.substr(j.length - f, g - h) + j.substr(j.length - f + g, f - g) + j.substr(0, j.length - f);
        }
        if (a.length > 32) {
            switch (a.charAt(0)) {
                case "o":
                    return (b((c(a.substr(1), 8, 17, 27))));
                case "n":
                    return (b(d(c(a.substr(1), 6, 15, 17))));
                case "m":
                    return (d(c(a.substr(1), 6, 11, 17)));
                case "l":
                    return (d(b(c(a.substr(1), 6, 12, 17))));
                case "k":
                    return (c(a.substr(1), 14, 17, 24));
                case "j":
                    return (c(b(d(a.substr(1))), 11, 17, 27));
                case "i":
                    return (c(d(b(a.substr(1))), 5, 7, 24));
                case "h":
                    return (c(b(a.substr(1)), 12, 22, 30));
                case "g":
                    return (c(d(a.substr(1)), 11, 15, 21));
                case "f":
                    return (c(a.substr(1), 14, 17, 24));
                case "e":
                    return (c(a.substr(1), 4, 7, 22));
                case "d":
                    return (d(b(a.substr(1))));
                case "c":
                    return (b(d(a.substr(1))));
                case "b":
                    return (d(a.substr(1)));
                case "a":
                    return b(a.substr(1));
            }
        }
        return a;
    }

    module.exports = {
        decode: shtg_calcfilehash
    };
});
