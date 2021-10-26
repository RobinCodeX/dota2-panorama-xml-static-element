import rollupTypescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

module.exports = [
    {
        input: 'src/index.ts',
        output: {
            file: 'package/index.js',
            sourcemap: true,
            format: 'cjs',
        },
        external: ['glob', 'xml-formatter', 'xmldom', 'fs/promises'],
        plugins: [
            rollupTypescript(require('./tsconfig.json').compilerOptions),
            commonjs({ extensions: ['.js', '.ts'] }),
            nodeResolve(),
        ],
    },
];
