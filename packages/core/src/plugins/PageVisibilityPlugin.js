import ApplicationPlugin from '../ApplicationPlugin';
import PageVisibility from '../utils/PageVisibility';
    
(function()
{
    /**
     * @class Application
     */
    var plugin = new ApplicationPlugin();

    // Init the animator
    plugin.setup = function()
    {
        /**
         * Handles the page visiblity changes automatically
         * to pause and resume the application
         * @property {springroll.PageVisibility} _visibility
         * @private
         */
        var visibility = this._visibility = new PageVisibility(
            onVisible.bind(this),
            onHidden.bind(this)
        );

        /**
         * The application pauses automatically when the window loses focus.
         * @property {Boolean} options.autoPause
         * @default true
         */
        this.options.add('autoPause', true)
            .on('autoPause', function(value)
            {
                visibility.enabled = value;
            })
            .respond('autoPause', function()
            {
                return visibility.enabled;
            });

        /**
         * Setter for if the application is being automatically paused, 
         * usually by the PageVisibility plugin or the ContainerClient plugin.
         * @property {Boolean} autoPaused 
         * @protected
         */
        Object.defineProperty(this, 'autoPaused',
        {
            set: function(paused)
            {
                // check if app is manually paused
                if (!this.paused)
                {
                    this.internalPaused(paused);
                }
            }
        });
    };

    /**
     * Private listener for when the page is hidden.
     * @method onHidden
     * @private
     */
    var onHidden = function()
    {
        this.autoPaused = true;
    };

    /**
     * Private listener for when the page is shown.
     * @method onVisible
     * @private
     */
    var onVisible = function()
    {
        this.autoPaused = false;
    };

    // Destroy the animator
    plugin.teardown = function()
    {
        if (this._visibility) this._visibility.destroy();
        this._visibility = null;
    };

}());