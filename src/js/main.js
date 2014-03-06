//
// main.js
//

// 所有模块都通过 define 来定义
define(function(require, exports, module) {
    "use strict";

    // 通过 require 引入依赖
    var $ = require('jquery');

    // 加载 jquery 插件
    require('lib/tipsy/jquery.tipsy.js')($);

    // 初始化模块
    require('js/bt-search').init();

});
