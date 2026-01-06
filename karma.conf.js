// Uncomment next line if you see an error like "No binary for FirefoxHeadless browser on your platform. Please, set "FIREFOX_BIN" env variable." when running unit tests
// process.env.FIREFOX_BIN = 'your path to Firefox binary>';
module.exports = function(config) {
  config.set({
    frameworks: ['mocha','chai', 'webpack'],
    plugins: [
      'karma-webpack',
      'karma-mocha',
      'karma-chai',
      'karma-chrome-launcher',
      'karma-firefox-launcher'
    ],
    files: [{ pattern: 'src/**/*.spec.js', watched: false }],
    preprocessors: { 'src/**/*.spec.js': ['webpack'] },
    reporters: ['progress'],
    port: 9876, // karma web server port
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless', 'FirefoxHeadless'],
    autoWatch: true,
    concurrency: Infinity,
    webpack: {
      // karma watches the test entry points
      stats: 'errors-only'
    },
  });
};
