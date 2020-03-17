const path = require('path')
const pkg = require('./package')
const webpack = require('webpack')
const mm = require('micromatch')

module.exports = {
    mode: 'universal',
    srcDir: 'src/',

    /*
    ** Headers of the page
    */
    head: {
        title: pkg.name,
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { hid: 'description', name: 'description', content: pkg.description }
        ],
        link: [
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
        ]
    },

    /*
    ** Customize the progress-bar color
    */
    loading: { color: '#3397dc' },

    /*
    ** Global CSS
    */
    css: [
        // '@/assets/css/variables.scss',
        // '@/assets/css/input.scss'
    ],

    /** middleware */
    serverMiddleware: [
        {
            handler: function (req, res, next) {
                // 注：此处从简，因为例如/search*明显匹配了更多url，但并非关键
                const spaPaths = [
                    '/account/**',
                    '/notifications',
                    '/notifications*',
                    '/notifications/**',
                    '/admin/**',
                    '/wiki/new',
                    '/wiki/new*',
                    '/wiki/edit/**',
                    '/setting/**',
                    '/search*',
                    '/search/**'
                ]
                if (mm.some(req._parsedUrl.pathname, spaPaths)) {
                    res.spa = true
                }
                next()
            }
        }
    ],

    /** middleware */
    router: {
        middleware: ['router-guards']
    },

    /*
    ** Plugins to load before mounting the App
    */
    plugins: [
        '@/plugins/_main',
        '@/plugins/helpers',
        '@/plugins/api',
        '@/plugins/message'
    ],

    /*
    ** Nuxt.js modules
    */
    modules: [
        '@nuxtjs/router',
        '@nuxtjs/style-resources',
        '@nuxtjs/universal-storage'
    ],
    buildModules: [
        '@nuxt/typescript-build',
        "nuxt-typed-vuex"
    ],
    storage: {
    },
    styleResources: {
        scss: [
            '@/assets/css/variables.scss',
            '@/assets/css/response.scss',
            '@/assets/css/input.scss'
        ]
    },

    /*
    ** Build configuration
    */
    build: {
        /*
        ** You can extend webpack config here
        */
        postcss: {
            plugins: {
                autoprefixer: {}
            }
        },

        plugins: [
            new webpack.ProvidePlugin({
                _: path.resolve(__dirname, './src/tools/lodash.js')
            }),
            new webpack.ProvidePlugin({
                $: path.resolve(__dirname, './src/tools/_merge.js')
            })
        ],

        transpile: [
            /typed-vuex/,
        ],

        extend (config, ctx) {
            // Run ESLint on save
            if (ctx.isDev && ctx.isClient) {
                config.module.rules.push({
                    enforce: 'pre',
                    test: /\.(js|vue)$/,
                    loader: 'eslint-loader',
                    exclude: /(node_modules)/
                })
            }
        }
    }
}
