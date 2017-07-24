module.exports = process.env.NODE_ENV === 'production' ?
    require('./lib/states.min'):
    require('./lib/states');