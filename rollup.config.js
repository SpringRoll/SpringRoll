import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import eslint from 'rollup-plugin-eslint';
import prettier from 'rollup-plugin-prettier';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import pkg from './package.json';

export default [
  {
    input: 'src/main.js',
    external: ['ms'],
    output: [
      {
        file: pkg.esm,
        format: 'es',
        sourceMap: true
      }
    ],
    plugins: [
      eslint(),
      prettier(),
      babel({
        babelrc: true,
        comments: true,
        runtimeHelpers: true,
        sourceMap: true
      }),
      resolve({
        jsnext: true,
        main: true,
        browser: true
      }),
      commonjs(),
      uglify({
        sourceMap: true
      })
    ]
  }
];
