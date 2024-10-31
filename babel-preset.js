const browserslist = require('browserslist');

module.exports = function (api, options, cwd) {
  return {
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          targets: browserslist.findConfig(cwd) || {
            browsers: [
              '> 1%',
              'chrome 109',
              'edge 124',
              'firefox 127',
              'safari 17.4',
              'not dead',
              'not ie <= 11',
              'not op_mini all',
              'not android <= 4.4',
              'not samsung <= 4',
            ],
            node: '18',
          },
          useBuiltIns: false,
          modules: options.modules,
        },
      ],
      [
        require.resolve('@babel/preset-react'),
        {
          runtime: 'automatic',
        },
      ],
      require.resolve('@babel/preset-typescript'),
      require.resolve('@babel/preset-flow'),
    ],
    plugins: [
      require.resolve('@babel/plugin-transform-strict-mode'),
      [
        require.resolve('./dist/babel'),
        {
          extension: options.extension,
        },
      ],
    ],
  };
};
