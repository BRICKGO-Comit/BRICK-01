const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force singleton React and other critical packages to avoid "Invalid hook call"
config.resolver.extraNodeModules = {
    'react': path.resolve(workspaceRoot, 'node_modules/react'),
    'react-dom': path.resolve(workspaceRoot, 'node_modules/react-dom'),
    'react-native': path.resolve(workspaceRoot, 'node_modules/react-native'),
    'expo': path.resolve(workspaceRoot, 'node_modules/expo'),
    'expo-router': path.resolve(workspaceRoot, 'node_modules/expo-router'),
};

module.exports = config;
