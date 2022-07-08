const {merge} = require('webpack-merge');
const path = require('path');

const TerserPlugin = require("terser-webpack-plugin");
const common = require('./webpack.common.js');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = merge(common, {
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
        terserOptions: {
          compress: {
            pure_funcs: ["console.log"]
          }
        }
      }),new CssMinimizerPlugin()],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename:'[name]-[hash].css',
      chunkFilename:'[name]-hash.bundle.css'
    }),
    new CleanWebpackPlugin(),
  ],
  module: {
    rules: [
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
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader,{ loader: "css-loader" }],
      },          
      {
        test: /\.less$/i,
        use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
        'less-loader',
        {
          loader: 'style-resources-loader',
          options: {
            patterns: [
                path.resolve(__dirname, 'src/styles/var.less')
            ]}
        }],
      },      
    ],
  }  
});