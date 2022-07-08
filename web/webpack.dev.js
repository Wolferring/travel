const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
  devtool: 'inline-source-map',
  devServer: {
    host: '0.0.0.0',
    publicPath:"/",
    hot:true
  },
  plugins:[
    new webpack.HotModuleReplacementPlugin(),
  ],
  module:{
    rules:[
      {
        test: /\.(png|svg|jpg|gif|jpeg)$/,
        use:[
          {
            loader: 'file-loader',
            options: {
                name: '[hash].[ext]',
                outputPath: './images',
                publicPath: '/images'
            }            
          }
        ]
      },     
      {
        test: /\.css$/,
        use: [
         'style-loader',
         'css-loader'
        ]
      }
    ]
  }
});