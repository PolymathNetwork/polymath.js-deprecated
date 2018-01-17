const path = require('path');

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');

module.exports = [
  {
    entry: './src/index.js',
    target: 'web',
    output: {
      path: path.resolve(__dirname, 'build', 'js'),
      filename: 'bundle-web.js',
      library: 'Polymath',
      libraryTarget: 'umd',
      umdNamedDefine: true, // TODO: What does this do?
    },
    module: {
      rules: [
        { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
        { test: /\.json$/, loader: 'json-loader' },
      ],
    },
    plugins: [
      // web3 uses scrypt for Node.js and scrypt.js for the browser. We ignore
      // the former for this web bundle which produces errors otherwise.
      new webpack.IgnorePlugin(/^scrypt$/),
      new UglifyJsPlugin(),
    ]
  },
];
