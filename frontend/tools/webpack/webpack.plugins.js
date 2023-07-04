const webpack = require("webpack");
const { inDev } = require("./webpack.helpers");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

module.exports = [
  new NodePolyfillPlugin(),
  new webpack.ProvidePlugin({
    process: 'process/browser',
  }),
  new webpack.DefinePlugin({
    "process.env": JSON.stringify(process.env),
  }),
  new ForkTsCheckerWebpackPlugin(),
  inDev() && new webpack.HotModuleReplacementPlugin(),
  inDev() && new ReactRefreshWebpackPlugin(),
  new HtmlWebpackPlugin({
    template: "src/index.html",
    favicon: "assets/images/chess_logo.png",
    inject: true,
  }),
  new MiniCssExtractPlugin({
    filename: "[name].[chunkhash].css",
    chunkFilename: "[name].[chunkhash].chunk.css",
  }),
].filter(Boolean);
