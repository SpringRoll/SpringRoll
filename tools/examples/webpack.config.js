const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractCSS = new ExtractTextPlugin('[name].css');

module.exports = {
    entry: {
        example: './src/example.js'
    },
    output: {
        path: __dirname + '/deploy/dist',
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: extractCSS.extract({
                    use:'css-loader'
                })
            }
        ]
    },
    plugins: [
        extractCSS
    ]
};