module.exports = process.env.NODE_ENV === 'production' ?
    require('./lib/loaders.min'):
    require('./lib/loaders');