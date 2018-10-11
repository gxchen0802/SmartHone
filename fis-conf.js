var now = new Date();
fis.config.set('timestamp', [now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes()].join(''));

console.log('update time:' + fis.config.get('timestamp'));


fis.config.merge({

    modules: {
        parser: {
            less: ['less']
        },
        //打包后处理插件
        //自动将页面中独立的资源引用替换为打包资源
        postpackager: 'simple'
    },

    roadmap: {

        domain: '..',

        ext: {
            less: 'css'
        },

        path: [

            //排除非编译目录
            {
                reg: /\/(protected|themes)\//i,
                release: false
            },

            //排除非编译文件
            {
                reg: /\/(index\.php|.*\.xml|favicon\.ico|conf-[^\.]*\.js)/i,
                release: false
            },
            //只编译dev目录
            {
                reg: /\/public\/(?!dev\/)/i,
                release: false
            },

            {
                reg: /\/public\/dev\/html\/(.*)/i,
                release: '/html/$1'
            },

            {
                reg: /\/public\/dev\/font\/(.*)/i,
                release: '/font/$1'
            },

            {
                reg: /\/public\/dev\/css\/(.*)/i,
                release: '/css/$1'
            },

            {
                reg: /\/public\/dev\/images\/(.*)/i,
                release: '/images/$1',
            },

            {
                reg: /\/public\/dev\/js\/(.*)/i,
                release: '/js/$1'
            },
            {
                reg: /\/public\/dev\/json\/(.*)/i,
                release: '/json/$1'
            },

            {
                reg: /\/css\/([^\/]+\.png)/i,
                release: '/images/$1',
                query: '?t=${timestamp}'
            }
        ]
    },

    pack: {
        'css/common.min.css': [
            '/public/dev/css/bootstrap.min.css',
            '/public/dev/css/bootstrap-responsive.min.css',
            '/public/dev/css/font-awesome.min.css',
            '/public/dev/css/ace.min.css',
            '/public/dev/css/ace-responsive.min.css',
            '/public/dev/css/ace-skins.min.css'
        ],
        'css/smart_hone.min.css': [
            '/public/dev/css/smart_hone.less'
        ],
        'js/sh_common.min.js': [
            '/public/dev/js/smart_hone_common.js'
        ],
        'js/sh_index.min.js': [
            '/public/dev/js/smart_hone_index.js'
        ],
        'js/sh_table.min.js': [
            '/public/dev/js/smart_hone_table.js'
        ]
    },

    deploy: {
        test: {
            to: './public/test',
            exclude: /.*\.less|smart_hone_.*\.js/i
        },
        build: {
            to: './public/build',
            exclude: /\/html\/|.*\.less|smart_hone_.*\.js/i
        }
    }
});