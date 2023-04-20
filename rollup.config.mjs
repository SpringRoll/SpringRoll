import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import eslint from '@rollup/plugin-eslint';
import terser from '@rollup/plugin-terser';
import { babel } from '@rollup/plugin-babel';

const plugins = [
  eslint(),
  nodeResolve({
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
  terser()
];

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/SpringRoll.js',
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
        name: 'springroll',
        extend: true,
        sourceMap: true
      }
    ],
    plugins: plugins
  }
];
