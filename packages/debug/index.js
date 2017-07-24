module.exports = process.env.NODE_ENV === 'production' ?
    require('./lib/debug.min'):
    require('./lib/debug');