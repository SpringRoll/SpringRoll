const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// const extractCSS = new ExtractTextPlugin('[name].css');
// const extractHTML = new ExtractTextPlugin('[name].html');
const path = require('path');

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

const examples = [
    // 'asset-caching',
    'basic',
    // 'captions-sound',
    // 'captions',
    // 'color-alpha',
    // 'cutscene',
    // 'index',
    // 'loader',
    // 'max-width',
    // 'multiple-displays',
    // 'sound',
    // 'states',
    // 'tween',
    // 'ui'
];

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
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'eslint-loader',
                include: path.resolve('src'),
                enforce: 'pre',
                options: {
                    failOnError: true,
                    fix: true
                }
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
                // exclude: /node_modules/,
                loader: ExtractTextPlugin.extract({
                    use: 'css-loader'
                })
            }
        ]
    },
    plugins: [
        html('index'),
        new ExtractTextPlugin('css/[name].css'),
        new CopyWebpackPlugin([
            {
                from: 'src/assets',
                to: 'assets' 
            }
        ])
    ]
};

examples.forEach(name => {
    config.entry[name] = `${paths.entries}/${name}.js`;
    config.plugins.push(html(name));
});

module.exports = config;