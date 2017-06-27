module.exports = process.env.NODE_ENV === 'production' ?
    require('./lib/container-client.min'):
    require('./lib/container-client');