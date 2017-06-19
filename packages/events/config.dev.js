import preprocess from 'rollup-plugin-preprocess';
import pkg from './package.json';
import eslint from 'rollup-plugin-eslint';

export default {
    entry: 'src/index.js',
    dest: 'lib/events.js',
    format: 'cjs',
    banner: '/*! SpringRoll v' + pkg.version + ' */',
    plugins: [
        eslint({
            include: 'src/**/*.js',
            fix: true
        }),
        preprocess({
            context: {
                DEBUG: true,
                RELEASE: false,
                VERSION: pkg.version
            }
        })
    ]
};