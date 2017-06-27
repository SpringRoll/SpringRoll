module.exports = process.env.NODE_ENV === 'production' ?
    require('./lib/display-animation.min'):
    require('./lib/display-animation');