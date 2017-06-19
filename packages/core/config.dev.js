import less from 'rollup-plugin-less';
import preprocess from 'rollup-plugin-preprocess';
import pkg from './package.json';
import eslint from 'rollup-plugin-eslint';

export default {
    entry: 'src/index.js',
    dest: 'lib/core.js',
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
        }),
        less({
            output: 'lib/core.css'
        })
    ]
};