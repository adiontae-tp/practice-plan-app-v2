const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['@ppa'],
      },
    },
    argv
  );

  // Handle Firebase and other ESM packages
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native': 'react-native-web',
  };

  // Add support for .mjs and .cjs files
  config.resolve.extensions = [
    '.web.tsx',
    '.web.ts',
    '.web.jsx',
    '.web.js',
    '.tsx',
    '.ts',
    '.jsx',
    '.js',
    '.json',
    '.mjs',
    '.cjs',
  ];

  // Handle ESM modules properly
  config.module.rules.push({
    test: /\.mjs$/,
    include: /node_modules/,
    type: 'javascript/auto',
  });

  return config;
};
