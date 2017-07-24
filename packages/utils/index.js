module.exports = process.env.NODE_ENV === 'production' ?
    require('./lib/utils.min'):
    require('./lib/utils');