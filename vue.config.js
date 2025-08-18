const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8081,
    open: true,
    host: '0.0.0.0',  // 允许外部访问
    allowedHosts: 'all',  // 允许所有主机访问
    proxy: {
      '/api': {
        target: 'http://192.168.1.164:9090',  // 使用本机IP地址，这样内网其他电脑也能访问
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        },
        // 添加更多代理选项以提高兼容性
        secure: false,
        ws: true
      }
    }
  },
  chainWebpack: config =>{
    config.plugin('html')
        .tap(args => {
          args[0].title = "管理系统";
          return args;
        })
  }
})
