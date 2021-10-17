import { babel } from '@rollup/plugin-babel';

/**
 * @type {import('rollup').RollupOptions}
 */
export default [
  {
    input: 'src/index.js',
    external: ['react'],
    plugins: [babel({ babelHelpers: 'bundled' })],
    output: [
      {
        file: 'dist/index.es.js',
        format: 'es'
      },
      {
        file: 'dist/index.js',
        format: 'cjs',
        exports: 'named'
      }
    ]
  }
];
