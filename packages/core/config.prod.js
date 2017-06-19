import less from 'rollup-plugin-less';
import preprocess from 'rollup-plugin-preprocess';
import uglify from 'rollup-plugin-uglify';
import CleanCSS from 'less-plugin-clean-css';
import pkg from './package.json';

export default {
    entry: 'src/index.js',
    dest: 'lib/core.min.js',
    format: 'cjs',
    banner: '/*! SpringRoll v' + pkg.version + ' */\n',
    plugins: [
        preprocess({
            context: {
                DEBUG: false,
                RELEASE: true,
                VERSION: pkg.version
            }
        }),
        uglify({
            mangle: true,
            compress: true,
            output: {
                comments: function(node, comment) {
                    const {value, type} = comment;
                    if (type == "comment2") {
                        return value[0] === "!";
                    }
                }
            }
        }),
        less({
            output: 'lib/core.min.css',
            plugins: [new CleanCSS({
                advanced: true
            })]
        })
    ]
};