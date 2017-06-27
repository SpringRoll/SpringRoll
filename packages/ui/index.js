module.exports = process.env.NODE_ENV === 'production' ?
    require('./lib/ui.min'):
    require('./lib/ui');