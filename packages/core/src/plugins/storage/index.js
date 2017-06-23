import ApplicationPlugin from '../../ApplicationPlugin';
import PersistentStorage from './PersistentStorage';
    
(function()
{
    /**
     * @class Application
     */
    const plugin = new ApplicationPlugin('storage');

    // Init the animator
    plugin.setup = function()
    {
        /**
         * The data instance
         * @property {springroll.Storage} data
         */
        this.storage = new PersistentStorage();
    };

    // Destroy the animator
    plugin.teardown = function()
    {
        this.data = null;
    };

}());