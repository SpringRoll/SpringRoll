import {ApplicationPlugin} from '@springroll/core';
import Languages from '../Languages';
// @if DEBUG
import {Debug} from '@springroll/debug';
// @endif

(function() {

    const plugin = new ApplicationPlugin('languages');

    plugin.setup = function() {
        /**
         * The StringFilters instance
         * ### module: @springroll/languages
         * @member {springroll.Languages} languages
         * @memberof springroll.Application#
         */
        this.languages = new Languages();

        /**
         * Force a specific language
         * ### module: @springroll/languages
         * @member {string} language
         * @memberof springroll.ApplicationOptions#
         * @default null
         */
        this.options.add('language', null, true);

        /**
         * The path to the languages configuration file
         * ### module: @springroll/languages
         * @member {string} languagesPath
         * @memberof springroll.ApplicationOptions#
         * @default null
         */
        this.options.add('languagesPath', null, true);
    };

    // preload the language configuration
    plugin.preload = function(done) {

        const languagesConfig = this.options.languagesPath;
        
        if (languagesConfig) {
            this.load(languagesConfig, config => {
                this.languages.setConfig(config);
                let lang = this.options.language;
                if (lang) {
                    this.languages.setLanguage(lang);
                }
                done();
            });
        }
        else {
            // @if DEBUG
            Debug.info('Application option \'languagesPath\' is empty, set to automatically load languages configuration.');
            // @endif
            done();
        }
    };

    // Destroy the animator
    plugin.teardown = function() {
        if (this.languages) {
            this.languages.destroy();
        }
        this.languages = null;
    };

}());