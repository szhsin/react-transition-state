// @ts-check

import { babel } from '@rollup/plugin-babel';

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
  input: 'src/index.js',
  external: ['react'],
  plugins: [babel({ babelHelpers: 'bundled' })],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false
  },
  output: [
    {
      dir: 'dist/cjs',
      format: 'cjs',
      interop: 'default',
      exports: 'named',
      entryFileNames: '[name].cjs',
      preserveModules: true
    },
    {
      dir: 'dist/esm',
      format: 'es',
      entryFileNames: '[name].mjs',
      preserveModules: true
    }
  ]
};
