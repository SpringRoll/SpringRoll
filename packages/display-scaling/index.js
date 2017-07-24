module.exports = process.env.NODE_ENV === 'production' ?
    require('./lib/display-scaling.min'):
    require('./lib/display-scaling');