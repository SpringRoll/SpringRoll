import less from 'rollup-plugin-less';
import preprocess from 'rollup-plugin-preprocess';
import uglify from 'rollup-plugin-uglify';

import pkg from './package.json';

const prod = process.env.BUILD === 'production';

const plugins = [
    preprocess({
        context: {
            DEBUG: !prod,
            RELEASE: prod,
            VERSION: pkg.version
        }
    }),
    less({
        output: 'lib/core.css'
    })
];

if (prod) {
    plugins.push(uglify({
        mangle: true,
        compress: true
    }));
}

export default {
    entry: 'src/index.js',
    dest: prod ? 'lib/core.min.js' : 'lib/core.js',
    format: 'cjs',
    plugins
};