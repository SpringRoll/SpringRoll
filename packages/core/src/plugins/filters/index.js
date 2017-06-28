import ApplicationPlugin from '../../ApplicationPlugin';
import StringFilters from './StringFilters';
    
(function() {

    const plugin = new ApplicationPlugin('filters');

    // Init the animator
    plugin.setup = function() {
        /**
         * The StringFilters instance
         * @member {springroll.StringFilters} springroll.Application#filters
         */
        this.filters = new StringFilters();
    };

    // Destroy the animator
    plugin.teardown = function() {
        if (this.filters) {
            this.filters.destroy();
        }
        this.filters = null;
    };

}());