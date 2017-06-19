import preprocess from 'rollup-plugin-preprocess';
import uglify from 'rollup-plugin-uglify';
import pkg from './package.json';

export default {
    entry: 'src/index.js',
    dest: 'lib/events.min.js',
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
        })
    ]
};