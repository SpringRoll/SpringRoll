module.exports = process.env.NODE_ENV === 'production' ?
    require('./lib/languages.min'):
    require('./lib/languages');