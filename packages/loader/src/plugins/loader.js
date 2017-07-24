import {ApplicationPlugin} from '@springroll/core';
import Loader from '../Loader';

(function() {

    const plugin = new ApplicationPlugin('loader');

    // Init the animator
    plugin.setup = function() {
        /**
         * Reference to the loader.
         * ### module: @springroll/loader
         * @member {springroll.Loader} loader
         * @memberof springroll.Application#
         */
        const loader = this.loader = new Loader(this);

        /**
         * Override the end-user browser cache by adding
         * "?cb=" to the end of each file path requested. Use
         * for development, debugging only!
         * ### module: @springroll/loader
         * @member {boolean} cacheBust
         * @memberof springroll.ApplicationOptions#
         */
        const options = this.options;
        let cacheBust = false;
        // @if DEBUG
        cacheBust = true;
        // @endif
        options.add('cacheBust', cacheBust)
            .respond('cacheBust', function() {
                return loader.cacheManager.cacheBust;
            })
            .on('cacheBust', function(value) {
                loader.cacheManager.cacheBust = (value === 'true' || !!value);
            });

        /**
         * The optional file path to prefix to any relative file
         * requests. This is a great way to load all load requests
         * with a CDN path.
         * ### module: @springroll/loader
         * @member {string} basePath
         * @memberof springroll.ApplicationOptions#
         */
        options.add('basePath');

        /**
         * The current version number for your application. This
         * number will automatically be appended to all file
         * requests. For instance, if the version is "0.0.1" all
         * file requests will be appended with "?v=0.0.1"
         * ### module: @springroll/loader
         * @member {string} version
         * @memberof springroll.ApplicationOptions#
         */
        options.add('version', null, true);

        /**
         * Path to a text file which contains explicit version
         * numbers for each asset. This is useful for controlling
         * the live browser cache. For instance, this text file
         * would have an asset on each line followed by a number:
         * `assets/config/config.json 2` would load
         * `assets/config/config.json?v=2`
         * ### module: @springroll/loader
         * @member {string} versionsFile
         * @memberof springroll.ApplicationOptions#
         */
        options.add('versionsFile', null, true);
    };

    // Preload task
    plugin.preload = function(done) {
        let versionsFile = this.options.versionsFile;

        if (versionsFile) {
            // Try to load the default versions file
            this.loader.cacheManager.addVersionsFile(versionsFile, done);
        }
        else {
            done();
        }
    };

    // Destroy the animator
    plugin.teardown = function() {
        if (this.loader) {
            this.loader.destroy();
            this.loader = null;
        }
    };

}());