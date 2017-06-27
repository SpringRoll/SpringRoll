module.exports = process.env.NODE_ENV === 'production' ?
    require('./lib/display-ui.min'):
    require('./lib/display-ui');