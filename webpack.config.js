const path = require('path');

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
      umdNamedDefine: true,
    },
    module: {
      rules: [
        { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
      ],
    },
    plugins: [
      // web3 uses scrypt for Node.js and scrypt.js for the browser. We ignore
      // the former for this web bundle which produces errors otherwise.
      new webpack.IgnorePlugin(/^scrypt$/),
    ]
  },
  {
    entry: './src/index.js',
    target: 'node',
    externals: [nodeExternals()],
    output: {
      path: path.resolve(__dirname, 'build', 'js'),
      filename: 'bundle-node.js',
    },
    module: {
      rules: [
        { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
      ],
    },
  },
];
