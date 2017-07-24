const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {DefinePlugin} = require('webpack');

// const extractCSS = new ExtractTextPlugin('[name].css');
// const extractHTML = new ExtractTextPlugin('[name].html');
const path = require('path');
const pkg = require('./package');

const paths = {
    entries: path.join(__dirname, 'src'),
    output: path.join(__dirname, 'dist'),
    views: path.join(__dirname, 'src', 'views'),
    springroll: path.resolve(__dirname, '..', '..', 'packages')
}

function html(name) {
    return new HtmlWebpackPlugin({
        filename: name + '.html',
        template: path.join(paths.views, name + '.pug'),
        inject: false
    });
}

console.log('NODE_ENV', process.env.NODE_ENV);

const config = {
    resolve: {
        alias: {
            // lerna symlinks don't work for Webpack
            // need to resolve the root name
            '@springroll': path.join(paths.springroll)
        }
    },
    entry: {
        common: paths.entries + '/common.js'
    },
    output: {
        path: paths.output,
        filename: 'js/[name].js'
    },
    // devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'eslint-loader',
                include: paths.entries,
                enforce: 'pre',
                options: {
                    failOnError: true,
                    fix: true
                }
            },
            {
                test: /\.map$/,
                loader: 'source-map-loader',
                enforce: 'pre'
            },
            {
                test: /\.js$/,
                loader: 'buble-loader',
                include: paths.entries
            },
            {
                test: /\.pug$/,
                exclude: /node_modules/,
                loader: 'pug-loader',
                options: {
                    pretty: true
                }
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    use: 'css-loader'
                })
            }
        ]
    },
    plugins: [
        html('index'),
        new DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
            }
        }),
        new ExtractTextPlugin('css/[name].css'),
        new CopyWebpackPlugin([
            {
                from: 'src/assets',
                to: 'assets' 
            }
        ])
    ]
};

pkg.examples.forEach(name => {
    config.entry[name] = `${paths.entries}/${name}.js`;
    config.plugins.push(html(name));
});

module.exports = config;