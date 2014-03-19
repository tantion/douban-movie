//
// sea.js config
//
seajs.config({

    // 别名配置
    alias: {
        'jquery': {
            src: 'lib/jquery.js',
            exports: 'noConfictJQuery'
        },
        'async': {
            src: 'lib/async.js',
            exports: 'async'
        },
        'mustache': {
            src: 'lib/mustache.js',
            exports: 'Mustache'
        },
        'purl': {
            src: 'lib/purl.js',
            exports: 'purl'
        }
    },

    // 变量配置
    vars: {
        'locale': 'zh-cn'
    },

    // 映射配置
    map: [
        [ /^(.*\/js\/.*\.(?:css|js))(?:.*)$/i, '$1?v1.1.1' ]
    ],

    // 插件
    plugins: ['text', 'shim'],

    // 预加载项
    preload: [
    ],

    // 调试模式
    debug: true,

    // 文件编码
    charset: 'utf-8'
});

