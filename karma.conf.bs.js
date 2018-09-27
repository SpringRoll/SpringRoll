require('dotenv').config();
module.exports = function(config) {
  config.set({
    customLaunchers: {
      bs_chrome_69: {
        base: 'BrowserStack',
        browser_version: '69.0',
        os: 'Windows',
        os_version: '7',
        browser: 'chrome'
      },
      bs_iPad_mini_2_safari: {
        base: 'BrowserStack',
        device: 'iPad Mini 2',
        real_mobile: false,
        os_version: '8.3',
        os: 'ios',
        browser: 'ipad'
      },
      bs_ie_windows_7: {
        base: 'BrowserStack',
        browser: 'ie',
        browser_version: '11',
        os: 'Windows',
        os_version: '7'
      }
    },
    browserStack: {
      username: process.env.BROWSER_STACK_USER,
      accessKey: process.env.BROWSER_STACK_ACCESS_KEY,
      video: false
    },
    frameworks: ['mocha', 'chai'],
    files: [{ pattern: 'src/**/*.spec.js', watched: false }],
    preprocessors: {
      'src/**/*.js': ['babel'],
      'src/**/*.spec.js': ['webpack']
    },
    babelPreprocessor: {
      presets: () => [
        [
          '@babel/preset-env',
          {
            useBuiltIns: 'entry',
            targets: {
              ie: '11'
            }
          }
        ]
      ]
    },
    webpackMiddleware: { stats: 'errors-only' },
    reporters: ['progress'],
    port: 9876, // karma web server port
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['bs_iPad_mini_2_safari', 'bs_ie_windows_7', 'bs_chrome_69'],
    autoWatch: true,
    concurrency: Infinity,
    singleRun: true
  });
};
