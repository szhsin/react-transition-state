import { defineConfig } from 'rolldown';
import { addDirective } from 'rollup-plugin-add-directive';

export default defineConfig({
  input: 'src/index.js',
  external: ['react'],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false
  },
  output: [
    {
      dir: 'dist/cjs',
      format: 'cjs',
      exports: 'named',
      entryFileNames: '[name].cjs',
      preserveModules: true,
      // Temporary workaround until this issue is fixed:
      // https://github.com/rolldown/rolldown/issues/5865
      plugins: [addDirective({ directive: "'use strict';" })]
    },
    {
      dir: 'dist/esm',
      format: 'esm',
      entryFileNames: '[name].mjs',
      preserveModules: true
    }
  ],
  transform: {
    target: ['es2020'],
    assumptions: {
      noDocumentAll: true
    },
    define: {
      'process.env.NODE_ENV': 'process.env.NODE_ENV'
    }
  }
});
