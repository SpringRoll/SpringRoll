module.exports = process.env.NODE_ENV === 'production' ?
    require('./lib/core.min'):
    require('./lib/core');