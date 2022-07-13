const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
module.exports = {
  entry:{
    index:"./src/index.js",
    user:"./src/user.js",
    map:"./src/map.js",
  },
  output: {
    filename: '[name].[hash].js',
    publicPath: './',
    path: path.resolve(__dirname, 'dist')
  },
  plugins:[
    // new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      filename:"index.html",
      template: './src/pages/index.html',
      chunks:['index'],
      favicon: './favicon.ico',
    }),
    new HtmlWebpackPlugin({
      filename:"user.html",
      template: './src/pages/user.html',
      chunks:['user'],
      favicon: './favicon.ico',
    }),
    new HtmlWebpackPlugin({
      filename:"map.html",
      template: './src/pages/map.html',
      chunks:['map'],
      favicon: './favicon.ico',
    })      
  ],
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
        'style-loader',
        'css-loader',
        'less-loader',
        {
          loader: 'style-resources-loader',
          options: {
            patterns: [
                path.resolve(__dirname, './src/styles/var.less')
            ]}
        }]     
      }      
    ]
  }  
};