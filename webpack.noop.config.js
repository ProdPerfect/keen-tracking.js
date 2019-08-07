const path = require('path');
const webpack = require('webpack'); // eslint-disable-line
const fileName = 'keen-tracking';

module.exports = {
  mode: 'development',
  entry: './lib/index_no_op.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: `${
      process.env.TARGET ? `${process.env.TARGET}/` : ''
    }${
      fileName
    }${
      '.no_op'
    }${
      process.env.OPTIMIZE_MINIMIZE ? '.min' : ''
    }.js`,
    library: 'Keen',
    libraryExport: 'default',
    libraryTarget: 'var',
  },

  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.BannerPlugin({ banner: `P2_KEEN_NO_OP_VERSION: ${require('./package.json').version}` }), // eslint-disable-line global-require
  ],

  module: {
    rules: [
      {
        test: /.(js|jsx)$/,
        include: [path.resolve(__dirname, 'lib')],
        loader: 'babel-loader',

        options: {
          plugins: ['syntax-dynamic-import'],

          presets: [
            [
              '@babel/preset-env',
              {
                modules: false,
              },
            ],
          ],
        },
      },
    ],
  },

  optimization: {
    minimize: !!process.env.OPTIMIZE_MINIMIZE,
  },

  devServer: {
    contentBase: path.join(__dirname, 'test/demo'),
    open: true,
    inline: true,
    hot: false,
    watchContentBase: true,
  },
};
