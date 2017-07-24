module.exports = process.env.NODE_ENV === 'production' ?
    require('./lib/loader.min'):
    require('./lib/loader');