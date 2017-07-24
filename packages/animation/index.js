module.exports = process.env.NODE_ENV === 'production' ?
    require('./lib/animation.min'):
    require('./lib/animation');