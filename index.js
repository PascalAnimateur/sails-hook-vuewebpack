/**
 * Sails.js hook that provides Vue.js frontend via Webpack.
 */

var path = require('path');
var webpack = require('webpack');
var webpackDevServer = require('webpack-dev-server');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var LinkerWebpackPlugin = require('linker-webpack-plugin');

module.exports = function (sails) {

  return {

    defaults: {
      __configKey__: {
        config: {
          entry: [path.resolve(__dirname, '../../src/main.js')],
          output: {
            path: path.resolve(__dirname, '../../.tmp/public/'),
            publicPath: '/',
            filename: 'js/build/bundle.js'
          },
          resolveLoader: {
            root: path.join(__dirname, '../../node_modules')
          },
          plugins: [
            new webpack.optimize.OccurenceOrderPlugin(),
            new webpack.NoErrorsPlugin(),
            new CleanWebpackPlugin(['public'], {
              root: path.join(__dirname, '../../.tmp'),
              verbose: false
            }),
            new CopyWebpackPlugin([{
              from: path.resolve(__dirname, '../../src/assets/'),
              to: 'assets'
            }]),
            new LinkerWebpackPlugin({
              entry: 'src/index.html',
              output: '.tmp/public/index.html',
              data: {
                scripts: (process.env.NODE_ENV === 'development')
                  ? '<script src="//localhost:3000/js/build/bundle.js"></script>'
                  : '<script src="js/build/bundle.js"></script>'
              }
            })
          ],
          module: {
            loaders: [
              {
                test: /\.vue$/,
                loader: 'vue'
              },
              {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules/
              }
            ]
          },
          devServer: {
            historyApiFallback: true,
            noInfo: true
          },
          devtool: '#eval-source-map'
        },
        devServerConfig: {
          filename: "js/build/bundle.js",
          proxy: {
            "*": "http://localhost:1337"
          },
          watchOptions: {
            hot: true,
            inline: true,
            port: 3000
          },
          quiet: true
        }
      }
    },

    initialize: function (cb) {
      var config = this.defaults.vuewebpack.config;
      var devServerConfig = this.defaults.vuewebpack.devServerConfig;

      // Configure webpack dev server
      if (process.env.NODE_ENV === 'development') {
        config.output.publicPath = 'http://localhost:3000/';
        config.entry.unshift("webpack-dev-server/client?http://0.0.0.0:3000/", "webpack/hot/only-dev-server");
        config.plugins.unshift(new webpack.HotModuleReplacementPlugin());
      }
      else {
        config.plugins.unshift(new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false }}));
      }

      // Create Webpack compiler
      var compiler = webpack(config, function(err, stats) {
        if (err) throw err;
        if (process.env.NODE_ENV === 'development') {
          // Watch for changes
          compiler.watch({ aggregateTimeout: 300 }, function(err, stats) {
            if (err) throw err;
            // Create Webpack dev server
            devServer = new webpackDevServer(compiler, devServerConfig);
            devServer.listen(3000);
            return cb();
          });
        }
        else {
          // Run production build
          compiler.run(function (err, stats) {
            if (err) throw err;
            return cb();
          });
        }
      });
    }

  }

};
