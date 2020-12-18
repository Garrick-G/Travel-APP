const path = require('path')
const webpack = require('webpack')
const HtmlWebPackPlugin = require("html-webpack-plugin")
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
module.exports = {
    entry: './src/client/index.js',
    output: {
      path: path.resolve(__dirname,'dist'),
      libraryTarget: 'var',
      library: 'tripFunctions',
            },
    mode: 'production',
    optimization: {
      minimizer: [new TerserPlugin({}), new CssMinimizerPlugin({test: /\.css$/i})],
    },
    module: {
        rules: [
            {
                test: '/\.js$/',
                exclude: /node_modules/,
                loader: "babel-loader"
            },
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
            },
            {
              test: /\.(png|jpe?g|gif)$/i,
              use: [
                {
                  loader: 'file-loader',
                  options: {
                    name: '[path][name].[ext]',
                  },
                },
              ],
            },
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./src/client/html/index.html",
            filename: "./index.html",
            inject: true,
        }),
        new MiniCssExtractPlugin({filename: '[name].css'}),
    ]
}
