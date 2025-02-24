/* eslint-disable @typescript-eslint/no-var-requires */
const { stringified } = require('../scripts/server/env');
const bodyParser = require('body-parser')
const mockServer = require('./src/utils/mock/server');
const { NODE_ENV, VUE_APP_PORT, VUE_APP_MOCK } = process.env;

const publicPath = process.env.MICRO_PUBLIC_PATH;

module.exports = {
  publicPath,
  outputDir: 'dist',
  productionSourceMap: false,
  devServer: {
    port: VUE_APP_PORT || 8080,
    // 配置反向代理
    proxy: {
      '/api': { // 将所有 /api 开头的请求转发到目标地址
        target: 'https://10.112.61.123/api/v1', // 注意这里包含了 /api/v1
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          // '^/api': '' // 不需要重写路径，因为目标地址已经包含了 /api/v1
        }
      },
    },
    onBeforeSetupMiddleware: function (app, server) {
      server = app
      if (NODE_ENV === 'development' && VUE_APP_MOCK === 'true') {
        // parse app.body
        // https://expressjs.com/en/4x/api.html#req.body
        // create application/json parser
        server.app.use(bodyParser.json());
        // create application/x-www-form-urlencoded parser
        server.app.use(bodyParser.urlencoded({ extended: false }));
        // mockServer(app);
      }
    }
  },
  // 修改webpack的配置
  configureWebpack: {
    // 不需要打包的插件
    externals: {
      // 'vue': 'Vue',
      // 'vue-router': 'VueRouter',
      // 'element-ui': 'ELEMENT'
    }
  },
  chainWebpack(config) {

    // 内置的 svg Rule 添加 exclude
    config.module
      .rule('svg')
      .exclude.add(/iconsvg/)
      .end();

    // 添加 svg-sprite-loader Rule
    config.module
      .rule('svg-sprite-loader')
      .test(/.svg$/)
      .include.add(/iconsvg/)
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader');

    // 添加 svgo Rule
    config.module
      .rule('svgo')
      .test(/.svg$/)
      .include.add(/iconsvg/)
      .end()
      .use('svgo-loader')
      .loader('svgo-loader')
      .options({
        // externalConfig 配置特殊不是相对路径，起始路径是根目录
        externalConfig: './src/assets/iconsvg/svgo.yml',
      });

    // 针对图片修改publicPath
    config.module
      .rule('images')
      .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 4096, // 小于4kb将会被打包成 base64
        fallback: {
          loader: 'file-loader',
          options: {
            publicPath
          },
        },
      });

    // 添加自定义环境变量
    config.plugin('define')
      .tap(args => {
        args[0]['process.env'] = {
          ...args[0]['process.env'],
          ...stringified
        }
        return args
      })

  }
}
