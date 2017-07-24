module.exports = process.env.NODE_ENV === 'production' ?
    require('./lib/hints.min'):
    require('./lib/hints');