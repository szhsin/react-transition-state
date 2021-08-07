import { terser } from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';

const baseConfig = {
    input: 'src/index.js',
    external: ['react']
}

/**
 * @type {import('rollup').RollupOptions}
 */
export default [
    {
        ...baseConfig,
        output: {
            file: 'dist/index.es.js',
            format: 'es'
        }
    },
    {
        ...baseConfig,
        output: [
            {
                file: 'dist/index.js',
                format: 'cjs'
            },
            {
                file: 'dist/index.min.js',
                format: 'cjs',
                plugins: [terser()]
            }
        ],
        plugins: [babel({ babelHelpers: 'bundled' })]
    }
];
