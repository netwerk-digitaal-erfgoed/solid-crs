const path = require("path");
module.exports = {
   mode: "development",
   entry: "./lib/index.ts",
   output: {
    // library: 'someLibName',
    libraryTarget: 'module',
     path: path.resolve(__dirname, "dist"), 
     filename: "index.js" 
   },
  module: {
    rules: [
        {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
          },
      {
        test: /\.css$/,
        use: [ { loader: "style-loader" }, { loader: "css-loader" } ],
      },
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
      fallback: { 
         stream: require.resolve("stream-browserify") ,
         crypto: require.resolve("crypto-browserify")
      }
  },
  experiments: {
outputModule: true
  }
};