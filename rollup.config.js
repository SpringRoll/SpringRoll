import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import eslint from 'rollup-plugin-eslint';
import prettier from 'rollup-plugin-prettier';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

export default [
  {
    input: 'src/main.js',
    external: ['ms'],
    output: [{ file: pkg.esm, format: 'es' }],
    plugins: [
      eslint(),
      prettier(),
      babel({
        babelrc: true,
        comments: true,
        runtimeHelpers: true
      }),
      resolve({
        jsnext: true,
        main: true,
        browser: true
      }),
      commonjs()
    ]
  }
];
