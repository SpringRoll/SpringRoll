module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: [{ pattern: 'src/**/*.spec.js', watched: false }],
    preprocessors: {
      // add webpack as preprocessor
      'src/**/*.spec.js': ['webpack']
    },

    reporters: ['progress'],
    port: 9876, // karma web server port
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless'],
    autoWatch: true,
    concurrency: Infinity
  });
};
