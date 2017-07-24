module.exports = process.env.NODE_ENV === 'production' ?
    require('./lib/sound.min'):
    require('./lib/sound');