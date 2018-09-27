import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import eslint from 'rollup-plugin-eslint';
import prettier from 'rollup-plugin-prettier';
import uglify from 'rollup-plugin-uglify';
import pkg from './package.json';
import babel from 'rollup-plugin-babel';

const prettierConfig = require('./.prettierrc');

const plugins = [
  eslint(),
  prettier(prettierConfig),
  resolve({
    module: true,
    jsnext: true,
    main: true,
    browser: true,
    preferBuiltins: false
  }),
  commonjs({
    namedExports: {
      'bellhop-iframe': ['Bellhop']
    }
  }),
  babel(),
  uglify()
];

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: pkg.module,
        format: 'es'
      }
    ],
    plugins: plugins
  },
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/SpringRoll-umd.js',
        format: 'umd',
        name: 'window',
        extend: true,
        sourceMap: true
      }
    ],
    plugins: plugins
  }
];
