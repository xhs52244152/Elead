const path = require('path')

const isProduction = process.env.NODE_ENV === 'production';

/** @type {import('webpack').Configuration} */
const config = {
    mode: isProduction ? 'production' : 'development',
    entry: {
        'index': './src/index.js',
        'event-bus': './packages/event-bus/index.js',
        'tree-util': './packages/tree-util/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: '[name].umd.js',
        clean: true,
        library: {
            name: 'ErdcKit',
            type: process.env.OUTPUT_TYPE || 'umd',
            export: 'default'
        },
        globalObject: 'globalThis'
    },
    resolve: {
        extensions: ['.js', '.json']
    },
    module: {
        rules: [
            {
                test: /.js$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            }
        ]
    }
};

module.exports = config;
