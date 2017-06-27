module.exports = process.env.NODE_ENV === 'production' ?
    require('./lib/display.min'):
    require('./lib/display');