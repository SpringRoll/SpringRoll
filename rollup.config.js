import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import eslint from 'rollup-plugin-eslint';
import prettier from 'rollup-plugin-prettier';
import uglify from 'rollup-plugin-uglify';
import pkg from './package.json';
import babel from 'rollup-plugin-babel';

export default [
  {
    input: 'src/index.js',
    external: ['ms'],
    output: [
      {
        file: pkg.main,
        format: 'es',
        sourceMap: true
      }
    ],
    plugins: [
      eslint(),
      prettier(),
      resolve({
        module: true,
        jsnext: true,
        main: true,
        browser: true
      }),
      commonjs(),
      babel(),
      uglify({
        sourceMap: true
      })
    ]
  }
];
