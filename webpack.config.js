const path = require('path');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  entry: './src/index.js', // Entry point of your project
  output: {
    filename: 'bundle.js', // Output filename
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  plugins: [
    new NodePolyfillPlugin()
  ],
  resolve: {
    fallback: {
      "fs": false,
      "net": false,
      "tls": false,
    },
  }
};