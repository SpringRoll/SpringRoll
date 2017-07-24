module.exports = process.env.NODE_ENV === 'production' ?
    require('./lib/captions.min'):
    require('./lib/captions');