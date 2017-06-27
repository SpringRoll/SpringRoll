import {ApplicationPlugin} from '@springroll/core';
import Languages from '../../Languages';
// @if DEBUG
import {Debug} from '@springroll/debug';
// @endif

(function()
{
    /**
     * @class Application
     */
    const plugin = new ApplicationPlugin('languages');

    // Init the animator
    plugin.setup = function()
    {
        /**
         * The StringFilters instance
         * @property {springroll.Languages} languages
         */
        this.languages = new Languages();

        /**
         * Force a specific language
         * @property {String} options.language
         * @default null
         */
        this.options.add('language', null, true);

        /**
         * The path to the languages configuration file
         * @property {String} options.languagesPath
         * @default null
         */
        this.options.add('languagesPath', null, true);
    };

    // preload the language configuration
    plugin.preload = function(done)
    {
        const languagesConfig = this.options.languagesPath;
        
        if (languagesConfig)
        {
            this.load(languagesConfig, config => 
            {
                this.languages.setConfig(config);
                var lang = this.options.language;
                if (lang)
                {
                    this.languages.setLanguage(lang);
                }
                done();
            });
        }
        else
        {
            // @if DEBUG
            Debug.info('Application option \'languagesPath\' is empty, set to automatically load languages configuration.');
            // @endif
            done();
        }
    };

    // Destroy the animator
    plugin.teardown = function()
    {
        if (this.languages)
        {
            this.languages.destroy();
        }
        this.languages = null;
    };

}());