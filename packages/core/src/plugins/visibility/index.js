import ApplicationPlugin from '../../ApplicationPlugin';
import PageVisibility from './PageVisibility';
    
(function() {

    const plugin = new ApplicationPlugin('visibility');

    // Init the animator
    plugin.setup = function() {
        /**
         * Handles the page visiblity changes automatically
         * to pause and resume the application
         * @memberof {springroll.PageVisibility} springroll.Application#_visibility
         * @private
         */
        const visibility = this._visibility = new PageVisibility(
            () => {
                // Private listener for when the page is shown.
                this.autoPaused = false;
            },
            () => {
                // Private listener for when the page is hidden.
                this.autoPaused = true;
            }
        );

        /**
         * The application pauses automatically when the window loses focus.
         * @member {boolean} springroll.ApplicationOptions#autoPause
         * @default true
         */
        this.options.add('autoPause', true)
            .on('autoPause', value => {
                visibility.enabled = value;
            })
            .respond('autoPause', () => {
                return visibility.enabled;
            });

        /**
         * Setter for if the application is being automatically paused, 
         * usually by the PageVisibility plugin or the ContainerClient plugin.
         * @member {boolean} springroll.ApplicationOptions#autoPaused 
         * @protected
         */
        Object.defineProperty(this, 'autoPaused',
            {
                set(paused) {
                // check if app is manually paused
                    if (!this.paused) {
                        this.internalPaused(paused);
                    }
                }
            });
    };

    // Destroy the animator
    plugin.teardown = function() {
        if (this._visibility) {
            this._visibility.destroy();
        }
        this._visibility = null;
    };

}());