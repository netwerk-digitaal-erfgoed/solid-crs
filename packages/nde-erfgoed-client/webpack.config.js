const path = require('path');
module.exports = {
  mode: 'production',
  entry: './lib/index.ts',
  devtool: 'source-map',
  output: {
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
  experiments: {
    outputModule: true
  }
};