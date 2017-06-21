const externalHelpers = require('babel-plugin-external-helpers');
const es2015 = require('babel-preset-es2015');

module.exports = {
    babelrc: false,
    exclude: [
        'node_modules/**',
        '**/*.less',
        '**/*.json'
    ],
    presets: [[
        es2015.buildPreset,
        {
            modules: false,
            loose: true
        }
    ]],
    plugins: [
        externalHelpers
    ]
};