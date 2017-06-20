#!/usr/bin/env node
'use strict';

const rollup = require('rollup');
const path = require('path');
const less = require('rollup-plugin-less');
const preprocess = require('rollup-plugin-preprocess').default;
const CleanCSS = require('less-plugin-clean-css');
const uglify = require('rollup-plugin-uglify');
const eslint = require('rollup-plugin-eslint');
const watch = require('rollup-watch');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const chalk = require('chalk');

if (!process.stderr.isTTY) chalk.enabled = false;

const pkg = require(path.resolve('package'));
const eslintConfig = require('./eslintConfig');
const name = path.basename(pkg.name);
const moduleName = 'springroll';
const banner = `/*! ${pkg.name} - v${pkg.version} */\n`;
const format = 'cjs';
const entry = 'src/index.js';

const command = process.argv[2] || null;

let result;

switch(command) {
    case 'watch': {
        return devWatch();
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
result.catch((err) => {
    onerror(err);
    process.exit(1);
});

function onwarn(warning) {
    const warnSymbol = process.stderr.isTTY ? '⚠️   ' : 'Warning: ';
    console.log(warnSymbol, chalk.bold(warning.message));
    console.log(chalk.cyan(warning.url), '\n');
}

function onerror(error) {
    const errorSymbol = process.stderr.isTTY ? '🚨   ' : 'Error: ';
    console.log(errorSymbol, chalk.bold.red(error), '\n');
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
        moduleName,
        dest: `lib/${name}.js`,
        plugins: [
            eslint(Object.assign({
                include: 'src/**/*.js',
                fix: true
            }, eslintConfig)),
            preprocess({
                context: {
                    DEBUG: true,
                    RELEASE: false,
                    VERSION: pkg.version
                }
            }),
            less({
                output: `lib/${name}.css`
            })
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
        plugins: [
            eslint(Object.assign({
                include: 'src/**/*.js',
                fix: true
            }, eslintConfig)),
            preprocess({
                context: {
                    DEBUG: true,
                    RELEASE: false,
                    VERSION: pkg.version
                }
            }),
            less({
                output: `lib/${name}.css`
            })
        ],
    }).then(bundle => bundle.write({
        format,
        banner,
        moduleName,
        dest: `lib/${name}.js`
    }));
}

function prod() {
    return rollup.rollup({
        entry: 'src/index.js',
        onwarn,
        plugins: [
            preprocess({
                context: {
                    DEBUG: false,
                    RELEASE: true,
                    VERSION: pkg.version
                }
            }),
            uglify({
                mangle: true,
                compress: true,
                output: {
                    // Ignore the banner comment
                    comments: function(node, comment) {
                        const {value, type} = comment;
                        if (type == 'comment2') {
                            return value[0] === '!';
                        }
                    }
                }
            }),
            less({
                output: `lib/${name}.min.css`,
                plugins: [new CleanCSS({
                    advanced: true
                })]
            })
        ]
    }).then(bundle => bundle.write({
        format,
        banner,
        moduleName,
        dest: `lib/${name}.min.js`
    }));
}
