import ApplicationPlugin from '../../ApplicationPlugin';
import include from '../../utils/include';

(function() {

    /**
     * @class Application
     */
    var plugin = new ApplicationPlugin(120);

    plugin.setup = function()
    {
        const options = this.options;

        /**
         * Use the query string parameters for options overrides
         * @property {Boolean} options.useQueryString
         * @default false
         */
        let useQueryString = false;
        // @if DEBUG
        useQueryString = true;
        // @endif
        options.add('useQueryString', useQueryString, true);

        /**
         * The name of the application
         * @property {String} options.name
         * @default ''
         */
        options.add('name', '', true);
    };

}());
