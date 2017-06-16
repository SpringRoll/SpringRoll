import ApplicationPlugin from '../ApplicationPlugin';
import StringFilters from '../utils/StringFilters';
    
(function()
{
    /**
     * @class Application
     */
    var plugin = new ApplicationPlugin(110);

    // Init the animator
    plugin.setup = function()
    {
        /**
         * The StringFilters instance
         * @property {springroll.StringFilters} filters
         */
        this.filters = new StringFilters();
    };

    // Destroy the animator
    plugin.teardown = function()
    {
        if (this.filters) this.filters.destroy();
        this.filters = null;
    };

}());