import {ApplicationPlugin} from '@springroll/core';

(function()
{
    /**
     * @class Application
     */
    const plugin = new ApplicationPlugin('framerate', ['ticker']);

    // Init the animator
    plugin.setup = function()
    {
        /**
         * The framerate container
         * @property {DOMElement} _framerate
         * @private
         */
        const framerate = this._framerate = document.createElement('div');

        // Insert framerate display and set the default text
        framerate.id = 'sr-framerate';
        const target = document.getElementById('sr-display') || document.body;
        framerate.innerHTML = 'FPS: 00.000';
        target.appendChild(framerate);

        // Handle frame updates
        this.on('update', onUpdate, this);
        this.on('resumed', onResume);

    };

    // varables for calculating the framerate
    let frameCount = 0;
    let framerateTimer = 0;

    function onUpdate(elapsed)
    {
        frameCount++;
        framerateTimer += elapsed;

        // Only update the framerate every second
        if (framerateTimer >= 1000)
        {
            let fps = 1000 / framerateTimer * frameCount;
            this._framerate.innerHTML = `FPS: ${fps.toFixed(3)}`;
            framerateTimer = 0;
            frameCount = 0;
        }
    }

    // On resumed application
    // reset the temp variables to not take the framerate display
    function onResume()
    {
        frameCount = framerateTimer = 0;
    }

    // Destroy the animator
    plugin.teardown = function()
    {
        this.off('update', onUpdate, this);
        this.off('resumed', onResume);

        // Remove the framerate container
        this._framerate.parentNode.removeChild(this._framerate);
        this._framerate = null;
    };

}());