const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: './lib/index.ts',
  devtool: 'source-map',
  output: {
    publicPath: '',
    libraryTarget: 'module',
    path: path.resolve(__dirname, 'dist'), 
    filename: 'index.js' 
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: { 
      stream: require.resolve('stream-browserify') ,
      crypto: require.resolve('crypto-browserify')
    }
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
  experiments: {
    outputModule: true
  }
};
