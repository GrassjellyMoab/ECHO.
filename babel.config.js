module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': '.',
            '@app': './app',
            '@assets': './src/assets',
            '@components': './src/components',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@services': './src/services',
            '@types': './src/types',
            '@constants': './src/constants',
            '@styles': './src/styles',
          },
        },
      ],
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
        },
      ],
    ],
  };
};
