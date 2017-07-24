#!/usr/bin/env node
'use strict';

const rollup = require('rollup');
const path = require('path');
const sass = require('rollup-plugin-sass');
const resolve = require('rollup-plugin-node-resolve');
const preprocess = require('rollup-plugin-preprocess').default;
const uglify = require('rollup-plugin-uglify');
const eslint = require('rollup-plugin-eslint');
const buble = require('rollup-plugin-buble');
const watch = require('rollup-watch');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const chalk = require('chalk');

if (!process.stderr.isTTY) {
    chalk.enabled = false;
}

const production = process.env.NODE_ENV === 'production';
const pkg = require(path.resolve('package'));
const name = path.basename(pkg.name);
const banner = `/*! ${pkg.name} - v${pkg.version} */\n`;
const format = 'cjs';
const entry = 'src/index.js';
const bubleConfig = {
    exclude: [
        'node_modules/**',
        '**/*.sass'
    ]
};

// Add the dependencies to externals
// needed to work with Lerna's internal symlinking
const external = Object.keys(pkg.dependencies || {}).concat(
    Object.keys(pkg.optionalDependencies || {})
);

// Get the command from the arguments
const command = process.argv[2] || null;

let result;

switch(command) {
    case 'watch': {
        devWatch();
        break;
    }
    case 'prod':{
        result = prod();
        break;
    }
    case 'dev': {
        result = dev();
        break;
    }
    case 'clean': {
        result = clean();
        break;
    }
    case null: {
        result = clean().then(dev).then(prod);
        break;
    }
    default: {
        onerror(new Error(`Invalid command "${command}"`));
        process.exit(1);
        break;
    }
}

// Swallow errors, typically these are 
// ESLint errors which are printed out
if (result) {
    result.catch((err) => {
        onerror(err);
        process.exit(1);
    });
}

function onwarn(warning) {
    if (warning.message.indexOf('external dependency') > -1) {
        return;
    }
    const warnSymbol = process.stderr.isTTY ? '⚠️   ' : 'Warning: ';
    console.log(warnSymbol, chalk.bold(warning.message));
    console.log(chalk.cyan(warning.url), '\n');
}

function onerror(error) {
    const errorSymbol = process.stderr.isTTY ? '🚨   ' : 'Error: ';
    console.log(errorSymbol, chalk.bold.red(error));
    if (!production) {
        console.log(chalk.gray(error.stack.replace(/^.*\n/, '')));
    }
    console.log();
}

function clean() {
    const lib = path.resolve('lib');
    rimraf.sync(path.join(lib, '**'));
    mkdirp.sync(lib);
    return Promise.resolve();
}

function devWatch() {
    const watcher = watch(rollup, {
        entry,
        onwarn,
        format,
        banner,
        external,
        sourceMap: true,
        dest: `lib/${name}.js`,
        plugins: [
            resolve(),
            eslint({
                include: 'src/**/*.js',
            }),
            preprocess({
                context: {
                    DEBUG: true,
                    RELEASE: false,
                    VERSION: pkg.version
                }
            }),
            buble(bubleConfig),
            sass({ insert: true })
        ]
    });
    watcher.on('event', (event) => {
        if (event.code === 'BUILD_END') {
            console.log(chalk.white(`Completed build in ${event.duration / 1000} seconds.\n`));
        }
        else if (event.code === 'ERROR') {
            onerror(event.error);
        }
    });
}

function dev() {
    return rollup.rollup({
        entry: 'src/index.js',
        onwarn,
        external,
        plugins: [
            resolve(),
            preprocess({
                context: {
                    DEBUG: true,
                    RELEASE: false,
                    VERSION: pkg.version
                }
            }),
            eslint({
                include: 'src/**/*.js'
            }),
            buble(bubleConfig),
            sass({ insert: true })
        ],
    }).then(bundle => bundle.write({
        format,
        banner,
        sourceMap: true,
        dest: `lib/${name}.js`
    }));
}

function prod() {
    return rollup.rollup({
        entry: 'src/index.js',
        onwarn,
        external,
        plugins: [
            resolve(),
            preprocess({
                context: {
                    DEBUG: false,
                    RELEASE: true,
                    VERSION: pkg.version
                }
            }),
            buble(bubleConfig),
            uglify({
                mangle: true,
                compress: true,
                output: {
                    // Ignore the banner comment
                    comments: function(node, comment) {
                        const {value, type} = comment;
                        if (type === 'comment2') {
                            return value[0] === '!';
                        }
                    }
                }
            }),
            sass({
                insert: true,
                options: {
                    outputStyle: 'compressed'
                }
            })
        ]
    }).then(bundle => bundle.write({
        format,
        banner,
        sourceMap: true,
        dest: `lib/${name}.min.js`
    }));
}
