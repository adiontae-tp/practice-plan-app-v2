const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

// Find the project root workspace
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Fix for tty.isatty error - provide mock for Node.js built-in modules
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  tty: path.resolve(__dirname, 'mocks', 'tty.js'),
};

// Fix for web bundling - handle ESM packages correctly
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// Transform profile for web to handle import.meta
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = withNativeWind(config, { input: './global.css' });
