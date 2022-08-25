import { babel } from '@rollup/plugin-babel';

/**
 * @type {import('rollup').RollupOptions}
 */
export default [
  {
    input: 'src/index.js',
    external: ['react'],
    plugins: [babel({ babelHelpers: 'bundled' })],
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false
    },
    output: [
      {
        preserveModules: true,
        dir: 'dist/es',
        format: 'es'
      },
      {
        dir: 'dist/cjs',
        format: 'cjs',
        exports: 'named',
        interop: 'default'
      }
    ]
  }
];
